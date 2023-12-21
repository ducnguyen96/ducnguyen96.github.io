---
sidebar_label: Sử dụng standard library
---

# Sử dụng standard library

Tương tự như với series rest-server với Go ở phía trên thì series này cũng sẽ cố gắng giới thiệu về các cách tiếp cận khác nhau để dựng REST server với NodeJS.

## The Task

Tổng quan về server mình sẽ không nhắc lại ở đây nữa mà các bạn có thể xem ở [đây](/docs/go/rest-server/standard-library.md#the-task).

## The Code

Phần còn lại của bài viết này sẽ giới thiệu code của server, viết bằng Javascript, theo từng phần. Code hoàn chỉnh của server có thể tìm thấy [ở đây](https://github.com/ducnguyen96/ducnguyen96.github.io/tree/master/static/code/docs/nodejs/rest-server/stdlib-basic); nó là một module độc lập, không có dependencies. Sau khi clone hoặc copy, bạn có thể chạy server mà không cần cài đặt bất cứ thứ gì:

```bash
yarn start # or yarn dev if you help nodemon installed; if you don't have yarn installed then use npm run start
```

## The Model

Tương tự với Go rest server series thì ở đây ta sẽ sử dụng 1 class - TaskStore (thư mục `internal/taskstore`). Đây là API của nó:

```js
/**
 * @typedef {Object} Task
 * @property {number} id
 * @property {string} text
 * @property {string[]} tags
 * @property {Date} due
 */

export default class TaskStore {
  tasks;
  nextId;

  constructor() {
    this.tasks = [];
    this.nextId = 0;
  }

  /**
   * createTask creates a new task in the store.
   *
   * @param {string} text
   * @param {string[]} tags
   * @param {Date} due
   * @returns {number}
   */
  createTask(text, tags, due) {}

  /**
   * getTask retrieves a task from the store, by id. If no such id exists, an
   * error is thrown.
   * @param {number} id
   * @returns {Task}
   */
  getTask(id) {}

  /**
   * deleteTask deletes the task with the given id. If no such id exists, an
   * error is thrown
   * @param {number} id
   */
  deleteTask(id) {}

  /**
   * deleteAllTasks deletes all tasks in the store.
   */
  deleteAllTasks() {}

  /**
   * getAllTasks returns all the tasks in the store, in arbitrary order.
   * @returns {Task[]}
   */
  getAllTasks() {}

  /**
   * getTasksByTag returns all the tasks that have the given tag, in arbitrary
   * order
   * @param {string} tag
   * @return {Task[]}
   */
  getTasksByTag(tag) {}

  /**
   * getTasksByDueDate returns all the tasks that have the given due date, in
   * arbitrary order.
   * @param {number} year
   * @param {number} month
   * @param {number} day
   * @returns {Task[]}
   */
  getTasksByDueDate(year, month, day) {}
}
```

## Setting up the server

Server được setup khá đơn giản:

```js
const server = new TaskServer();

const httpServer = http.createServer((req, res) => {
  const pathname = getPathName(req);

  if (pathname.startsWith("/task/")) return server.taskHandler(req, res);
  if (pathname.startsWith("/tag/")) return server.tagHandler(req, res);
  if (pathname.startsWith("/due/")) return server.dueHandler(req, res);

  res.writeHead(404);
  res.end("Not Found");
});

const port = process.env["port"] || 3333;
httpServer.listen(port, () => {
  console.info(`Server is running at http://localhost:${port}`);
});
```

constructor của `TaskServer` sẽ khởi tạo bao gồm một `TaskStore`.

```js
class TaskServer {
  /**
   * @type {TaskStore}
   */
  store;

