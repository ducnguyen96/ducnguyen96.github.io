// @ts-check

import http from "http";
import url from "url";
import TaskStore from "./internal/taskstore/taskstore.js";

const METHOD = {
  GET: "GET",
  POST: "POST",
  DELETE: "DELETE",
  PATCH: "PATCH",
  PUT: "PUT",
};

/**
 * @param {http.IncomingMessage} req
 */
function getPathName(req) {
  const parsedUrl = url.parse(req.url || "", true);
  return parsedUrl.pathname || "";
}

class TaskServer {
  /**
   * @type {TaskStore}
   */
  store;

  constructor() {
    this.store = new TaskStore();
  }

  /**
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   */
  async taskHandler(req, res) {
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
  }

  /**
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   */
  async createTaskHandler(req, res) {
    // Enforce a JSON Content-Type.
    const contentType = req.headers["content-type"];
    if (!contentType || contentType.toLowerCase() !== "application/json") {
      res.statusCode = 415;
      res.statusMessage = "expect application/json Content-Type";
      res.end();
      return;
    }
    // Read the body.
    let body = "";
    for await (const chunk of req) {
      body += chunk;
    }

    // Parse the body - RequestTag
    let rt;
    try {
      rt = JSON.parse(body);
    } catch (error) {
      res.statusCode = 400;
      res.statusMessage = "expect valid JSON body";
      res.end();
      return;
    }

    const id = this.store.createTask(rt.text, rt.tags, rt.due);
    res.setHeader("Content-Type", "application/json");
    res.write(JSON.stringify({ id }));
    res.end();
  }

  /**
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   */
  async getAllTasksHandler(req, res) {
    console.info(`handling get all tasks at ${getPathName(req)}`);

    const allTasks = this.store.getAllTasks();
    res.setHeader("Content-Type", "application/json");
    res.write(JSON.stringify(allTasks));
    res.end();
  }

  /**
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   * @param {number} id
   */
  async getTaskHandler(req, res, id) {
    console.info(`handling get task at ${getPathName(req)}`);

    try {
      const task = this.store.getTask(id);
      res.setHeader("Content-Type", "application/json");
      res.write(JSON.stringify(task));
      res.end();
      return;
    } catch (error) {
      res.statusCode = 404;
      res.statusMessage = error;
      res.end();
      return;
    }
  }

  /**
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   * @param {number} id
   */
  async deleteTaskHandler(req, res, id) {
    console.info(`handling delete all tasks at ${getPathName(req)}`);
    try {
      this.store.deleteTask(id);
      return res.end();
    } catch (error) {
      res.statusCode = 404;
      res.statusMessage = error;
      res.end();
      return;
    }
  }

  /**
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   */
  async deleteAllTasksHandler(req, res) {
    console.info(`handling delete all tasks at ${getPathName(req)}`);
    this.store.deleteAllTasks();
    res.end();
  }

  /**
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   */
  async tagHandler(req, res) {
    const pathname = getPathName(req);
    console.info(`handling tasks by tag at ${pathname}`);

    if (req.method !== METHOD.GET) {
      res.statusCode = 400;
      res.statusMessage = `expect method GET /tag/<tag>, got ${req.method}`;
      return res.end();
    }

    const pathParts = pathname.trim().split("/");
    if (pathParts.length < 2) {
      res.statusCode = 400;
      res.statusMessage = "expect /tag/<tag> in task handler";
      return res.end();
    }

    const tag = pathParts[2];

    const tasks = this.store.getTasksByTag(tag);
    res.setHeader("Content-Type", "application/json");
    res.write(JSON.stringify(tasks));
    res.end();
  }

  /**
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   */
  async dueHandler(req, res) {
    const pathname = getPathName(req);
    console.info(`handling tasks by due at ${pathname}`);

    if (req.method !== METHOD.GET) {
      res.statusCode = 400;
      res.statusMessage = `expect method GET /due/<date>, got ${req.method}`;
      return res.end();
    }

    const pathParts = pathname.trim().split("/");

    const badRequestError = () => {
      res.statusCode = 400;
      res.statusMessage = `expect /due/<year>/<month>/<day>, got ${pathname}`;
      return res.end();
    };

    if (pathParts.length !== 5) {
      return badRequestError();
    }

    const year = Number(pathParts[2]);
    if (Number.isNaN(year)) return badRequestError();

    const month = Number(pathParts[3]);
    if (Number.isNaN(year)) return badRequestError();

    const day = Number(pathParts[4]);
    if (Number.isNaN(year)) return badRequestError();

    const tasks = this.store.getTasksByDueDate(year, month, day);
    res.setHeader("Content-Type", "application/json");
    res.write(JSON.stringify(tasks));
    res.end();
  }
}

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
