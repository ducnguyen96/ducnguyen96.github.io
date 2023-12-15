---
sidebar_label: Standard Library
---

# Standard Library

Developers who just start using a language often ask "what framework should I use to do X" as one of their first questions. While this makes total sense for web applications and servers in many languages, in Go the answer to this question is nuanced. There are strong opinions both for and against using frameworks. My goal in these posts is to examine the issue objectively from several angles.

## The task

First of all, I'll assume the reader knows what a _REST server_ is. If you need a refresher, [this is a good resource](https://www.codecademy.com/articles/what-is-rest), but there are many others. The rest of the series assumes you know what I mean by a "path", "HTTP header", "response code", etc.

In our case, the server is a simple backend for a task management application (think Google Keep, Todoist and the like); it presents the following REST API to clients [^1]:

```js
POST   /task/              :  create a task, returns ID
GET    /task/<taskid>      :  returns a single task by ID
GET    /task/              :  returns all tasks
DELETE /task/<taskid>      :  delete a task by ID
GET    /tag/<tagname>      :  returns list of tasks with this tag
GET    /due/<yy>/<mm>/<dd> :  returns list of tasks due by this date
```

Our server supports `GET`, `POST` and `DELETE` requests, some of them with several potential paths. The parts between angle brackets `<...>` denote parameters that the client supplies as part of the request; for example, `GET /task/42` is a request to fetch the task with ID 42, etc. Tasks are uniquely identified by IDs.

The data encoding is JSON. In POST `/task/` the client will send a JSON representation of the task to create. Similarly, everywhere it says the server "returns" something, the returned data is encoded as JSON in the body of the HTTP response.

## Code

The rest of this post will present the server's code in Go, in parts. The complete code for the server can be found [here](https://github.com/eliben/code-for-blog/tree/master/2021/go-rest-servers/stdlib-basic); it's a self-contained Go module, with no dependencies. Once you clone or copy the project directory, you can run the server without installing anything:

```bash
$ SERVERPORT=4112 go run .
```

