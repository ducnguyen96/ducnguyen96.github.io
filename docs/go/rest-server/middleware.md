---
sidebar_label: Middleware
---

# Middleware

[Bài viết này](/blog/2021/life-of-an-http-request-in-a-go-server) mô tả cơ bản cơ chế hoạt động của middleware trong Go. Nếu bạn chưa đọc thì hãy đọc nó trước khi tiếp tục bài viết.

## Middleware cơ bản cho task service

Ví dụ sau đây dựa vào task server cơ bản đã xây dựng ở [phần 1](./standard-library). Ta sẽ nói về cách thêm middleware cũng như một số lựa chọn khác nhau để tích hợp nó. Phần code hoàn thiện có thể xem [ở đây](https://github.com/ducnguyen96/ducnguyen96.github.io/tree/master/static/code/docs/go/rest-server/stdlib-middleware).

Server gốc của chúng ta gọi hàm `log.Printf` ở mỗi handler để log các request. Đây là một trong những vấn đề mà middleware có thể xử lý giúp code đỡ lặp hơn. Sau đây là một ví dụ:

```go
func Logging(next http.Handler) http.Handler {
  return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
    start := time.Now()
    next.ServeHTTP(w, req)
    log.Printf("%s %s %s", req.Method, req.RequestURI, time.Since(start))
  })
}
```

Middleware này không chỉ log method và URI mà còn tính cả thời gian mà handler mất để xử lý.

Để kết nối middleware này với handlers ta sẽ update `main` như sau:

```go
func main() {
  mux := http.NewServeMux()
  server := NewTaskServer()
  mux.HandleFunc("/task/", server.taskHandler)
  mux.HandleFunc("/tag/", server.tagHandler)
  mux.HandleFunc("/due/", server.dueHandler)

  handler := middleware.Logging(mux)

  log.Fatal(http.ListenAndServe("localhost:"+os.Getenv("SERVERPORT"), handler))
}
```

Middleware này được cài đặt `globally` và có ảnh hưởng lên tất cả các handlers. Nó cũng có thể được sử dụng dễ dàng lên từng route, chẳng hạn như sau [^1]:

```go
func main() {
  mux := http.NewServeMux()
  server := NewTaskServer()
  mux.HandleFunc("/task/", server.taskHandler)
  mux.Handle("/tag/", middleware.Logging(http.HandlerFunc(server.tagHandler)))
  mux.HandleFunc("/due/", server.dueHandler)

  log.Fatal(http.ListenAndServe("localhost:"+os.Getenv("SERVERPORT"), mux))
}
```

Ta cũng có thể sử dụng hỗn hợp cả 2: một số middleware sử dụng cho từng route nhất định trong khi các middlewares khác có thể được sử dụng _globally_. Bạn có nhận thấy sự khác biệt giữa trình tự các middleware được thực thi ở 2 ví dụ phía trên không?

Ở ví dụ đầu tiên, thứ tự là:

```
request --> [Logging] --> [Mux] --> [Handler]
```

Trong khi ở ví dụ thứ 2, đối với route `/tag/`:

```
request --> [Mux] --> [Logging] --> [tagHandler]
```

Thông thường thì ta nên để ý tới trình tự các middlewares được thực thi. Nhưng trong trường hợp này thì trình tự này không quá quan trọng.

## Thêm một số middlewares khác

Trong bài viết [vòng đời của một HTTP request trong Go server](/blog/2021/life-of-an-http-request-in-a-go-server), có đề cập đến cách `net/http` hồi phục sau panics bằng cách đóng kết nối với client và sau đó log lỗi. Để đạt được điều tương tự thì ta sẽ viết một middleware:

```go
func PanicRecovery(next http.Handler) http.Handler {
  return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
    defer func() {
      if err := recover(); err != nil {
        http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
        log.Println(string(debug.Stack()))
      }
    }()
    next.ServeHTTP(w, req)
  })
}
```

Middleware này sử dụng `defer`; code trong `defer` sẽ được thực thi sau khi handler kết thúc. Nếu handler panic thì code trong `defer` sẽ được thực thi và trả về một HTTP status 500 về client, đồng thời log stack trace của panic.

Update hàm `main` như sau:

```go
func main() {
  mux := http.NewServeMux()
  server := NewTaskServer()
  mux.HandleFunc("/task/", server.taskHandler)
  mux.HandleFunc("/tag/", server.tagHandler)
  mux.HandleFunc("/due/", server.dueHandler)

  handler := middleware.Logging(mux)
  handler = middleware.PanicRecovery(handler)

  log.Fatal(http.ListenAndServe("localhost:"+os.Getenv("SERVERPORT"), handler))
}
```

Thứ tự thực thi middleware bây giờ:

```
request --> [Panic Recovery] --> [Logging] --> [Mux] --> [tagHandler]
```

Tương tự thì ta cũng có thể set `PanicRecovery` lên một số routes nhất định hoặc _globally_

## Tạo chuỗi middlewares

Khi thêm middleware vào server thì chúng ta phải để ý tới trình tự thực thi (cả global lẫn middleware cho từng route). Và cũng không ngạc nhiên khi có một số packages giải quyết vấn đề này bằng cách nối các middleware lại với nhau thành chuỗi. Một trong số đó là [alice](https://github.com/justinas/alice).

Như mọi khi thì vẫn luôn nên cẩn trọng khi thêm bất cứ 1 dependency nào vào project. Nếu bạn cảm thấy _alice_ implements đúng thứ bạn cần thì hãy sử dụng, không thì hãy thử bắt đầu bằng cách tự viết và sau đấy chuyển sang sử dụng nó sau khi nhu cầu sử dụng phức tạp hơn.

## Middleware với gorilla/mux

`gorilla/mux` có hỗ trợ để thêm middlewares. `mux.Router` type có method `Use(...)` có thê thể được sử dụng để dễ dàng thêm chuỗi global middleware. Hơn nữa thì `gorilla/handlers` package cũng có một số handlers được làm sẵn [^2] chẳng hạn như panic-recovery và logging middleware,...

Đây là [ví dụ cụ thể](https://github.com/ducnguyen96/ducnguyen96.github.io/tree/master/static/code/docs/go/rest-server/gorilla-middleware)

```go
func main() {
  router := mux.NewRouter()
  router.StrictSlash(true)
  server := NewTaskServer()

  router.HandleFunc("/task/", server.createTaskHandler).Methods("POST")
  router.HandleFunc("/task/", server.getAllTasksHandler).Methods("GET")
  router.HandleFunc("/task/", server.deleteAllTasksHandler).Methods("DELETE")
  router.HandleFunc("/task/{id:[0-9]+}/", server.getTaskHandler).Methods("GET")
  router.HandleFunc("/task/{id:[0-9]+}/", server.deleteTaskHandler).Methods("DELETE")
  router.HandleFunc("/tag/{tag}/", server.tagHandler).Methods("GET")
  router.HandleFunc("/due/{year:[0-9]+}/{month:[0-9]+}/{day:[0-9]+}/", server.dueHandler).Methods("GET")

  // Set up logging and panic recovery middleware.
  router.Use(func(h http.Handler) http.Handler {
    return handlers.LoggingHandler(os.Stdout, h)
  })
  router.Use(handlers.RecoveryHandler(handlers.PrintRecoveryStack(true)))

  log.Fatal(http.ListenAndServe("localhost:"+os.Getenv("SERVERPORT"), router))
}
```

Hàm `main` tương tự với bản ở sử dụng `gorilla/mux` trong [phần 2](./using-a-router-package), nó chỉ gọi thêm `router.Use` 2 lần để thêm middleware. Tôi đã tách riêng `Use` ra để dễ đọc, nhưng `Use` có thể nhận bao nhiêu middleware cũng được.

Middleware panic recovery rất dễ sử dụng, nó cũng cho thấy một kỹ thuật khá thú vị để cấu hình middleware sử dụng _functional options_. Trong trường hợp này thì ta cấu hình nó để log stack trace khi panic được hồi phục (giá trị mặc định là `false`).

Middleware logging thì hơi khác một chút. API của `handlers.LoggingHandler` hơi lạ và ta cần một adapter nhỏ để nó hoạt động với `router.Use`. Không rõ tại sao nó lại được thiết kế như vậy; theo ý kiến cá nhân của tôi thì việc truyền vào một `io.Writer` có thể được thực hiện bằng cách sử dụng functional option tương tự như `RecoveryHandler`.

Ví dụ trên cho thấy cách cài đặt _global_ middleware (ảnh hưởng tới toàn bộ router); làm thế nào để cài đặt middleware cho từng route với `gorilla/mux`?

Có nhiều cách để làm điều này. Một cách là tương tự như ví dụ với `stdlib` ở trên. Một cách khác là sử dụng `gorilla/mux` _subrouters_ với `Use`. Tôi thấy cách thứ 2 hơi phức tạp nếu như bạn chỉ cần thêm middleware cho một route duy nhất, nhưng nếu routing của bạn đã được phân chia thành nhiều subrouter thì việc thêm middleware sẽ dễ dàng hơn.

## Middleware với gin

Hãy xem lại server build với Gin ở [phần 3](./using-a-web-framework). Như đã nói ở phần đó, khi tạo một instance mới của Gin với `gin.Default()` thì một số middleware mặc định đã được đăng ký - cụ thể là logging và panic recovery.

Ta cũng có thể đạt được điều tương tự nhưng ít tự động hơn bằng cách sử dụng `gin.New` (không thêm middleware) sau đó ta sẽ thêm middleware.

```go
func main() {
  // Set up middleware for logging and panic recovery explicitly.
  router := gin.New()
  router.Use(gin.Logger())
  router.Use(gin.Recovery())

  server := NewTaskServer()

  router.POST("/task/", server.createTaskHandler)
  router.GET("/task/", server.getAllTasksHandler)
  router.DELETE("/task/", server.deleteAllTasksHandler)
  router.GET("/task/:id", server.getTaskHandler)
  router.DELETE("/task/:id", server.deleteTaskHandler)
  router.GET("/tag/:tag", server.tagHandler)
  router.GET("/due/:year/:month/:day", server.dueHandler)

  router.Run("localhost:" + os.Getenv("SERVERPORT"))
}
```

Method `Use` của Gin cho phép ta gán một chuỗi middleware vào router [^3]. Tương tự như handlers thì middlewares của Gin không triển khai theo chuẩn của http.

```go
type HandlerFunc func(*Context)
```

Cho nên ta phải thêm một adapter để có thể gán một middleware tiêu chuẩn vào Gin.

Nếu bạn dùng gin thì cũng có thể xem qua [gin-contrib](https://github.com/gin-contrib/), có thể tìm thấy nhiều middleware được làm sẵn mà bạn có thể tái sử dụng.

## Một số ứng dụng khác của middleware

Middleware pattern rất linh hoạt và được sử dụng rộng rãi trong các REST server. Bài viết này chỉ đưa ra một số ví dụ cơ bản về logging và panic recovery vì muốn tập trung vào cơ chế hoạt động của nó hơn là liệt kê ra tất cả ứng dụng của middleware.

Trong thực tế thì bạn sẽ thấy middleware được ứng dụng ở vào những chỗ khác như kiểm tra requests, CORS, các biến thể khác nhau của logging, nén, sessions, tracing, caching, encryption, authentication. Chúng ta sẽ có một bài chi tiết về authentication ở phần sau.

## Kết bài

Bất cứ pattern nào cũng không nên được sử dụng quá mức. Middleware làm tăng độ phức tạp của request flow, làm cho việc đọc và debug trở nên khó hơn. Nên define tất cả middleware vào 1 chỗ để tránh việc các lớp middleware chồng chéo nhau.

## Nguồn

- https://eli.thegreenplace.net/2021/rest-servers-in-go-part-5-middleware/

[^1]: Lưu ý rằng ở đây ta gọi `mux.Handle` thay vì `mux.HandleFunc`, ta cần middleware trả về một `http.Handler` chứ không phải `http.HandlerFunc`. Với lý do tương tự thì khi truyền handler vào middleware ta cần phải adapt nó với `http.HandlerFunc`.
[^2]: Middleware tự viết cũng dễ dàng sử dụng với `gorilla/mux` vì `net/http` sử dụng các interface chuẩn cho handlers.
[^3]: Middleware cho từng route trong Gin có thể được thực hiện dễ dàng bằng cách sử dụng router groups; mỗi group có thể có middleware riêng.
