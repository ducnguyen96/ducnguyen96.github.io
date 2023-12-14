---
sidebar_label: Using a web framework
---

## Selecting a web framework

Go has several popular web frameworks these days, and I'm sure they all have their merits. My goal is not to engage in a lengthy comparison and discussion of these frameworks; rather, I'm interested in examining how code using a framework compares to code that doesn't.

I picked Gin because it's one of the most popular projects (judging by GitHub star counts), and it seems minimal and easy to pick up and use. Gin's documentation leaves much to be desired, but the framework is so intuitive that I found it pretty easy to pick up regardless.

What's nice about Gin is that it doesn't force any particular style of application development on you (e.g. MVC). Using Gin almost feels like writing code _without_ a framework, except that you get a lot of tools and goodies to achieve your goals with less code.

## Routing with Gin

Our `main` function sets up a new Gin router and registers the routes:

```go
router := gin.Default()
server := NewTaskServer()

router.POST("/task/", server.createTaskHandler)
router.GET("/task/", server.getAllTasksHandler)
router.DELETE("/task/", server.deleteAllTasksHandler)
router.GET("/task/:id", server.getTaskHandler)
router.DELETE("/task/:id", server.deleteTaskHandler)
router.GET("/tag/:tag", server.tagHandler)
router.GET("/due/:year/:month/:day", server.dueHandler)
```

The call to `gin.Default()` returns a default engine, which is Gin's main type that acts as a router and provides other functionality. Specifically, `Default` only registers the basic middleware for crash recovery and logging. More on middleware later.

The route registration should look familiar by now. It's slightly similar to the [gorilla version](/docs/go/rest-server/using-a-router-package), with some slight differences:

1. Instead of selecting the HTTP method as an additional (Go) method call on the route, it's encoded in the name of the registration. E.g. `router.POST` instead of `router.HandleFunc(...).Methods("POST")`.
2. While Gorilla supports regexp matching in the routes, Gin doesn't. This is a limitation that we'll come back to later.

## Handlers

Let's take a look at some handlers with Gin. Starting from the simplest ones, here's `getAllTasksHandler`:

```go
func (ts *taskServer) getAllTasksHandler(c *gin.Context) {
  allTasks := ts.store.GetAllTasks()
  c.JSON(http.StatusOK, allTasks)
}
```

There are a few interesting things to note here:

1. Handlers with Gin don't have the standard Go HTTP handler signature; instead, they simply take a `gin.Context`, which can be used to analyze the request and construct the response. Gin does have ways to interact with standard handlers, by means of the `gin.WrapF` and `gin.WrapH` helper functions.
2. In contrast with the earlier versions of our server, there's no need to manually log each request because Gin's default logging middleware already does this (with all kinds of cool doodads like terminal colors and reporting the processing time of each request).
3. We also don't have to implement the `renderJSON` helper any more, since Gin has its own `Context.JSON` to render JSON as the response.

Now let's examine a slightly more sophisticated handler that has parameters:

```go
func (ts *taskServer) getTaskHandler(c *gin.Context) {
  id, err := strconv.Atoi(c.Params.ByName("id"))
  if err != nil {
    c.String(http.StatusBadRequest, err.Error())
    return
  }

  task, err := ts.store.GetTask(id)
  if err != nil {
    c.String(http.StatusNotFound, err.Error())
    return
  }

  c.JSON(http.StatusOK, task)
}
```

The interesting part to note here is the parameter handling. Gin provides access to route parameters (the parts of the route starting with a colon, like `:id`) through `Context.Params`.

Unlike Gorilla, however, Gin doesn't support regexps in its routes (I believe this is due to performance concerns, since Gin prides itself on fast routing). Therefore, we have to handle the integer parsing of the `id` parameter.

## Bindings

The final handler we're going to examine in detail is `createTaskHandler`; it handles a request that carries non-trivial data, so it's an interesting case study:

```go
func (ts *taskServer) createTaskHandler(c *gin.Context) {
  type RequestTask struct {
    Text string    `json:"text"`
    Tags []string  `json:"tags"`
    Due  time.Time `json:"due"`
  }

  var rt RequestTask
  if err := c.ShouldBindJSON(&rt); err != nil {
    c.String(http.StatusBadRequest, err.Error())
    return
  }

  id := ts.store.CreateTask(rt.Text, rt.Tags, rt.Due)
  c.JSON(http.StatusOK, gin.H{"Id": id})
}
```

Gin has significant infrastructure for binding requests to Go data. Binding in this context means parsing the contents of requests (which could be in JSON, YAML or other formats), validating them and assigning their values to Go structs. Here we use a very rudimentary form of binding for our `RequestTask` without any validation, but it's worth checking out the more advanced options Gin offers.

You'll notice that the Gin version of `createTaskHandler` is quite a bit shorter than our earlier versions because of the work `ShouldBindJSON` is doing for parsing JSON from the request.

An additional thing to note is that we don't need a one-shot `struct` for the response ID now. Instead we use gin.H, which is just an alias for `map[string]interface{}`; so simple, and yet very effective to construct responses with minimal typing and syntax.

## Additional features of Gin

In this example we've only examined a small sliver of what Gin offers to web application developers. Gin comes with many additional features pre-packaged, like commonly used middleware, authentication and helpers for rendering HTML templates. Neither of these are hard to implement without a framework, but using Gin will certainly make it quicker and with far less code, at least for the simple cases.

Right now the focus is only on the basics of routing requests and parsing/responding with JSON, but I'll return to some of these topics in future parts of this series.

## Limitations

The flip side of the convenience of web frameworks is the limitations and stylistic mismatches one may experience when using them. We already ran into one limitation in our simple example - lack of regexp support in Gin routes, which means that nontrivial route matching requires more code to parse and validate.

Any package and tool may have limitations, but frameworks make limitations more significant by their very pervasiveness.

Imagine we'd discover a limitation in Gorilla's `mux` which would be a blocker for our app. We could then replace it by another router package! While there would undoubtedly be some cost to the transition, its effects would be localized - only the routing configuration is affected.

In contrast, imagine we have a large web app written with Gin and we suddenly discover that the no-regexp limitation is critical. We can't just easily replace Gin by another framework since our whole application is built upon it. The change cost is much higher.

None of this is fatal; my goal is not to persuade or dissuade folks from using web frameworks. I'm trying to present the objective reality and describe some of the real-life challenges programmers run into when using these packages and frameworks.

## Sources

- https://eli.thegreenplace.net/2021/rest-servers-in-go-part-3-using-a-web-framework/
