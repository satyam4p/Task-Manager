"use strict";

var mongoose = require('mongoose');

var validator = require('validator');

var bcrypt = require('bcryptjs');

var jwt = require('jsonwebtoken');

var Task = require('../models/tasks');

var userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    validate: function validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Email feild is invalid!");
      }
    }
  },
  age: {
    type: Number,
    validate: function validate(value) {
      if (value < 1) {
        throw new Error("The age cannot be negetive");
      }
    }
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 7,
    validate: function validate(value) {
      if (value.toLowerCase().includes("password")) {
        throw new Error("The password cannot container test password");
      }
    }
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }],
  //this feild is for stroing images in db
  avatar: {
    type: Buffer
  }
}, {
  timestamps: true
});
/*following is the virtual relations ship between the user and task model for mongoose to figure out how these two models are related
    the format: userSchema.virtual("name of field",{
         ref :'ref of the model in relationship',
         localField:'_id', *name of field in user model
         foreignField:'owner' *name used in task model
    })
 */

userSchema.virtual('tasks', {
  ref: 'Tasks',
  localField: '_id',
  foreignField: 'owner'
});
/* the methods are specific to instance of a user also called as instance methods,
we are using standard methods because we want to access the instance using 'this' 
which we cannot do using arrow function*/

userSchema.methods.generateAuthToken = function _callee() {
  var user, token;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          user = this;
          token = jwt.sign({
            _id: user._id.toString()
          }, process.env.JWT_SECRET);
          user.tokens = user.tokens.concat({
            token: token
          });
          _context.next = 5;
          return regeneratorRuntime.awrap(user.save());

        case 5:
          return _context.abrupt("return", token);

        case 6:
        case "end":
          return _context.stop();
      }
    }
  }, null, this);
};

userSchema.methods.toJSON = function () {
  var user = this;
  var userObject = user.toObject();
  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;
  return userObject;
};
/* the statics are the model methods which are used by models thus called as model methods*/


userSchema.statics.findByCredentials = function _callee2(email, password) {
  var user, isMatch;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(User.findOne({
            email: email
          }));

        case 2:
          user = _context2.sent;

          if (user) {
            _context2.next = 5;
            break;
          }

          throw new Error("Unable to login");

        case 5:
          _context2.next = 7;
          return regeneratorRuntime.awrap(bcrypt.compare(password, user.password));

        case 7:
          isMatch = _context2.sent;

          if (isMatch) {
            _context2.next = 10;
            break;
          }

          throw new Error("Unable to login");

        case 10:
          return _context2.abrupt("return", user);

        case 11:
        case "end":
          return _context2.stop();
      }
    }
  });
};
/*this is used to check in password was changed or new user was 
 created then following logic will hash the password of user*/


userSchema.pre('save', function _callee3(next) {
  var user;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          user = this;

          if (!user.isModified('password')) {
            _context3.next = 5;
            break;
          }

          _context3.next = 4;
          return regeneratorRuntime.awrap(bcrypt.hash(user.password, 8));

        case 4:
          user.password = _context3.sent;

        case 5:
          next();

        case 6:
        case "end":
          return _context3.stop();
      }
    }
  }, null, this);
});
userSchema.pre('remove', function _callee4(next) {
  var user;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          user = this;
          _context4.next = 3;
          return regeneratorRuntime.awrap(Task.deleteMany({
            owner: user._id
          }));

        case 3:
          next();

        case 4:
        case "end":
          return _context4.stop();
      }
    }
  }, null, this);
});
var User = mongoose.model("Users", userSchema);
module.exports = User;