  constructor() {
    this.store = new TaskStore();
  }
}
```

## Routing and handlers

Rất tiếc là Nodejs không có sẵn thư viện nào hỗ trợ routing nên ta sẽ phải tự viết. Ưu điểm của việc tự viết là tất nhiên ta sẽ hiểu rõ nó hoạt động thế nào còn nhược điểm thì bạn sẽ thấy ngay đó là nó làm cho việc matching path trở nên phiền phức và phải chia ra nhiều nơi.

Ta bắt đầu với việc matching root paths như `/task/`, `/tag/` và `/due/`:

```js
if (pathname.startsWith("/task/")) return server.taskHandler(req, res);
if (pathname.startsWith("/tag/")) return server.tagHandler(req, res);
if (pathname.startsWith("/due/")) return server.dueHandler(req, res);
```

các handlers cho từng root sẽ được define trong các root handler tương ứng chẳng hạn:

```js
taskHandler(req, res) {
  const pathname = getPathName(req);
  const method = req.method;

  if (pathname === "/task/") {
    switch (method) {
      case METHOD.POST:
        return this.createTaskHandler(req, res);
      case METHOD.GET:
        return this.getAllTasksHandler(req, res);
      case METHOD.DELETE:
        return this.deleteAllTasksHandler(req, res);
      default:
        res.statusCode = 405;
        res.statusMessage = `Method Not Allowed`;
        return res.end();
    }
  }
```

Chúng ta bắt đầu với exact match của path với `/task/` (nghĩa là không có `<taskid>` theo sau). Ở đây ta phải xác định HTTP method nào được sử dụng, và gọi method thích hợp. Hầu hết các handler đều là các wrapper đơn giản của `TaskStore` API. Hãy xem ví dụ sau đây:

```js
getAllTasksHandler(req, res) {
  console.info(`handling get all tasks at ${getPathName(req)}`);

  const allTasks = this.store.getAllTasks();
  res.setHeader("Content-Type", "application/json");
  res.write(JSON.stringify(allTasks));
  res.end();
}
```

Handler này có 2 việc chính:

1. Lấy dữ liệu từ model (`TaskStore`)
2. Điền vào HTTP response cho client

Cả 2 đều rất trực quan, nhưng nếu bạn nhìn vào các handlers khác thì bạn sẽ thấy bước thứ 2 lặp lại khá nhiều - stringify JSON, write HTTP response header, v.v. Chúng ta sẽ quay lại vấn đề này sau.

Bây giờ trở lại với `taskHandler`; cho đến nay chúng ta đã thấy cách nó xử lý các exact match của `/task/`. Còn `/task/<taskid>` thì sao?

```js
} else {
  const pathParts = pathname.trim().split("/");
  if (pathParts.length < 2) {
    res.statusCode = 400;
    res.statusMessage = "expect /task/<id> in task handler";
    return res.end();
  }

  const id = parseInt(pathParts[2]);
  if (Number.isNaN(id)) {
    res.statusCode = 400;
    res.statusMessage = "expect id is a number";
    return res.end();
  }

  switch (method) {
    case METHOD.DELETE:
      return this.deleteTaskHandler(req, res, id);
    case METHOD.GET:
      return this.getTaskHandler(req, res, id);
    default:
      res.statusCode = 405;
      res.statusMessage = `expect method GET or DELETE at /task/<id>, got ${method}`;
      return res.end();
  }
}
```

Khi path không khớp chính xác với `/task/`, chúng ta expect có một ID theo sau dấu `/`. Đoạn code trên parses ID này và gọi handler phù hợp (dựa trên HTTP method).

Phần còn lại thì cũng tương tự và dễ hiểu. Chỉ có `createTaskHandler` hơi đặc biệt, vì nó phải parse JSON data được gửi bởi client trong request body. Có một vài điểm về JSON parsing mà tôi không đề cập - hãy xem [bài viết này](/blog/2023/how-to-properly-parse-a-json-request-body) để biết chi tiết hơn.

## Making improvements

Bây giờ chúng ta đã có một server cơ bản, hãy xem xem nó có thể có những vấn đề nào hay có thể cải thiện được chỗ nào.

Điều dễ nhận thấy nhất là ta có thể cải thiện phần lặp đi lặp lại render JSON vào HTTP response. Chi tiết bạn có thể xem [ở đây](https://github.com/ducnguyen96/ducnguyen96.github.io/tree/master/static/code/docs/nodejs/rest-server/stdlib-factorjson). Dưới đây là điểm thay đổi chính:

```js
/**
 * @param {http.ServerResponse} res
 * @param {Record<any, any>} data
 */
function renderJSON(res, data) {
  res.setHeader("Content-Type", "application/json");
  res.write(JSON.stringify(data));
  res.end();
}
```

Sử dụng hàm này thì ta có thể viết lại tất cả các handlers một cách ngắn gọn hơn, chẳng hạn như sau:

```js
/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
getAllTasksHandler(req, res) {
  console.info(`handling get all tasks at ${getPathName(req)}`);

  const allTasks = this.store.getAllTasks();
  renderJSON(res, allTasks);
}
```

Một điểm cải thiện khác mà ta có thể nghĩ đến là làm cho việc matching path trở nên clear, hiện tại thì nó đang không được rõ ràng cho lắm, chẳng hạn nếu muốn biết một DELETE request tới `/task/<taskid>` sẽ đi tới đâu:

1. Đầu tiên, tìm mux trong `main` và thấy rằng `/task/` sẽ đi tới `taskHandler`
2. Sau đó trong `taskHandler` ta phải tìm `else` khi mà route không exact match với `/task/`. Sau đó phải đọc tiếp phần code để parse `<taskid>` thành 1 integer
3. Cuối cùng thì phải check request method mới tới được `deleteTaskHandler`

Việc đặt 3 bước trên vào 1 chỗ duy nhất sao cho dễ hiểu và trực quan nhất là mục tiêu mà các thư viện bên thứ 3 hướng tới. Chúng ta sẽ tìm hiểu về điều này ở [bài viết tiếp theo](/docs/nodejs/rest-server/using-a-router-package).
