---
sidebar_label: Standard Library
---

# Standard Library

Một trong những câu hỏi thường gặp ở Developer lúc chuẩn bị start 1 project nào đấy là "Nên sử dụng framework nào?". Đối với nhiều ngôn ngữ thì điều này là hoàn toàn bình thường nhưng với Go thì không phải lúc nào cũng vậy. Có nhiều ý kiến trái chiều về việc nên sử dụng frameworks hay không với Go. Mục tiêu của series này là xem xét một cách khách quan từ nhiều góc độ.

## The task

Đầu tiên, nếu bạn cần nhớ lại kiến thức về _REST server_ [đây là bài viết tốt](/blog/2023/what-is-rest). Phần còn lại của series này sẽ giả sử bạn biết về "path", "HTTP header", "response code", v.v.

Server của chúng ta là một backend đơn giản cho ứng dụng quản lý công việc (tương tự Google Keep, hay các ứng dụng Todo khác); nó gồm 1 số APIs sau:

```js
POST   /task/              :  create task, trả về ID
GET    /task/<taskid>      :  return task theo ID
GET    /task/              :  returns all tasks
DELETE /task/<taskid>      :  delete a task theo ID
GET    /tag/<tagname>      :  returns list tasks chứa tag này
GET    /due/<yy>/<mm>/<dd> :  returns list tasks với ngày hết hạn
```

Server của chúng ta hỗ trợ `GET`, `POST` và `DELETE` requests, một số trong số đó có nhiều đường dẫn khác nhau. Các phần giữa dấu ngoặc `<...>` đề cập đến các tham số mà client cung cấp như là một phần của request; ví dụ, `GET /task/42` là một request để `GET` task với ID 42, v.v. Tasks thì duy nhất theo ID.

Dữ liệu được mã hóa dưới dạng JSON. Trong POST `/task/` client sẽ gửi một 1 task theo format JSON. Tương tự, mọi nơi mà server "return" cái gì đó, dữ liệu trả về được mã hóa dưới dạng JSON trong body của HTTP response.

## Code

