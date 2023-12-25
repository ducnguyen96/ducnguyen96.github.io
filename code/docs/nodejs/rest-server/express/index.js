import TaskStore from "./internal/taskstore/taskstore.js";
import express, { json } from "express";

class TaskServer {
  /**
   * @type {TaskStore}
   */
  store;

  constructor() {
    this.store = new TaskStore();
  }

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

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('connect').NextHandleFunction} next
   */
  async deleteTaskHandler(req, res, next) {
    console.info(`handling delete all tasks at ${req.path}`);
    try {
      this.store.deleteTask(req.params.id);
      res.end();
    } catch (error) {
      res.statusMessage = error;
      res.sendStatus(404);
    }
  }

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('connect').NextHandleFunction} next
   */
  async deleteAllTasksHandler(req, res, next) {
    console.info(`handling delete all tasks at ${req.path}`);
    this.store.deleteAllTasks();
    res.end();
  }

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('connect').NextHandleFunction} next
   */
  async tagHandler(req, res, next) {
    console.info(`handling tasks by tag at ${req.path}`);

    const tasks = this.store.getTasksByTag(req.params.tag);
    res.json(tasks);
  }

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('connect').NextHandleFunction} next
   */
  async dueHandler(req, res, next) {
    console.info(`handling tasks by due at ${req.path}`);

    const year = Number(req.params.year);
    const month = Number(req.params.month);
    const day = Number(req.params.day);
    const tasks = this.store.getTasksByDueDate(year, month, day);
    res.json(tasks);
  }
}

const server = new TaskServer();

const router = express.Router({ strict: true, mergeParams: true });
router.post("/task/", json(), server.createTaskHandler.bind(server));
router.get("/task/", server.getAllTasksHandler.bind(server));
router.delete("/task/", server.deleteAllTasksHandler.bind(server));
router.get("/task/:id(\\d+)", server.getTaskHandler.bind(server));
router.delete("/task/:id(\\d+)", server.deleteTaskHandler.bind(server));
router.get("/tag/:tag", server.tagHandler.bind(server));
router.get(
  "/due/:year(\\d+)/:month(\\d+)/:day(\\d+)",
  server.dueHandler.bind(server)
);

const app = express();
app.use(router);

const port = process.env["port"] || 3333;
app.listen(port, () => {
  console.info(`Server is running at http://localhost:${port}`);
});
