// @ts-check

/**
 * @typedef {Object} Task
 * @property {number} id
 * @property {string} text
 * @property {string[]} tags
 * @property {Date} due
 */

export default class TaskStore {
  /**
   * @type {Task[]}
   */
  tasks;

  /**
   * @type {number}
   */
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
  createTask(text, tags, due) {
    const task = {
      id: this.nextId,
      text,
      tags,
      due,
    };

    this.tasks.push(task);
    this.nextId++;

    return task.id;
  }

  /**
   * getTask retrieves a task from the store, by id. If no such id exists, an
   * error is thrown.
   * @param {number} id
   * @returns {Task}
   */
  getTask(id) {
    const task = this.tasks[id];
    if (!task) throw new Error(`task with id=${id} not found`);
    return task;
  }

  /**
   * deleteTask deletes the task with the given id. If no such id exists, an
   * error is thrown
   * @param {number} id
   */
  deleteTask(id) {
    const task = this.tasks[id];
    if (!task) throw new Error(`task with id=${id} not found`);
    delete this.tasks[id];
  }

  /**
   * deleteAllTasks deletes all tasks in the store.
   */
  deleteAllTasks() {
    this.tasks = [];
  }

  /**
   * getAllTasks returns all the tasks in the store, in arbitrary order.
   * @returns {Task[]}
   */
  getAllTasks() {
    return this.tasks;
  }

  /**
   * getTasksByTag returns all the tasks that have the given tag, in arbitrary
   * order
   * @param {string} tag
   * @return {Task[]}
   */
  getTasksByTag(tag) {
    return this.tasks.filter((task) => task.tags.includes(tag));
  }

  /**
   * getTasksByDueDate returns all the tasks that have the given due date, in
   * arbitrary order.
   * @param {number} year
   * @param {number} month
   * @param {number} day
   * @returns {Task[]}
   */
  getTasksByDueDate(year, month, day) {
    return this.tasks.filter((task) => {
      const due = new Date(task.due);
      return (
        due.getFullYear() === year &&
        due.getMonth() + 1 === month &&
        due.getDate() === day
      );
    });
  }
}
