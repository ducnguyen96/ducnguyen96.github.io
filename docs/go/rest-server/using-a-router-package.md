---
sidebar_label: Sử dụng một router package
---

# Sử dụng một router package

[Phần 1](/docs/go/rest-server/standard-library) kết thúc với 1 Go server, ta đã refactor bước render JSON thành 1 helper function.

Vấn đề còn lại là path routing logic, hiện tại đang rải rác thành nhiều nơi.

Đây là vấn đề mọi người gặp phải khi cố gắng viết servers mà không sử dụng dependencies. Trừ khi server có routes rất đơn giản(có 1 vài server chuyên biệt chỉ có 1 hay 2 routes), sự dài dòng và khó khăn trong việc quản lý code của router là điều sẽ dần dần hiện ra..

## Routing nâng cao

Đầu tiên ta sẽ trừu tượng hóa routing bằng cách sử dụng 1 vài functions hoặc là 1 data type cùng với methods. Có nhiều cách thú vị để làm và cũng có nhiều packages bên thứ 3 giải quyết vấn đề này. Bạn nên đọc [bài viết của Ben Hoyt](/blog/2023/go-routing), trong đó anh ấy so sánh và đối chiếu nhiều cách tiếp cận khác nhau cho 1 set routes đơn giản.

Hãy xem lại REST API của server:

```js
POST   /task/              :  create a task, returns ID
GET    /task/<taskid>      :  returns a single task by ID
GET    /task/              :  returns all tasks
DELETE /task/<taskid>      :  delete a task by ID
GET    /tag/<tagname>      :  returns list of tasks with this tag
GET    /due/<yy>/<mm>/<dd> :  returns list of tasks due by this date
```

Có một vài điều chúng ta có thể làm để cho router của chúng ta "công thái học" hơn:

1. Thêm cách để set các handlers khác nhau cho các method khác nhau trên cùng 1 route. Ví dụ `POST` cho `/task/` sẽ đi vào 1 handler, `GET /task/` sẽ đi vào 1 handler khác, v.v.
2. Thêm cách để có thể match "sâu" hơn; ví dụ `/task/` sẽ đi vào 1 handler, trong khi `/task/<taskid>` với `taskid` là 1 số sẽ đi vào 1 handler khác.
3. Matcher sẽ chỉ extract số ID từ `/task/<taskid>` và pass nó vào handler một cách thuận tiện.

Viết 1 custom router trong Go rất đơn giản, do tính "composable" HTTP handlers. Trong series này, ta sẽ không viết custom router. Thay vào đó, hãy xem cách mà tất cả các điều này được xử lý bởi 1 trong những router bên thứ 3 phổ biến nhất - [gorilla/mux.](https://github.com/gorilla/mux)

## Task server sử dụng gorilla/mux

`gorilla/mux` là 1 trong những router HTTP phổ biến nhất của Go; theo [docs](https://pkg.go.dev/github.com/gorilla/mux), tên mux có nghĩa là "HTTP request multiplexer".

Vì nó là 1 package với mục tiêu cụ thể duy nhất, nên cách sử dụng của nó khá đơn giản. Bạn có thể xem phiên bản task server sử dụng `gorilla/mux` cho routing [ở đây](https://github.com/eliben/code-for-blog/tree/master/2021/go-rest-servers/gorilla). Dưới đây là cách routes được defined:

```go
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
```

Chúng ta có thể thấy (1) và (2) đã được giải quyết. Bằng cách gán `Methods` vào từng route, ta có thể dễ dàng trỏ route với các methods khác nhau đến các handlers khác nhau. Pattern matching(sử dụng regexp) ở trong path cũng giúp ta có thể dễ dàng phân biệt giữa `/task/` và `/task/<taskid>`.

Hãy xem (3) được giải quyết trong `getTaskHandler`:

```go
func (ts *taskServer) getTaskHandler(w http.ResponseWriter, req *http.Request) {
  log.Printf("handling get task at %s\n", req.URL.Path)

  // Ở đây ta không cần check error vì router chỉ match vói pattern [0-9]+
  // tức là phần match kia chỉ chứa số
  id, _ := strconv.Atoi(mux.Vars(req)["id"])
  ts.Lock()
  task, err := ts.store.GetTask(id)
  ts.Unlock()

  if err != nil {
    http.Error(w, err.Error(), http.StatusNotFound)
    return
  }

  renderJSON(w, task)
}
```

Ở phần define route, route `/task/{id:[0-9]+}/` define regex để parse path và đồng thời assign một identifier cho "id". Biến này có thể được truy cập bằng cách gọi `mux.Vars` lên request.

## So sánh 2 cách tiếp cận

Đây là cách mà route `GET /task/<taskid>` được xử lý trong server ban đầu:
![http-route-handler](./img/http-route-handler.png)

Còn đây là cách mà route `GET /task/<taskid>` được xử lý trong server sử dụng `gorilla/mux`:
![gorilla-route-handler](./img/gorilla-route-handler.png)

Mỗi route với 1 method và 1 handler cụ thể làm cho việc đọc code dễ dàng hơn rất nhiều. Cách define route của `gorilla/mux` cũng ngắn gọn, trực quan và dễ hiểu. Một điểm cộng nữa là chúng ta có thể thấy tất cả các routes nằm gọn cùng 1 chỗ. Thực tế thì bây giờ nhìn nó rất giống với phần mà ta đã define sơ qua lúc đầu.

`gorilla/mux` là một package chỉ làm 1 thứ và làm tốt việc đấy, nó không ảnh hưởng quá nhiều để khó có thể thay thế hay loại bỏ về sau và thực sự với server này thì ta chỉ thêm vài dòng code. Nếu trong quá trình phát triển thấy package này còn nhiều hạn chế thì việc thay thế nó bằng 1 router khác sẽ hết sức đơn giản.

## Nguồn

- https://eli.thegreenplace.net/2021/rest-servers-in-go-part-2-using-a-router-package
