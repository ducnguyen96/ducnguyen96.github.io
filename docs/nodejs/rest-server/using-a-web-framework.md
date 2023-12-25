---
sidebar_label: Sử dụng framework
---

# Sử dụng framework

## Chọn framework

Có rất nhiều frameworks để làm web server với Node.js. Mỗi framework có điểm mạnh riêng. Chúng ta sẽ không so sánh và thảo luận về những frameworks này mà thay vào đó thì ta sẽ xem xét sự khác nhau giữa 1 bên là sử dụng framework và 1 bên không.

Ta sẽ sử dụng Express vì nó phổ biến nhất(theo số lượng Github stars), nó có vẻ khá tối giản và dễ sử dụng.

## Sử dụng router của Express

Vì pillarjs/router là về cơ bản là được viết lại từ Express, nên ta có thể sử dụng Express router mà không cần phải thay đổi gì.

```js
const router = Router({ strict: true, mergeParams: true });

router.post("/task/", server.createTaskHandler.bind(server));
router.get("/task/", server.getAllTasksHandler.bind(server));
router.delete("/task/", server.deleteAllTasksHandler.bind(server));
router.get("/task/:id(\\d+)", server.getTaskHandler.bind(server));
router.delete("/task/:id(\\d+)", server.deleteTaskHandler.bind(server));
router.get("/tag/:tag", server.tagHandler.bind(server));
router.get(
  "/due/:year(\\d+)/:month(\\d+)/:day(\\d+)",
  server.dueHandler.bind(server)
);
```

## Handlers

Hãy xem qua 1 ví dụ về handler của Express:

```js
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('connect').NextHandleFunction} next
 */
async getAllTasksHandler(req, res, next) {
  console.info(`handling get all tasks at ${req.path}`);

  const allTasks = this.store.getAllTasks();
  res.json(allTasks);
}
```

Một số điểm đáng chú ý ở đây:

1. Express handlers nhận đầu vào là request và response riêng của Express. Nó có nhiều properties và methods rất hữu ích.
2. Ta không cần phải implement renderJSON nữa vì Express đã có sẵn res.json.

Dưới đây là một ví dụ khác:

```js
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('connect').NextHandleFunction} next
 */
async getTaskHandler(req, res, next) {
  console.info(`handling get task at ${req.path}`);
  try {
    const task = this.store.getTask(req.params.id);
    res.json(task);
  } catch (error) {
    res.statusMessage = error;
    res.sendStatus(404);
    return;
  }
}
```

Tương tự với pollardjs/router, ta có thể sử dụng `req.params` để lấy các giá trị từ URL.

## Body parser

Cuối cùng thì ta sẽ xem cách handle request body với `createTaskHandler`

```js
router.post("/task/", json(), server.createTaskHandler.bind(server));

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('connect').NextHandleFunction} next
 */
async createTaskHandler(req, res, next) {
  console.info(`handling get all tasks at ${req.path}`);
  const { body } = req;

  const id = this.store.createTask(body.text, body.tags, body.due);
  res.json({ id });
}
```

Bắt đầu từ phiên bản `4.16.0+` thì express tích hợp body parser. Ta có thể sử dụng `json()` middleware để parse JSON body. Request body sau đấy có thể được truy cập thông qua `req.body`.

## Một vài tính năng khác

Bài viết này chỉ đề cập qua 1 số tính năng cơ bản của Express. Nó còn một số tính năng khác thường dùng như middleware, template engines, static files, etc. Các tính năng đấy không quá khó để tự viết nhưng chắc chắn sử dụng Express sẽ giúp ta tiết kiệm được thời gian.

## Hạn chế

Nếu đánh giá Express ở góc độ là framework dành cho Nodejs thì nó thực sự không có quá nhiều hạn chế. Express không ép buộc bạn phải viết theo 1 style cụ thể nào cả. Nó cũng khá tối giản, clear và dễ hiểu.
