"use strict";

var express = require('express');

require("./db/mongoose");

var app = express();

var User = require('./models/users');

var Task = require('./models/tasks');

var userRouter = require('./routers/users');

var taskRouter = require('./routers/tasks');

var port = process.env.PORT;
app.use(express.json());
app.use(userRouter);
app.use(taskRouter);
app.listen(port, function () {
  console.log("server running on port ".concat(port));
});