"use strict";

const { TaskStore } = require("../taskstore/taskstore");
const { respondWithCode } = require("../utils/writer");

const store = new TaskStore();

/**
 * Get tasks with given due date
 *
 * year Integer The year
 * month Integer The month
 * day Integer The day
 * returns List
 **/
exports.dueYearMonthDayGET = function (year, month, day) {
  return new Promise(function (resolve, reject) {
    resolve(store.getTasksByDueDate(year, month, day));
  });
};

/**
 * Get tasks with given tag name
 *
 * tagname String The tag name
 * returns List
 **/
exports.tagTagnameGET = function (tagname) {
  return new Promise(function (resolve, reject) {
    resolve(store.getTasksByTag(tagname));
  });
};

/**
 * Returns a list of all tasks
 *
 * returns List
 **/
exports.taskGET = function () {
  return new Promise(function (resolve, reject) {
    resolve(store.getAllTasks());
  });
};

/**
 * Delete task with specific id
 *
 * id Integer The user ID
 * no response value expected for this operation
 **/
exports.taskIdDELETE = function (id) {
  return new Promise(function (resolve, reject) {
    try {
      store.deleteTask(id);
      resolve();
    } catch (error) {
      reject(respondWithCode(404, { message: error.message }));
    }
  });
};

/**
 * Get task with specific id
 *
 * id Integer The user ID
 * returns Task
 **/
exports.taskIdGET = function (id) {
  return new Promise(function (resolve, reject) {
    try {
      const response = store.getTask(id);
      resolve(response);
    } catch (error) {
      reject(respondWithCode(404, { message: error.message }));
    }
  });
};

/**
 * Create a task
 *
 * body Task_body Task to be added to the store (optional)
 * returns Integer
 **/
exports.taskPOST = function (body) {
  return new Promise(function (resolve, reject) {
    resolve({ id: store.createTask(body.text, body.tags, body.due) });
  });
};
