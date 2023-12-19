---
title: Beware of copying mutexes in Go
description: Beware of copying mutexes in Go.
authors:
  - eliben
  - ducnguyen96
tags: [Go, Concurrency]
hide_table_of_contents: false
---

# Beware of copying mutexes in Go

Suppose we have a `struct` that contains a map, and we want to modify the map in a method. Here's a [simple example](https://github.com/ducnguyen96/ducnguyen96.github.io/tree/master/static/code/docs/go/go-copying-mutex):

```go
package main

import "fmt"

type Container struct {
  counters map[string]int
}

func (c Container) inc(name string) {
  c.counters[name]++
}

func main() {
  c := Container{counters: map[string]int{"a": 0, "b": 0}}

  doIncrement := func(name string, n int) {
    for i := 0; i < n; i++ {
      c.inc(name)
    }
  }

  doIncrement("a", 100000)

  fmt.Println(c.counters)
}
```

A `Container` holds a map of counters, keyed by name. Its `inc` method increments the specified counter (let's assume that the counter already exists). main calls `inc` many times in a loop.

If we run this snippet, it will print out:

```bash
map[a:100000 b:0]
```

Now say that we want two goroutines to call `inc` concurrently. Since we are wary of race conditions, we'll use a `Mutex` to lock around the critical region:

```go
package main

import (
  "fmt"
  "sync"
  "time"
)

type Container struct {
  sync.Mutex                       // <-- Added a mutex
  counters map[string]int
}

func (c Container) inc(name string) {
  c.Lock()                         // <-- Added locking of the mutex
  defer c.Unlock()
  c.counters[name]++
}

func main() {
  c := Container{counters: map[string]int{"a": 0, "b": 0}}

  doIncrement := func(name string, n int) {
    for i := 0; i < n; i++ {
      c.inc(name)
    }
  }

  go doIncrement("a", 100000)
  go doIncrement("a", 100000)

  // Wait a bit for the goroutines to finish
  time.Sleep(300 * time.Millisecond)
  fmt.Println(c.counters)
}
```

What would you expect the output to be? I get something like this:

```bash
fatal error: concurrent map writes

goroutine 5 [running]:
runtime.throw(0x4b765b, 0x15)

<...> more goroutine stacks
exit status 2
```

We were careful to use a mutex, so what went wrong? Can you see how to fix it? Hint: it's a single-character code change!

The problem with the code is that whenever `inc` is called, our container `c` is copied into it, because `inc` is defined on `Container`, not `*Container`; in other words, it's a value receiver, not a pointer receiver. Therefore, `inc` can't really modify the contents of `c` per se.

But wait, how did the original sample work then? In the single-goroutine sample, we passed c by value too, but it worked - `main` observed the changes to the map done by `inc`. This is because maps are special - they are reference types, not value types. What's stored in `Container` is not the actual map data, but a pointer to it. So even when we create a copy of the `Container`, its counters member still contains the address of the same data.

So the original code sample is wrong too. Even though it works, it goes against the [guidelines](https://golang.org/doc/faq#methods_on_values_or_pointers); methods that modify the object should be defined on pointers, not values. Using a map here leads us to a false sense of security. As an exercise, try to replace the map with just a single `int` counter in the original example, and notice how `inc` increments a copy of it, so that in `main` its effects will not be seen.

The `Mutex` is a value type (see definition in [Go's source](https://golang.org/src/sync/mutex.go), including the comment that explicitly asks not to copy mutexes), so copying it is wrong. We're just creating a different mutex, so obviously the exclusion no longer works.

The one-character fix is, therefore, to add a `*` in front of `Container` in the definition of `inc`:

```go
func (c *Container) inc(name string) {
  c.Lock()
  defer c.Unlock()
  c.counters[name]++
}
```

Then `c` is passed by pointer into the method, and actually refers to the same instance of `Container` in memory as the one the caller has.

This is not an uncommon problem! In fact, `go vet` will warn about it:

```bash
$ go tool vet method-mutex-value-receiver.go
method-mutex-value-receiver.go:19: inc passes lock by value: main.Container
```

It often comes up in scenarios like HTTP handlers, which are invoked concurrently without the programmer's explicitly writing any `go` statements. I'll write more about this in a future post.

This issue really helps clarify the difference between value and pointer receivers in Go, in my opinion. To drive the point home, here's another code sample, unrelated to the last two. It leverages Go's ability to create pointers to objects using `&` and examine their addresses with the `%p` formatting directive:

```go
package main

import "fmt"

type Container struct {
  i int
  s string
}

func (c Container) byValMethod() {
  fmt.Printf("byValMethod got &c=%p, &(c.s)=%p\n", &c, &(c.s))
}

func (c *Container) byPtrMethod() {
  fmt.Printf("byPtrMethod got &c=%p, &(c.s)=%p\n", c, &(c.s))
}

func main() {
  var c Container
  fmt.Printf("in main &c=%p, &(c.s)=%p\n", &c, &(c.s))

  c.byValMethod()
  c.byPtrMethod()
}
```

Its output is (in one particular run on my machine - for you the addresses may be different, though the relations between them should be the same):

```bash
in main &c=0xc00000a060, &(c.s)=0xc00000a068
byValMethod got &c=0xc00000a080, &(c.s)=0xc00000a088
byPtrMethod got &c=0xc00000a060, &(c.s)=0xc00000a068
```

The main function creates a `Container` and prints out its address and the address of field s. It then invokes two `Container` methods.

`byValMethod` has a value receiver, and it prints out different addresses because it gets a copy of `c`. On the other hand, `byPtrMethod` has a pointer receiver and the addresses it observes are identical to the ones in `main`, because it takes the address of the actual `c` when invoked, not a copy.

## Sources

- https://eli.thegreenplace.net/2018/beware-of-copying-mutexes-in-go/
