---
title: Về Concurrency trong Go HTTP Servers
description: Về Concurrency trong Go HTTP Servers
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

# Về Concurrency trong Go HTTP Servers

Package có sẵn `net/http` của Go rất tiện lợi và hiệu năng cao, nó giúp việc phát triển cả web servers trở nên dễ dàng hơn. Để đạt được hiệu năng tốt thì `net/http` sử dụng concurrency; mặc dù đúng thật là nó đem lại hiệu năng rất tốt tuy nhiên cũng kèm theo một số vấn đề. Ta sẽ tìm hiểu về trong bài viết này.

## Đảm bảo handlers truy cập đồng thời vào data một khác an toàn

Bắt đầu bằng một ví dụ đơn giản - một HTTP server cho một bảng đếm - cho phép user truy cập. Ta có thể tạo counters (hoặc set giá trị của những counters đang tồn tại) bằng query `set?name=N&val=V`, lấy giá trị của chúng bằng query `get?name=N` và tăng giá trị với query `inc?name=N`.

Đây là một ví dụ cách user tương tác với server:

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

Và đây là một server cơ bản có các chức năng trên:

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

Đoạn code trên rất đơn giản, quá đơn giản, đơn giản đến mức sai 😂. Ta đã sử dụng `curl` theo trình tự, từng request một. Vấn đề xảy ra khi xuất hiện các connection đồng thời. Có một cách để giả lập concurrent connections là sử dụng [ApacheBench](https://en.wikipedia.org/wiki/ApacheBench):

```bash
$ ab -n 20000 -c 200 "127.0.0.1:8000/inc?name=i"

Benchmarking 127.0.0.1 (be patient)
Completed 2000 requests
Completed 4000 requests

Test aborted after 10 failures

apr_socket_connect(): Connection reset by peer (104)
Total of 4622 requests completed
```

Oops... điều gì xảy ra vậy? Hãy check logs của server, ta sẽ thấy :

```bash
<normal server logs>
fatal error: concurrent map writes

goroutine 6118 [running]:
runtime.throw(0x6b0a5c, 0x15)
  /usr/local/go/src/runtime/panic.go:608 +0x72 fp=0xc00060dba8 sp=0xc00060db78 pc=0x42ba12
```

Handler của chúng ta có thể chạy concurrently nhưng chúng đều đang cố gắng thay đổi `CounterStore`. Điều này dẫn tới _race condition_ vì trong [Go, map operations are not atomic](https://golang.org/doc/faq#atomic_maps). May mắn là Go runtime phát hiện ra điều này và dừng lại với một thông báo hữu ích; nếu dữ liệu bị thay đổi mà không có thông báo thì sẽ tệ hơn nhiều.

Giải pháp đơn giản nhất là tuần tự hóa các truy cập đến map sử dụng mutex.

The simplest solution is to serialize all map accesses using a mutex. Dưới đây là một đoạn code trích từ [ví dụ hoàn chỉnh](https://github.com/ducnguyen96/ducnguyen96.github.io/static/code/blog/gohttpconcurrency/mutex-server.go):

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

Có 2 thay đổi cần chú ý:

1. chúng ta nhúng `sync.Mutex` vào `CounterStore`, mỗi handler bắt đầu bằng việc lock mutex và defer unlock.
2. Thay đổi hàm `inc` sử dụng pointer `*CounterStore` - các methods thay đổi dữ liệu luôn nên được defined với pointer receivers. Pointers receivers là một phần [cực kỳ quan trọng khi sử dụng mutexes](/blog/2018/beware-of-copying-mutexes-in-go).

Chạy lại `ab` benchmark ta sẽ thấy race condition không còn nữa, server đã được fixed.

## Đồng bộ hóa sử dụng channels so với sử dụng mutexes

Đối với những lập trình viên có kinh nghiệm thì việc thêm mutex để đồng bộ hóa truy cập tới `CounterStore` là một giải pháp đương nhiên. Tuy nhiên một trong những khẩu hiệu của Go là _"Chia sẻ bộ nhớ bằng cách giao tiếp, đừng giao tiếp bằng cách chia sẻ dữ liệu"_, liệu có áp dụng ở đây ?

Thay vì sử dụng mutexes thì ta có thể dùng channels để đồng bộ hóa truy cập đến dữ liệu được chia sẻ. [Code mẫu này](https://github.com/ducnguyen96/ducnguyen96.github.io/static/code/blog/gohttpconcurrency/channel-manager-server.go) thay thế mutexes bằng channels. Bắt đầu bằng việc define một "counter manager" là một background goroutine truy cập tới một closure - nơi lưu trữ data.

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

Thay vì truy cập trực tiếp vào map của counters, handlers sẽ gửi `Commands` tới một channel và sẽ nhận được phản hồi qua một channel khác.

Object được shared cho các handlers bây giờ là một `Server`:

```go
type Server struct {
  cmds chan<- Command
}
```

Và đây là `inc` handler:

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

Mỗi handler sẽ gọi tới manager một cách đồng bộ; gửi `Command` sẽ block và handler sẽ tiếp tục chạy khi reply channel nhận được tín hiệu. Chú ý là ở đây không dùng mutex, ta có thể loại bỏ được mutex vì tại 1 thời điểm chỉ có 1 goroutine duy nhất có thể truy cập data.

Mặc dù trông có vẻ như một kỹ thụât thú vị, đối với ví dụ của chúng ta thì dùng channels là overkill. Trên thực tế thì việc sử dụng channels nhiều quá mức là một trong những vấn đề thường gặp ở Go beginers. Trích từ [Go Wiki entry](https://github.com/golang/go/wiki/MutexOrChannel):

> Mọi vấn đề liên quan đến locking đều có thể được giải quyết bằng channels hoặc locks.
>
> Vậy bạn nên sử dụng cái nào?
>
> Sử dụng cái nào đơn giản nhất.

Thường thì mutexes được preferred hơn để bảo vệ shared state vì mutex cho cảm giác tự nhiên hơn.

## Giới hạn sự truy cập đồng thời gian server

Ngoài vấn đề đồng bộ thì một vấn đề khác là overloading. Chẳng hạn bạn expose server cho internet và không có bất cứ biện pháp bảo vệ nào thì server của bạn rất dễ bị đánh sập bằng DoS. Điều này có cũng thể xảy ra một cách không chủ ý. Trong những trường hợp như vậy thì sập server là không thể tránh khỏi nhưng nên tránh hậu quả nghiêm trọng.

Điều này rất dễ thực hiện trong Go, và cũng có nhiều cách khác nhau. Một trong những cách đơn giản nhất là rate limiting - có nghĩa là sẽ hạn chế số lượng connections đồng thời, hoặc giới hạn số connections theo đơn vị thời gian. Với cách tiếp cận thứ nhất thì ta có thể sử [middlewares](https://github.com/ducnguyen96/ducnguyen96.github.io/static/code/blog/gohttpconcurrency/mutex-server-rate-limited.go)

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

Bọc handler với middleware trên

```go
// Limit to max 10 connections for this handler.
http.HandleFunc("/inc", limitNumClients(store.inc, 10))
```

Điều này đảm bảo rằng không có nhiều hơn 10 clients có thể chạy `inc` một cách đồng thời [^1]. Việc mở rộng ví dụ trên sử dụng một channel duy nhất để hạn chế truy cập trên nhiều handlers cũng không quá khó khăn, hoặc bạn có thể sử dụng một giải pháp hơi overkill hơn là giới hạn số connections đồng thời ở mức độ listener sử dụng [netutil.LimitListener](https://godoc.org/golang.org/x/net/netutil#LimitListener).

Một cách tiếp cận khác là giới hạn thời gian. Thay vì "không có nhiều hơn 10 requests cùng thời điểm" thì ta sử dụng "không có nhiều hơn 1 request mỗi 50ms". Go cung cấp cho ta một channel để có thể dễ dàng thực hiện điều này - `time.Tick`, có thể xem ví dụ [ở đây](https://gobyexample.com/rate-limiting)

## Phụ lục: where net.http goes concurrent

Với những ai muốn tìm hiểu về cách mà `net/http` thực hiện concurrency thì có thể xem code ở https://golang.org/src/net/http/server.go để tham khảo.

`ListenAndServe` sẽ chạy `Serve` - thằng này gọi `Accept` trong một vòng lặp. `Accept` tương tự với `accept` syscall trong socket, tạo một connection mới khi mà có client accepted, connection này sau đó được sử dụng để tương tác với client nó có type là `type conn` - là một private type chứa server state. Hàm `serve` sau đó đọc dữ liệu cần thiết và chạy các handlers đã được đăng ký trước.

`http.Server.Serve` gọi `conn.serve` như sau:

```go
go c.serve(ctx)
```

Concurrency nằm ở đây. Từ đây trở đi thì có 1 goroutine riêng sẽ handle connection này.

## Sources

- https://eli.thegreenplace.net/2019/on-concurrency-in-go-http-servers

[^1]: For a somewhat more robust approach, we could `select` between grabbing the semaphore and request's `Context.Done()` channel, to ensure that cancelled requests don't take place in line for the semaphore. A full treatment of robust context handling it outside the scope of this post, however.
