---
title: Hãy chú ý khi sử dụng mutexes trong Go.
description: Hãy chú ý khi sử dụng mutexes trong Go..
authors:
  - eliben
  - ducnguyen96
tags: [Go, Concurrency]
hide_table_of_contents: false
---

# Hãy chú ý khi sử dụng mutexes trong Go.

Giả sử ta có một `struct chứa một map và ta muốn thay đổi map trong method của struct ấy. Xem [ví dụ sau](https://github.com/ducnguyen96/ducnguyen96.github.io/static/code/blog/go-copying-mutex):

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

Nếu ta chạy đoạn script này thì nó sẽ in ra:

```bash
map[a:100000 b:0]
```

Bây giờ giả sử ta muốn 2 goroutines gọi `inc` một cách concurrent. Để phòng trường hợp xảy ra race conditions thì ta sẽ sử dụng `Mutex` để lock:

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

Bạn nghĩ output sẽ như thế nào?

```bash
fatal error: concurrent map writes

goroutine 5 [running]:
runtime.throw(0x4b765b, 0x15)

<...> more goroutine stacks
exit status 2
```

Tại sao ta đã cẩn thẩn sử dụng `Mutex` rồi mà vẫn lỗi? Sai ở đâu? Gợi ý: chỉ cần thay đổi 1 ký tự!

Vấn đề ở đây là khi `inc` được gọi, thì `c` được copy vì ta defined `inc` với receiver là `Container` chứ k phải `*Container` nên `inc` không thể thay đổi được `c`.

Nhưng khoan, vậy tại sao ví dụ đầu tiên lại không lỗi? Ở Ví dụ đầu ta cũng dùng `Container` chứ k phải `*Container`. Vì map có type là type tham chiếu không phải type giá trị, counters trong `Containers` không chứa giá trị thực của map mà chứa một pointer. Cho nên khi ta tạo copy của `Container` thì counters của nó vẫn có cùng data.

Vậy thì ví dụ ban đầu mặc dù không lỗi nhưng nó sai, nó không tuân theo [guidelines](https://golang.org/doc/faq#methods_on_values_or_pointers); các methods mà thay đổi object thì nên được defined với pointers, không phải values. Sử dụng map ở đây dẫn tới vấn đề bảo mật.

`Mutex` có type giá trị (xem định nghĩa ở [Go's source](https://golang.org/src/sync/mutex.go), bao gồm cả phần bình luận khuyên rằng không nên copy mutexes), cho nên copy là không đúng.

```go
func (c *Container) inc(name string) {
  c.Lock()
  defer c.Unlock()
  c.counters[name]++
}
```

Ở đây thì `c` là một pointer và thực sự tham chiếu đến cùng instance `Container` trong bộ nhớ.

Đây là một lỗi khá thường gặp, nhất là ở những chỗ như HTTP handlers, chúng thường được gọi concurrently mà không cần dùng `go` statement. Ta sẽ nói về vấn đề này ở một bài viết khác.

Lỗi này thực sự giúp chúng ta thấy rõ sự khác biệt giữa value receivers và pointer receivers trong Go. Đây là một ví dụ khác không liên quan đến 2 ví dụ trên, nó sử dụng khả năng tạo pointer của Go với `&` và `%p`.

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

Cho ra output như sau:

```bash
in main &c=0xc00000a060, &(c.s)=0xc00000a068
byValMethod got &c=0xc00000a080, &(c.s)=0xc00000a088
byPtrMethod got &c=0xc00000a060, &(c.s)=0xc00000a068
```

Hàm main tạo một `Container` và in ra address của nó cũng như address của field `s`. Sau đó nó gọi 2 methods của `Container`.

`byValMethod` có value receiver, nó in ra address khác vì receiver của nó là 1 bản copy của `Container`. Mặc khác, `byPtrMethod` có pointer receiver và in ra cùng address với cái được in ra bởi hàm main vì receiver là address của `Container` không phải là copy.

## Nguồn

- https://eli.thegreenplace.net/2018/beware-of-copying-mutexes-in-go/
