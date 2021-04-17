"use strict";

var sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

var sendWelcomeEmail = function sendWelcomeEmail(email, name) {
  sgMail.send({
    to: email,
    from: 'satyamkumar343@gmail.com',
    subject: 'Welcome from Task Manager',
    text: "Hi ".concat(name, ", welcome wo task manager app. We hope you will make the most out of our services")
  });
};

module.exports = {
  sendWelcomeEmail: sendWelcomeEmail
};