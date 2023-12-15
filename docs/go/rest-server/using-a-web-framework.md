---
sidebar_label: Sử dụng framework
---

# Sử dụng framework

## Chọn framework

Go có một vài frameworks phổ biến và mỗi framework thì có điểm mạnh riêng. Chúng ta sẽ không so sánh và thảo luận về những frameworks này mà thay vào đó thì ta sẽ xem xét sự khác nhau giữa 1 bên là sử dụng framework và 1 bên không.

Ta sẽ sử dụng Gin vì nó phổ biến nhất(theo số lượng Github stars), nó có vẻ khá tối giản và dễ sử dụng. Docs của Gin còn khá sơ sài tuy nhiên thì framework này khá trực quan.

Điểm tốt ở Gin là nó không áp đặt app của bạn theo 1 style(ví dụ: MVC) cụ thể nào. Sử dụng Gin gần giống với việc viết code không theo 1 framework nào, ngoại trừ việc bạn có thêm nhiều công cụ cũng như lượng code được rút giảm.

## Sử dụng router của Gin

Đây là cách setup một Gin router và register routes.

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

`gin.Default()` trả về 1 default engine(1 type của Gin) được sử dụng như 1 router và cung cấp các chức năng khác. `Default` engine chỉ bao gồm middleware cơ bản để recover crash và logging.

Việc đăng ký 1 route khá quen thuộc. Nó chỉ hơi khác so với phiên bản [gorilla](/docs/go/rest-server/using-a-router-package), ở một vài điểm sau:

1. Thay vì gọi thêm 1 HTTP method lên route thì nó dùng luôn HTTP method làm tên. Chẳng hạn `router.POST` thay vì `router.HandleFunc(...).Methods("POST")`.
2. Gorilla hỗ trợ regexp matching trong routes, còn Gin không hỗ trợ. Đây là một hạn chế của Gin mà ta sẽ đề cập sau.

## Handlers

Hãy xem qua 1 ví dụ về Gin's handler.

```go
func (ts *taskServer) getAllTasksHandler(c *gin.Context) {
  allTasks := ts.store.GetAllTasks()
  c.JSON(http.StatusOK, allTasks)
}
```

Một số điểm thú vị ở đây:

1. Gin handlers không theo HTTP handler tiêu chuẩn, chúng nhận đầu vào là `gin.Context` - có thể được sử dụng để phân tích request hoặc xây dựng response. Tuy nhiên Gin có thể tương tác với handler tiêu chuẩn bằng cách sử dụng `gin.WrapF` và `gin.WrapH`.
2. Khác với 2 phiên bản trước thì mặc định Gin thêm 1 middleware cho logging.
3. Ta cũng không cần phải implement `renderJSON` nữa vì Gin có `Context.JSON` để render JSON.

Hãy xem thêm 1 ví dụ phức tạp hơn.

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

Gin cho phép access tới tham số của route thông qua context.

Gorilla routes không hỗ trợ regexps (vì quan ngại về hiệu năng), vì vậy nên ta phải parse integer và check lỗi.

## Bindings

Cuối cùng thì ta sẽ xem `createTaskHandler`, nó xử lý request chứa data phức tạp.

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

Tính năng binding requests với Go data khá xịn xò. Binding ở đây là parse content của request(có thể là JSON, YAML hoặc các formats khác), validate chúng và gán giá trị vào các structs. Ở đây ta sử dụng 1 ví dụ cơ bản không có bất cứ validation nào.

Ta có thể thấy ở đây thì phiên bản của Gin ngắn gọn hơn các phiên bản trước qua việc sử dụng method `ShouldBindJSON`

Một điểm khác cần lưu ý là ta không cần phải khai báo 1 `struct` cụ thể cho repsonse mà thay vào đó có thể sử dụng `gin.H`(là `map[string]interface{}` trá hình), đơn giản nhưng hiệu quả.

## Một vài tính năng khác

Bài viết này chỉ đề cập qua 1 số tính năng cơ bản của Gin. Nó còn có 1 số tính năng khác thường dùng như middleware, authentication và 1 số helpers dùng để render HTML templates. Các tính năng đấy không khó để tự viết nhưng chắc chắc sử dụng Gin sẽ nhanh hơn và ít code hơn.

## Hạn chế

Cái giá cho sự tiện lợi khi sử dụng framework là các hạn chế của chúng(chẳng hạn như không hỗ trợ regexp) cũng như nó sẽ thay đổi style code của bạn.

Bất cứ package hay tool nào đều cũng có hạn chế, tuy nhiên sự hạn chế của framework ảnh hưởng rất lớn.

Nếu bạn thấy Gorilla's `mux` không đáp ứng nhu cầu của bạn thì bạn có thể thay thế bằng 1 package khác, mặc dù vẫn sẽ phải mất công để chuyển đổi tuy nhiên không quá nhiều - chỉ ảnh hưởng đến phần config router.

Ngược lại thì với một ứng dụng lớn được với bằng Gin và bỗng dưng việc không hỗ trợ regex trở thành critical, ta không thể dễ dàng thay thế nó bằng 1 framework khác vì app đã được build dựa vào nó. Cái giá phải trả là cao hơn nhiều.

Ở đây thì mình không thuyết phục cũng như ngăn cản việc sử dụng framework mà chỉ cố gắng đưa ra quan điểm 1 cách khách quan nhất.

## Sources

- https://eli.thegreenplace.net/2021/rest-servers-in-go-part-3-using-a-web-framework/