Note that `SERVERPORT` can be any port; this is the `TCP` port your local server is listening on. Once the server is running, you can interact with it in a separate terminal by using `curl` commands, or in any other way that works for you. See [this script](https://github.com/eliben/code-for-blog/blob/master/2021/go-rest-servers/testing/manual.sh) for an example; the directory containing this script also has an automated test harness for the server.

## The Model

Let's start by discussing the model (or the "data layer") for our server - the `taskstore` package (`internal/taskstore` in the project directory). This is a simple abstraction representing a database of tasks; here is its API:

```go
package taskstore


type Task struct {
	Id   int       `json:"id"`
	Text string    `json:"text"`
	Tags []string  `json:"tags"`
	Due  time.Time `json:"due"`
}

// TaskStore is a simple in-memory database of tasks; TaskStore methods are
// safe to call concurrently.
type TaskStore struct {
	sync.Mutex

	tasks  map[int]Task
	nextId int
}

func New() *TaskStore

// CreateTask creates a new task in the store.
func (ts *TaskStore) CreateTask(text string, tags []string, due time.Time) int

// GetTask retrieves a task from the store, by id. If no such id exists, an
// error is returned.
func (ts *TaskStore) GetTask(id int) (Task, error)

// DeleteTask deletes the task with the given id. If no such id exists, an error
// is returned.
func (ts *TaskStore) DeleteTask(id int) error

// DeleteAllTasks deletes all tasks in the store.
func (ts *TaskStore) DeleteAllTasks() error

// GetAllTasks returns all the tasks in the store, in arbitrary order.
func (ts *TaskStore) GetAllTasks() []Task

// GetTasksByTag returns all the tasks that have the given tag, in arbitrary
// order.
func (ts *TaskStore) GetTasksByTag(tag string) []Task

// GetTasksByDueDate returns all the tasks that have the given due date, in
// arbitrary order.
func (ts *TaskStore) GetTasksByDueDate(year int, month time.Month, day int) []Task
```

The `taskstore` package implements this API using a simple `map[int]Task`, but you could easily imagine it being implemented using a database. In a realistic application, `TaskStore` would likely be an interface that several backends can implement, but for our simple example the current API is sufficient. If you'd like an extended exercise, go ahead and implement a `TaskStore` using something like `MongoDB`.

## Setting up the server

The `main` function of our server is fairly simple:

```go
func main() {
  mux := http.NewServeMux()
  server := NewTaskServer()
  mux.HandleFunc("/task/", server.taskHandler)
  mux.HandleFunc("/tag/", server.tagHandler)
  mux.HandleFunc("/due/", server.dueHandler)

  log.Fatal(http.ListenAndServe("localhost:"+os.Getenv("SERVERPORT"), mux))
}
```

Let's spend a moment talking about `NewTaskServer`, and then we'll come back to discuss the router and path handlers.

`NewTaskServer` is a constructor for our server type, `taskServer`. The server wraps a `TaskStore`, which is safe for [concurrent access](/blog/2019/on-concurrency-in-go-http-servers).

```go
type taskServer struct {
  store *taskstore.TaskStore
}

func NewTaskServer() *taskServer {
  store := taskstore.New()
  return &taskServer{store: store}
}
```

## Routing and handlers

**Update (2023-10-16)**: in `Go 1.22` the capabilities of the standard library HTTP router are significantly enhanced. See [this post](/blog/2023/better-http-server-routing-in-go-122) for details.

Back to the routing, using the standard HTTP multiplexer included in the `net/http` package:

```go
mux.HandleFunc("/task/", server.taskHandler)
mux.HandleFunc("/tag/", server.tagHandler)
mux.HandleFunc("/due/", server.dueHandler)
```

The standard multiplexer is very bare-bones; that's both its strength and weakness. Strength because it's super easy to understand - there's no magic involved whatsoever. Weakness because it sometimes makes path matching rather tedious and split over several places, as we shall soon see.

Since the standard mux only supports exact matching of path prefixes, we're pretty much forced to only match roots at the top level and defer the more detailed matching to the handler.

Let's examine `taskHandler` in detail:

```go
func (ts *taskServer) taskHandler(w http.ResponseWriter, req *http.Request) {
  if req.URL.Path == "/task/" {
    // Request is plain "/task/", without trailing ID.
    if req.Method == http.MethodPost {
      ts.createTaskHandler(w, req)
    } else if req.Method == http.MethodGet {
      ts.getAllTasksHandler(w, req)
    } else if req.Method == http.MethodDelete {
      ts.deleteAllTasksHandler(w, req)
    } else {
      http.Error(w, fmt.Sprintf("expect method GET, DELETE or POST at /task/, got %v", req.Method), http.StatusMethodNotAllowed)
      return
    }
```

We begin with the exact match of path to `/task/` (meaning no `<taskid>` follows). Here we have to figure out which HTTP method is used, and call the appropriate server method. Most handlers are fairly simple wrappers around the `TaskStore` API. Let's examine one in detail:

```go
func (ts *taskServer) getAllTasksHandler(w http.ResponseWriter, req *http.Request) {
  log.Printf("handling get all tasks at %s\n", req.URL.Path)

  allTasks := ts.store.GetAllTasks()
  js, err := json.Marshal(allTasks)
  if err != nil {
    http.Error(w, err.Error(), http.StatusInternalServerError)
    return
  }
  w.Header().Set("Content-Type", "application/json")
  w.Write(js)
}
```

This handler has two main jobs:

1. Get data from the model (`TaskStore`)
2. Fill in an HTTP response for the client

Both are straightforward, but if you examine the other handlers in the server you'll notice that the second is a bit repetitive - marshal the JSON, write the right HTTP response header, etc. We'll get back to this later on.

Now back to `taskHandler`; so far we've seen how it handles direct matches of the `/task/` path. What about `/task/<taskid>`? That's where the next part of the function comes in:

```go
} else {
  // Request has an ID, as in "/task/<id>".
  path := strings.Trim(req.URL.Path, "/")
  pathParts := strings.Split(path, "/")
  if len(pathParts) < 2 {
    http.Error(w, "expect /task/<id> in task handler", http.StatusBadRequest)
    return
  }
  id, err := strconv.Atoi(pathParts[1])
  if err != nil {
    http.Error(w, err.Error(), http.StatusBadRequest)
    return
  }

  if req.Method == http.MethodDelete {
    ts.deleteTaskHandler(w, req, id)
  } else if req.Method == http.MethodGet {
    ts.getTaskHandler(w, req, id)
  } else {
    http.Error(w, fmt.Sprintf("expect method GET or DELETE at /task/<id>, got %v", req.Method), http.StatusMethodNotAllowed)
    return
  }
}
```

When the path is not an exact match to `/task/`, we expect there to be a numeric ID following the slash. The code above parses this numeric ID and invokes the appropriate handler (based on HTTP method).

The rest of the code is more of the same and should be fairly straightforward to understand. The only handler that's a bit special is `createTaskHandler`, since it has to parse JSON data sent by the client in the request body. There are some nuances to JSON parsing in requests that I didn't cover - check out [this post](/blog/2023/how-to-properly-parse-a-json-request-body) for a more thorough approach.

## Making improvements

Now that we have the basic version of the server working, it's time to think about potential issues and improvements.

One obvious place we can improve is the repetitive JSON rendering in our HTTP responses, as mentioned earlier. For this, I created a separate version of the server called [stdlib-factorjson](https://github.com/eliben/code-for-blog/tree/master/2021/go-rest-servers/stdlib-factorjson). I've kept it separate to help you easily diff it vs. the original server and see what changed. The main novelty it contains is this function:

```go
// renderJSON renders 'v' as JSON and writes it as a response into w.
func renderJSON(w http.ResponseWriter, v interface{}) {
  js, err := json.Marshal(v)
  if err != nil {
    http.Error(w, err.Error(), http.StatusInternalServerError)
    return
  }
  w.Header().Set("Content-Type", "application/json")
  w.Write(js)
}
```

Using it, we can rewrite all our handlers to be a bit more succinct; for example, `getAllTasksHandler` now becomes:

```go
func (ts *taskServer) getAllTasksHandler(w http.ResponseWriter, req *http.Request) {
  log.Printf("handling get all tasks at %s\n", req.URL.Path)

  allTasks := ts.store.GetAllTasks()
  renderJSON(w, allTasks)
}
```

A more fundamental improvement is making path matching cleaner and more centralized. While the current path matching approach is simple to debug, it's not as simple to grasp at a glance because it's scattered across multiple functions. For example, let's say we're trying to figure out where a DELETE request to `/task/<taskid>` is going.

1. First, we find the mux in `main`, and see that the `/task/` root goes to `taskHandler`
2. Then, in `taskHandler` have have to find the else clause that handles non-exact matches to `/task/`. There we have to read the code parsing the `<taskid>` part into an integer
3. Finally, we look at the if statement listing the different methods supported for this route and find that DELETE is handled by `deleteTaskHandler`

Placing all of this logic in a single, easily-consumable place is something third-party HTTP router packages aim to solve. It's the focus of [part 2](/docs/go/rest-server/using-a-router-package) in this series.

## Sources

- https://eli.thegreenplace.net/2021/rest-servers-in-go-part-1-standard-library/

[^1]: Note the ad-hoc nature of specifying the REST API for the server. We'll discuss more structured/standard ways in future parts of this series.
