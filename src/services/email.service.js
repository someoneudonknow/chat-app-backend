"use strict";

const transporter = require("../db/init.nodemailer");

const sendMail = async (config) => {
  return await transporter.sendMail(config);
};

module.exports = {
  sendMail,
};