Phần còn lại của bài viết này sẽ giới thiệu code của server, viết bằng Go, theo từng phần. Code hoàn chỉnh của server có thể tìm thấy [ở đây](https://github.com/eliben/code-for-blog/tree/master/2021/go-rest-servers/stdlib-basic); nó là một Go module độc lập, không có dependencies. Sau khi clone hoặc copy, bạn có thể chạy server mà không cần cài đặt bất cứ thứ gì:

```bash
$ SERVERPORT=4112 go run .
```

Chú ý rằng `SERVERPORT` có thể là bất kỳ port nào; đây là port `TCP` mà server local của bạn đang lắng nghe. Sau khi server chạy, bạn có thể tương tác với nó trong một terminal khác bằng cách sử dụng các lệnh `curl`, hoặc bằng bất kỳ cách nào khác mà bạn thấy phù hợp. Xem ví dụ [ở đây](https://github.com/eliben/code-for-blog/blob/master/2021/go-rest-servers/testing/manual.sh).

## The Model

Hãy bắt đầu bằng cách thảo luận về model (hoặc "data layer") cho server của chúng ta - package `taskstore` (thư mục `internal/taskstore`). Đây là API của nó:

```go
package taskstore


type Task struct {
	Id   int       `json:"id"`
	Text string    `json:"text"`
	Tags []string  `json:"tags"`
	Due  time.Time `json:"due"`
}

// TaskStore là một database đơn giản lưu trữ các task trong bộ nhớ; các methods của TaskStore có thể gọi concurrently.
type TaskStore struct {
	sync.Mutex

	tasks  map[int]Task
	nextId int
}

func New() *TaskStore

// CreateTask tạo một task mới trong store.
func (ts *TaskStore) CreateTask(text string, tags []string, due time.Time) int

// GetTask lấy một task từ store, theo ID. Nếu không có ID nào tồn tại, trả về lỗi.
func (ts *TaskStore) GetTask(id int) (Task, error)

// DeleteTask xóa task với ID cho trước. Nếu ID không tồn tại, trả về lỗi.
func (ts *TaskStore) DeleteTask(id int) error

// DeleteAllTasks xóa tất cả các task trong store.
func (ts *TaskStore) DeleteAllTasks() error

// GetAllTasks trả về tất cả các task trong store, theo thứ tự bất kỳ.
func (ts *TaskStore) GetAllTasks() []Task

// GetTasksByTag trả về tất cả các task có tag cho trước, theo thứ tự bất kỳ.
func (ts *TaskStore) GetTasksByTag(tag string) []Task

// GetTasksByDueDate trả về tất cả các task có due date cho trước, theo thứ tự bất kỳ.
func (ts *TaskStore) GetTasksByDueDate(year int, month time.Month, day int) []Task
```

Package `taskstore` triển khai API bằng cách sử dụng `map[int]Task`, nhưng bạn có thể xem nó như là một database. Trong một ứng dụng thực tế, `TaskStore` có thể là một interface mà nhiều backends có thể sử dụng, nhưng với ví dụ đơn giản của chúng ta thì API hiện tại là đủ.

## Setting up the server

Hàm `main` của server khá đơn giản:

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

`NewTaskServer` là một constructor cho server của chúng ta, `taskServer`. Server bao gồm một `TaskStore`, có thể [truy cập đồng thời](/blog/2019/on-concurrency-in-go-http-servers) một cách an toàn.

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

**Update (2023-10-16)**: trong `Go 1.22` thì router từ package `http` được cải thiện đáng kể. Xem [bài viết này](/blog/2023/better-http-server-routing-in-go-122) để biết chi tiết.

Trở lại với routing, sử dụng HTTP multiplexer có sẵn trong package `net/http`:

```go
mux.HandleFunc("/task/", server.taskHandler)
mux.HandleFunc("/tag/", server.tagHandler)
mux.HandleFunc("/due/", server.dueHandler)
```

Multiplexer có sẵn rất đơn giản, chỉ hỗ trợ matching chính xác của path prefix. Điều này có nghĩa là `/task/` sẽ match với `/task/` và `/task/42`, nhưng không match với `/task` (không có trailing slash). Điều này vừa là điểm mạnh vừa là điểm yếu của nó. Điểm mạnh là nó rất dễ hiểu. Điểm yếu là nó đôi khi làm cho việc matching path trở nên khá phiền phức và phải chia ra nhiều nơi, như chúng ta sẽ thấy ngay sau đây.

Vì mux chỉ hỗ trợ matching chính xác của path prefix, nên chúng ta bắt đầu với `/task/`, `/tag/` và `/due/` là các root của các API. Các handler cho các root này được định nghĩa trong `taskHandler`, `tagHandler` và `dueHandler`:

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

Chúng ta bắt đầu với exact match của path với `/task/` (nghĩa là không có `<taskid>` theo sau). Ở đây chúng ta phải xác định HTTP method nào được sử dụng, và gọi method thích hợp. Hầu hết các handler đều là các wrapper đơn giản của `TaskStore` API. Hãy xem ví dụ sau đây:

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

Handler này có 2 việc chính:

1. Lấy dữ liệu từ model (`TaskStore`)
2. Điền vào HTTP response cho client

Cả 2 đều rất trực quan, nhưng nếu bạn nhìn vào các handlers khác thì bạn sẽ thấy bước thứ 2 lặp lại khá nhiều - marshal JSON, write HTTP response header, v.v. Chúng ta sẽ quay lại vấn đề này sau.

Bây giờ trở lại với `taskHandler`; cho đến nay chúng ta đã thấy cách nó xử lý các exact match của `/task/`. Còn `/task/<taskid>` thì sao?

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

Khi path không khớp chính xác với `/task/`, chúng ta expect có một ID theo sau dấu `/`. Đoạn code trên parses ID này và gọi handler phù hợp (dựa trên HTTP method).

Phần còn lại thì cũng tương tự và dễ hiểu. Chỉ có `createTaskHandler` hơi đặc biệt, vì nó phải parse JSON data được gửi bởi client trong request body. Có một vài điểm về JSON parsing mà tôi không đề cập - hãy xem [bài viết này](/blog/2023/how-to-properly-parse-a-json-request-body) để biết chi tiết hơn.

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
