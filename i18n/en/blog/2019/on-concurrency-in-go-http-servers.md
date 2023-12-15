---
title: On Concurrency in Go HTTP Servers
description: A discussion of concurrency in Go HTTP servers, with a focus on the standard library.
authors:
  - eliben
  - ducnguyen96
tags:
  [
    go,
    backend,
    http,
    server,
    concurrency,
    goroutine,
    channel,
    buffered channel,
    unbuffered channel,
    select,
    mutex,
    semaphore,
    waitgroup,
    context,
    context cancellation,
    context timeout,
    context deadline,
  ]
hide_table_of_contents: false
---

# On Concurrency in Go HTTP Servers

Go's built-in `net/http` package is convenient, solid and performant, making it easy to write production-grade web servers. To be performant, `net/http` automatically employs concurrency; while this is great for high loads, it can also lead to some gotchas. In this post I want to explore this topic a bit.

## Ensuring safe concurrent access from handlers to data

Let's start with a very simple example of a HTTP server that implements a table of counters accessible to the user. We can create counters (or set values of existing counters) with the `set?name=N&val=V` query, get their values with the `get?name=N` query and increment them with the `inc?name=N` query. Here's a simple interaction recorded with a server running in the background on port 8000:

```bash
$ curl "localhost:8000/set?name=x&val=0"
ok
$ curl "localhost:8000/get?name=x"
x: 0
$ curl "localhost:8000/inc?name=x"
ok
$ curl "localhost:8000/get?name=x"
x: 1
```

And a basic server implementing this functionality:

```go
package main

import (
  "fmt"
  "log"
  "net/http"
  "os"
  "strconv"
)

type CounterStore struct {
  counters map[string]int
}

func (cs CounterStore) get(w http.ResponseWriter, req *http.Request) {
  log.Printf("get %v", req)
  name := req.URL.Query().Get("name")
  if val, ok := cs.counters[name]; ok {
    fmt.Fprintf(w, "%s: %d\n", name, val)
  } else {
    fmt.Fprintf(w, "%s not found\n", name)
  }
}

func (cs CounterStore) set(w http.ResponseWriter, req *http.Request) {
  log.Printf("set %v", req)
  name := req.URL.Query().Get("name")
  val := req.URL.Query().Get("val")
  intval, err := strconv.Atoi(val)
  if err != nil {
    fmt.Fprintf(w, "%s\n", err)
  } else {
    cs.counters[name] = intval
    fmt.Fprintf(w, "ok\n")
  }
}

func (cs CounterStore) inc(w http.ResponseWriter, req *http.Request) {
  log.Printf("inc %v", req)
  name := req.URL.Query().Get("name")
  if _, ok := cs.counters[name]; ok {
    cs.counters[name]++
    fmt.Fprintf(w, "ok\n")
  } else {
    fmt.Fprintf(w, "%s not found\n", name)
  }
}

func main() {
  store := CounterStore{counters: map[string]int{"i": 0, "j": 0}}
  http.HandleFunc("/get", store.get)
  http.HandleFunc("/set", store.set)
  http.HandleFunc("/inc", store.inc)

  portnum := 8000
  if len(os.Args) > 1 {
    portnum, _ = strconv.Atoi(os.Args[1])
  }
  log.Printf("Going to listen on port %d\n", portnum)
  log.Fatal(http.ListenAndServe("localhost:"+strconv.Itoa(portnum), nil))
}
```

This code is simple; _too simple_, in fact, to the degree that it's wrong. Our sample `curl` session sends all its requests in a serial manner. The problems appear when concurrent connections are present, however. A good way to simulate many concurrent connections is with [ApacheBench](https://en.wikipedia.org/wiki/ApacheBench):

```bash
$ ab -n 20000 -c 200 "127.0.0.1:8000/inc?name=i"

Benchmarking 127.0.0.1 (be patient)
Completed 2000 requests
Completed 4000 requests

Test aborted after 10 failures

apr_socket_connect(): Connection reset by peer (104)
Total of 4622 requests completed
```

Oops... what happened? Checking the logs of the Go server, we'll see something like:

