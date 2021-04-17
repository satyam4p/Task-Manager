"use strict";

var jwt = require('jsonwebtoken');

var users = require('../models/users');

var auth = function auth(req, res, next) {
  var token, decoded, user;
  return regeneratorRuntime.async(function auth$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          token = req.header('Authorization').replace('Bearer ', '');
          _context.next = 4;
          return regeneratorRuntime.awrap(jwt.verify(token, process.env.JWT_SECRET));

        case 4:
          decoded = _context.sent;
          _context.next = 7;
          return regeneratorRuntime.awrap(users.findOne({
            _id: decoded._id,
            'tokens.token': token
          }));

        case 7:
          user = _context.sent;

          if (user) {
            _context.next = 10;
            break;
          }

          throw new Error();

        case 10:
          req.token = token;
          req.user = user;
          next();
          _context.next = 18;
          break;

        case 15:
          _context.prev = 15;
          _context.t0 = _context["catch"](0);
          res.status(401).send("error:please authenticate");

        case 18:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 15]]);
};

module.exports = auth;