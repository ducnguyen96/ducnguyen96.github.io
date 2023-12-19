---
sidebar_label: Middleware
---

# Middleware

In this part we're going to talk about _middleware_. In an earlier post on the [Life of an HTTP request in a Go server](/blog/2021/life-of-an-http-request-in-a-go-server), I've described the basic mechanics of how middleware works in Go. It's an important pre-requisite; please read it, if you haven't yet.

## Basic middleware for our task server

It's time to revisit our task server once again! The following example is based on the basic stdlib-only task server developed in [part 1](./standard-library). We'll talk about adding middleware to the server and the different options we have for integrating it with the rest of the code. The complete code for the task server discussed below is available [here](https://github.com/ducnguyen96/ducnguyen96.github.io/static/code/docs/go/go-rest-servers/stdlib-middleware).

Our original task server had a `log.Printf` call at the beginning of every handler to log the request being handled. This is something middleware can do with less code duplication. Here's a simple logging middleware:

```go
func Logging(next http.Handler) http.Handler {
  return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
    start := time.Now()
    next.ServeHTTP(w, req)
    log.Printf("%s %s %s", req.Method, req.RequestURI, time.Since(start))
  })
}
```

In addition to logging the request method and URI, this middleware calculates how long the handler took to complete its work and logs that as well.

To connect this middleware to our handlers, here's how `main` would look:

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

Here the middleware is installed _globally_, affecting all handlers. Middleware could also be easily installed on a per-route basis; for example, if we only wanted logging to happen on `server.tagHandler`, we could do [^1]:

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

It's also possible to mix and match: some middleware could be per-route, while other middleware could be global. Note that there's a difference in the order the middleware is executed relative to the mux in the two examples above; can you spot it?

In the first example, the order is:

```
request --> [Logging] --> [Mux] --> [Handler]
```

While in the second example, for /tag/ it's:

```
request --> [Mux] --> [Logging] --> [tagHandler]
```

Generally, it's a good idea to keep track of the order our middleware is executed in. In this case the order between the logging middleware and the mux doesn't matter too much, but in some cases order could be important.

## Adding more middleware

Let's add some more middleware to our server. [In Life of an HTTP request in a Go server](/blog/2021/life-of-an-http-request-in-a-go-server), I mentioned how `net/http` recovers from panics in handlers by closing the client's connection and logging the error. If we want to do something different, we have to write our own middleware; let's give it a try:

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

This middleware attaches a `defer` to a handler; the deferred code recovers from a panic and writes an internal error (HTTP status 500) response back to the client, while logging the panic's stack trace.

And here's `main` again, with the middleware chain set up:

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

The middleware execution order is now:

```
request --> [Panic Recovery] --> [Logging] --> [Mux] --> [tagHandler]
```

As before, it's easy to mix and match; we could set `PanicRecovery` only on some of routes, for example, while setting `Logging` on all the routes.

## Creating middleware chains

As we've just seen, when adding middleware to a server we have to be aware of the order of execution; this is true for both global and per-route middleware. It's not surprising, then, that several packages popped up to help us define middleware "chains" in a slightly more ergonomic manner. Such packages also typically let us reuse chains between different routes. An example of such a package is [alice](https://github.com/justinas/alice).

As usual, a word of caution about dependencies: unless you're in a real hurry and don't care much about long-term readability and maintenance of the code, be very careful in heaping additional dependencies on your project. Especially if the [benefits they bring are small](/blog/2017/benefits-of-dependencies-in-software-projects-as-a-function-of-effort). If something like _alice_ feels much more natural to you - go for it. Otherwise, start with writing your custom code (just like in our example) and consider switching later if the need arises.

In any case, if you're using a router package like `gorilla/mux` or a full-fledged framework like Gin, these have their own tools for setting up middleware.

## Middleware with gorilla/mux

When using the `gorilla/mux` router package, we get some support for middleware included. The `mux.Router` type has a `Use(...)` method which can be used to easily set up global middleware chains. Moreover, the `gorilla/handlers` package includes some ready-made middleware handlers [^2]. For example, a panic-recovery and a logging middleware are already included, along with a few others.

Here's a concrete code sample (the full server is [available here](https://github.com/ducnguyen96/ducnguyen96.github.io/static/code/docs/go/go-rest-servers/gorilla-middleware)):

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

The main function is very similar to the original server using `gorilla/mux` in [part 2](./using-a-router-package), with the addition of two `router.Use` calls where we set up the middleware. I made separate `Use` calls for clarity, though `Use` can accept an arbitrary number of handlers to chain one after another.

The panic recovery middleware is straightforward to use, and demonstrates an interesting technique for configuring middleware using _functional options_. In this case we're configuring it to log the stack when a panic is recovered (the default is `false`).

The `handlers.LoggingHandler` middleware's API is a bit funky and we need a small adapter function to hook it into `router.Use`. It's not clear why it was designed this way; IMHO passing an `io.Writer` could have been accomplished using a functional option similarly to `RecoveryHandler`.

This example demonstrates how to set up _global_ middleware (affecting the whole router); how can we set up per-route middleware with `gorilla/mux`?

One way would be exactly similar to what we did with the standard-library option in the previous example. An alternative is to use `gorilla/mux` _subrouters_ with `Use`. I found the second method slightly convoluted if all you need is to add some middleware to a single path, but if your routing is already factored into several subrouters, the incremental addition may be trivial.

## Middleware with gin

Let's now revisit our Gin-based task server from [part 3](./using-a-web-framework). As specified in that post, when we create a new Gin instance with `gin.Default()`, some default middleware is already registered - specifically logging and panic recovery.

We can also achieve the same effect less automatically by instantiating `gin.New` (which adds no middleware) and then adding middleware manually:

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

Gin's `Use` method lets us attach a middleware chain to the router [^3]. Just like Gin's handlers, Gin middleware does not have the standard middleware signature; instead, it's defined in package `gin` as:

```go
type HandlerFunc func(*Context)
```

So we'd need an adapter to attach a standard-signature middleware to Gin.

If you're using gin, the [gin-contrib](https://github.com/gin-contrib/) GitHub organization has a large collection of middleware modules you could reuse for your application.

## Other uses of middleware

The middleware pattern is versatile and is being widely used in REST servers for a variety of tasks. In this post's examples, I've only shown some basic logging and panic recovery middleware since I wanted to focus on the _mechanism_ rather than on a wide survey of the use cases.

In the wild, you'll find middleware for standardized checking of requests, CORS, many variants of logging, compression, sessions, tracing, caching, encryption and authentication. I'll be covering authentication in much more detail in a future post in this series.

## Closing words

This post covered the _middleware_ pattern in detail, focusing on how to integrate it into REST servers with custom stdlib-only code, `gorilla/mux` routing and a full-fledged framework like Gin. My hope is that after reading it, you'll be able to understand how middleware works and how to use it in your own projects.

A word of caution: middleware is not all sparkles and rainbows. As with any pattern, it should not be overused. Middleware complicates the flow of a request through the server, making code reading and debugging more challenging. I'd strongly recommend defining all your middleware in a single place and avoid layers of abstraction where middleware gets tacked onto routes dynamically, conditionally, or within other middleware. Your future debugging self will be thankful.

## Sources

- https://eli.thegreenplace.net/2021/rest-servers-in-go-part-5-middleware/

[^1]: Note that we have to call `mux.Handle` instead of `mux.HandleFunc` in this case, because our middleware functions return an `http.Handler`, not an `http.HandlerFunc`. For a similar (but inverse) reason, when passing our handler into the middleware we have to adapt it with `http.HandlerFunc`.
[^2]: Custom-written middleware like our code earlier in this post is also easy to use with `gorilla/mux`, due to the standard interfaces `net/http` uses for handlers.
[^3]: Per-path middleware in Gin is easily accomplished by using router groups; each group can have its own middleware registered.