```bash
<normal server logs>
fatal error: concurrent map writes

goroutine 6118 [running]:
runtime.throw(0x6b0a5c, 0x15)
  /usr/local/go/src/runtime/panic.go:608 +0x72 fp=0xc00060dba8 sp=0xc00060db78 pc=0x42ba12
```

Reviewing our code, the problem is apparent. The request handlers can run concurrently but they all manipulate a shared `CounterStore`. For example, the `inc` handler is being called concurrently for multiple requests and attempts to mutate the map. This leads to a race condition since in [Go, map operations are not atomic](https://golang.org/doc/faq#atomic_maps). Luckily, the Go runtime detects this and dies with a helpful message; it would be worse if data were silently corrupted.

The simplest solution is to serialize all map accesses using a mutex. Here's an excerpt from a [complete code sample](https://github.com/eliben/code-for-blog/blob/master/2019/gohttpconcurrency/mutex-server.go) that implements this:

```go
type CounterStore struct {
  sync.Mutex
  counters map[string]int
}

func (cs *CounterStore) inc(w http.ResponseWriter, req *http.Request) {
  log.Printf("inc %v", req)
  cs.Lock()
  defer cs.Unlock()
  name := req.URL.Query().Get("name")
  if _, ok := cs.counters[name]; ok {
    cs.counters[name]++
    fmt.Fprintf(w, "ok\n")
  } else {
    fmt.Fprintf(w, "%s not found\n", name)
  }
}
```

Note two changes:

1. We embed a `sync.Mutex` in `CounterStore`, and each handler starts by locking the mutex (and deferring an unlock).
2. We change the receiver `inc` is defined on to a pointer `*CounterStore`. In fact, the previous version of the code was wrong in this respect - methods that modify data should always be defined with pointer receivers. We got lucky that the data was shared at all with value receivers because maps are reference types. Pointer receivers are [particularly critical when mutexes are involved](/blog/2018/beware-of-copying-mutexes-in-go).

If we rerun the `ab` benchmark with this fixed server, it passes; the race condition is gone.

## Synchronizing with channels vs. mutexes

To programmers experienced in most other languages, adding a mutex to synchronize accesses to a `CounterStore` is a natural solution. One of the mottos of Go is, however, _"Share memory by communicating, don't communicate by sharing memory"_. Does this apply here?

Instead of mutexes, we could use channels to synchronize access to shared data. This [code sample](https://github.com/eliben/code-for-blog/blob/master/2019/gohttpconcurrency/channel-manager-server.go) reimplements the mutex-using server to use channels instead. We start by defining a "counter manager" which is a background goroutine with access to a closure that stores the actual data:

```go
type CommandType int

const (
  GetCommand = iota
  SetCommand
  IncCommand
)

type Command struct {
  ty        CommandType
  name      string
  val       int
  replyChan chan int
}

func startCounterManager(initvals map[string]int) chan<- Command {
  counters := make(map[string]int)
  for k, v := range initvals {
    counters[k] = v
  }

  cmds := make(chan Command)

  go func() {
    for cmd := range cmds {
      switch cmd.ty {
      case GetCommand:
        if val, ok := counters[cmd.name]; ok {
          cmd.replyChan <- val
        } else {
          cmd.replyChan <- -1
        }
      case SetCommand:
        counters[cmd.name] = cmd.val
        cmd.replyChan <- cmd.val
      case IncCommand:
        if _, ok := counters[cmd.name]; ok {
          counters[cmd.name]++
          cmd.replyChan <- counters[cmd.name]
        } else {
          cmd.replyChan <- -1
        }
      default:
        log.Fatal("unknown command type", cmd.ty)
      }
    }
  }()
  return cmds
}
```

Instead of accessing the map of counters directly, handlers will send `Commands` on a channel and will receive replies on a reply channel they provide.

The shared object for the handlers will now be a `Server`:

```go
type Server struct {
  cmds chan<- Command
}
```

And here's the `inc` handler:

```go
func (s *Server) inc(w http.ResponseWriter, req *http.Request) {
  log.Printf("inc %v", req)
  name := req.URL.Query().Get("name")
  replyChan := make(chan int)
  s.cmds <- Command{ty: IncCommand, name: name, replyChan: replyChan}

  reply := <-replyChan
  if reply >= 0 {
    fmt.Fprintf(w, "ok\n")
  } else {
    fmt.Fprintf(w, "%s not found\n", name)
  }
}
```

Each handler deals with the manager synchronously; the `Command` send is blocking, and so is the read from the reply channel. But note - not a mutex in sight! Mutual exclusion is accomplished by a single goroutine having access to the actual data.

While it certainly looks like an interesting technique, for our particular use case this approach seems like an overkill. In fact, overuse of channels is one of the common gotchas for Go beginners. Quoting from the [Go Wiki entry](https://github.com/golang/go/wiki/MutexOrChannel):

> Most locking issues can be solved using either channels or traditional locks.
>
> So which should you use?
>
> Use whichever is most expressive and/or most simple.

It then goes on to suggest that mutexes are preferable for protecting shared state. I tend to agree, since a mutex feels more natural here.

## Limiting the degree of concurrency for our server

In addition to synchronization, another aspect of concurrency we have to worry about is overloading of the server. Imagine exposing a server to the internet - without any safeguards it would be fairly easy to bring it down with a denial of service (DoS) attack. That could happend even unintentionally, if we didn't provision the proper computing power behind the service. In these cases failure is unavoidable but should be graceful.

It's very easy to do these things in Go, and there are many strategies. One of the simplest is rate limiting, which can mean either restricting the number of simultaneous connections, or restricting the number of connections per unit of time. For the former, we can add some middleware ([full code here](https://github.com/eliben/code-for-blog/blob/master/2019/gohttpconcurrency/mutex-server-rate-limited.go)):

```go
// limitNumClients is HTTP handling middleware that ensures no more than
// maxClients requests are passed concurrently to the given handler f.
func limitNumClients(f http.HandlerFunc, maxClients int) http.HandlerFunc {
  // Counting semaphore using a buffered channel
  sema := make(chan struct{}, maxClients)

  return func(w http.ResponseWriter, req *http.Request) {
    sema <- struct{}{}
    defer func() { <-sema }()
    f(w, req)
  }
}
```

And wrap a handler using it:

```go
// Limit to max 10 connections for this handler.
http.HandleFunc("/inc", limitNumClients(store.inc, 10))
```

This ensures that no more than 10 simultaneous clients will be allowed to invoke the `inc` handler [^1]. It should be simple to extend this approach to share a single limiting channel between multiple handlers. Or we could use a more heavy-handed solution and limit the number of simulatenous connections at the listener level, using something like [netutil.LimitListener](https://godoc.org/golang.org/x/net/netutil#LimitListener).

An alternative approach to rate limiting is time-based. Instead of saying "no more than 10 requests at a time", we can say "no more than one request in a 50 millisecond period". Go provides the convenient `time.Tick` channel that makes it easy to implement, as [this Go example](https://gobyexample.com/rate-limiting) demonstrates. Adjusting this approach to our sample server is left as an exercise to the reader.

## Appendix: where net.http goes concurrent

This is a brief technical appendix, for folks interested following through the code of Go's `net/http` package to see where the concurrency is actually implemented.

The relevant source code for the serving part of `net/http` is in https://golang.org/src/net/http/server.go

`ListenAndServe` invokes Serve, which calls `Accept` in a loop. `Accept` is similar to the socket `accept` syscall, creating a new connection whenever a new client is accepted; the connection is then used for interacting with the client. This connection is `type conn` in the `server.go` file, a private type with server state for each client connection. Its `serve` method actually serves a connection, pretty much as you would expect; it reads some data from the client and invokes the user-supplied handler depending on the path.

`http.Server.Serve` calls `conn.serve` as:

```go
go c.serve(ctx)
```

Wherein lies the concurrency. From this point on, a separate goroutine handles this connection. This is why multiple goroutines could be executing user-specified handlers (including a single handler) at any given time.

## Sources

- https://eli.thegreenplace.net/2019/on-concurrency-in-go-http-servers

[^1]: For a somewhat more robust approach, we could `select` between grabbing the semaphore and request's `Context.Done()` channel, to ensure that cancelled requests don't take place in line for the semaphore. A full treatment of robust context handling it outside the scope of this post, however.
