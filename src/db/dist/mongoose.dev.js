"use strict";

var mongoose = require('mongoose');

var validator = require('validator');

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useCreateIndex: true
});