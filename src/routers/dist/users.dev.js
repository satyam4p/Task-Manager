"use strict";

var express = require('express');

var router = new express.Router();

var User = require('../models/users');

var auth = require('../middleware/auth');

var multer = require('multer');

var sharp = require('sharp');

var _require = require('../email/accounts'),
    sendWelcomeEmail = _require.sendWelcomeEmail;

router.post("/users", function _callee(req, res) {
  var user, token;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          user = new User(req.body);
          _context.prev = 1;
          _context.next = 4;
          return regeneratorRuntime.awrap(user.save());

        case 4:
          sendWelcomeEmail(user.email, user.name);
          _context.next = 7;
          return regeneratorRuntime.awrap(user.generateAuthToken());

        case 7:
          token = _context.sent;
          res.status(201).send({
            user: user,
            token: token
          });
          _context.next = 15;
          break;

        case 11:
          _context.prev = 11;
          _context.t0 = _context["catch"](1);
          console.log("Error:", _context.t0);
          res.status("400").send(_context.t0);

        case 15:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[1, 11]]);
});
router.post("/users/login", function _callee2(req, res) {
  var user, token;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap(User.findByCredentials(req.body.email, req.body.password));

        case 3:
          user = _context2.sent;
          _context2.next = 6;
          return regeneratorRuntime.awrap(user.generateAuthToken());

        case 6:
          token = _context2.sent;

          /* using shorthand syntax to edclare and assign value in object by using { name_of_key_and_value} 
              e.g: {user,token} which equates to { user:user, token:token}*/
          res.send({
            user: user,
            token: token
          });
          _context2.next = 13;
          break;

        case 10:
          _context2.prev = 10;
          _context2.t0 = _context2["catch"](0);
          res.status(400).send();

        case 13:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 10]]);
});
router.get("/users/me", auth, function _callee3(req, res) {
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          res.send(req.user);

        case 1:
        case "end":
          return _context3.stop();
      }
    }
  });
});
router.post("/users/logout", auth, function _callee4(req, res) {
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          req.user.tokens = req.user.tokens.filter(function (token) {
            /* if tokens are not equal then filter will keep the token in tokens array
             and if equal it will remove the token from tokens array*/
            return token.token !== req.token;
          });
          _context4.next = 4;
          return regeneratorRuntime.awrap(req.user.save());

        case 4:
          res.send();
          _context4.next = 10;
          break;

        case 7:
          _context4.prev = 7;
          _context4.t0 = _context4["catch"](0);
          res.status(400).send(_context4.t0);

        case 10:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 7]]);
});
router.use("/users/logoutAll", auth, function _callee5(req, res) {
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          req.user.tokens = [];
          _context5.next = 4;
          return regeneratorRuntime.awrap(req.user.save());

        case 4:
          res.send();
          _context5.next = 10;
          break;

        case 7:
          _context5.prev = 7;
          _context5.t0 = _context5["catch"](0);
          res.status(400).send(_context5.t0);

        case 10:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 7]]);
});
router.patch("/users/me", auth, function _callee6(req, res) {
  var allowedUpdates, updates, isValidUpdate;
  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          allowedUpdates = ["name", "age", "email", "password"];
          updates = Object.keys(req.body);
          isValidUpdate = updates.every(function (update) {
            return allowedUpdates.includes(update);
          });

          if (!isValidUpdate) {
            res.status(400).send({
              error: "Invalid Update"
            });
          }

          _context6.prev = 4;
          // const user = await User.findByIdAndUpdate(req.params.id,req.body,{ new:true, runValidators:true })
          // const user = await User.findById(req.user._id);
          updates.forEach(function (update) {
            req.user[update] = req.body[update];
          });
          _context6.next = 8;
          return regeneratorRuntime.awrap(req.user.save());

        case 8:
          res.send(req.user);
          _context6.next = 14;
          break;

        case 11:
          _context6.prev = 11;
          _context6.t0 = _context6["catch"](4);
          res.status(400).send(_context6.t0);

        case 14:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[4, 11]]);
});
router["delete"]("/users/me", auth, function _callee7(req, res) {
  return regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          try {
            req.user.remove();
            res.send(req.user);
          } catch (error) {
            res.status(400).send(error);
          }

        case 1:
        case "end":
          return _context7.stop();
      }
    }
  });
});
var upload = multer({
  // dest : 'profile', we needed to store the images in db so to get access to image buffer in async method we remove the dest feild in multer
  limits: {
    fileSize: 1000000
  },
  fileFilter: function fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
      return cb(new Error("please upload an image"));
    }

    cb(undefined, true);
  }
}); //the last argument in post method is for sending the error for any unhandled error that are thrwon from middlewares
//in following case multer is the middleware which is throwing error

router.post("/users/me/avatar", auth, upload.single('avatar'), function _callee8(req, res) {
  var buffer;
  return regeneratorRuntime.async(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          _context8.next = 2;
          return regeneratorRuntime.awrap(sharp(req.file.buffer).resize({
            width: 250,
            height: 250
          }).png().toBuffer());

        case 2:
          buffer = _context8.sent;
          req.user.avatar = buffer;
          _context8.next = 6;
          return regeneratorRuntime.awrap(req.user.save());

        case 6:
          res.send();

        case 7:
        case "end":
          return _context8.stop();
      }
    }
  });
}, function (error, req, res, next) {
  res.status(400).send({
    error: error.message
  });
});
router["delete"]("/users/me/avatar", auth, function _callee9(req, res) {
  return regeneratorRuntime.async(function _callee9$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          req.user.avatar = undefined;
          _context9.next = 3;
          return regeneratorRuntime.awrap(req.user.save());

        case 3:
          res.send(200);

        case 4:
        case "end":
          return _context9.stop();
      }
    }
  });
});
router.get("/users/:id/avatar", function _callee10(req, res) {
  var user;
  return regeneratorRuntime.async(function _callee10$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          _context10.next = 2;
          return regeneratorRuntime.awrap(User.findById(req.params.id));

        case 2:
          user = _context10.sent;

          if (user) {
            _context10.next = 5;
            break;
          }

          return _context10.abrupt("return", res.status(404));

        case 5:
          res.set('Content-Type', 'image/png');
          res.send(user.avatar);

        case 7:
        case "end":
          return _context10.stop();
      }
    }
  });
});
module.exports = router;