import http from "http";
import url from "url";
import TaskStore from "./internal/taskstore/taskstore.js";
import Router from "router";
import finalhandler from "finalhandler";

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

/**
 * @param {http.ServerResponse} res
 * @param {Record<any, any>} data
 */
function renderJSON(res, data) {
  res.setHeader("Content-Type", "application/json");
  res.write(JSON.stringify(data));
  res.end();
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
   * @param {() => void} done
   */
  async createTaskHandler(req, res, done) {
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
    renderJSON(res, { id });
  }

  /**
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   * @param {() => void} done
   */
  async getAllTasksHandler(req, res, done) {
    console.info(`handling get all tasks at ${getPathName(req)}`);

    const allTasks = this.store.getAllTasks();
    renderJSON(res, allTasks);
  }

  /**
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   */
  async getTaskHandler(req, res) {
    console.info(`handling get task at ${getPathName(req)}`);
    try {
      const task = this.store.getTask(req.params.id);
      return renderJSON(res, task);
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
  async deleteTaskHandler(req, res) {
    console.info(`handling delete all tasks at ${getPathName(req)}`);
    try {
      this.store.deleteTask(req.params.id);
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
   * @param {() => void} done
   */
  async deleteAllTasksHandler(req, res, done) {
    console.info(`handling delete all tasks at ${getPathName(req)}`);
    this.store.deleteAllTasks();
    res.end();
  }

  /**
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   * @param {() => void} done
   */
  async tagHandler(req, res, done) {
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
    renderJSON(res, tasks);
  }

  /**
   * @param {http.IncomingMessage} req
   * @param {http.ServerResponse} res
   * @param {() => void} done
   */
  async dueHandler(req, res, done) {
    const pathname = getPathName(req);
    console.info(`handling tasks by due at ${pathname}`);

    if (req.method !== METHOD.GET) {
      res.statusCode = 400;
      res.statusMessage = `expect method GET /due/<date>, got ${req.method}`;
      return res.end();
    }

    const pathParts = pathname.trim().split("/");

    const year = Number(pathParts[2]);
    const month = Number(pathParts[3]);
    const day = Number(pathParts[4]);
    const tasks = this.store.getTasksByDueDate(year, month, day);
    renderJSON(res, tasks);
  }
}

const server = new TaskServer();

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

const httpServer = http.createServer((req, res) => {
  router(req, res, finalhandler(req, res));
});

const port = process.env["port"] || 3333;
httpServer.listen(port, () => {
  console.info(`Server is running at http://localhost:${port}`);
});
