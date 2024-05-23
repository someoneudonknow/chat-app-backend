"use strict";

const nodemailer = require("nodemailer");
const {
  mail: { service, user, pass, host, port },
} = require("../config/config.app");

const transport = nodemailer.createTransport({
  service: service,
  host,
  port,
  auth: {
    user,
    pass,
  },
  logger: process.env.NODE_ENV !== "production",
  debug: false && process.env.NODE_ENV !== "production",
});

transport.verify(function (error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log("Server is ready to take your messages");
  }
});

module.exports = transport;
