'use strict';

var utils = require('../utils/writer.js');
var Default = require('../service/DefaultService');

module.exports.dueYearMonthDayGET = function dueYearMonthDayGET (req, res, next, year, month, day) {
  Default.dueYearMonthDayGET(year, month, day)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.tagTagnameGET = function tagTagnameGET (req, res, next, tagname) {
  Default.tagTagnameGET(tagname)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.taskGET = function taskGET (req, res, next) {
  Default.taskGET()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.taskIdDELETE = function taskIdDELETE (req, res, next, id) {
  Default.taskIdDELETE(id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.taskIdGET = function taskIdGET (req, res, next, id) {
  Default.taskIdGET(id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.taskPOST = function taskPOST (req, res, next, body) {
  Default.taskPOST(body)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
