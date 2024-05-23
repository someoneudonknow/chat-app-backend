"use strict";

const mongoose = require("mongoose");
const os = require("os");

const _SECOND = 5000;

const countConnection = () => {
  const connectionNum = mongoose.connections.length;

  console.log("Number of connection::" + connectionNum);
};

const checkOverload = () => {
  setInterval(() => {
    const connectionNum = mongoose.connections.length;
    const cpuCores = os.cpus().length;
    const memoryUsage = process.memoryUsage().rss;
    const maximumConnections = cpuCores * 5;

    console.log("Memory usage::" + memoryUsage / 1024 / 1024);
    console.log("Active connections amount::" + connectionNum);

    if (connectionNum > maximumConnections) {
      console.log("Connection overloading!!!");
    }
  }, _SECOND);
};

module.exports = {
  countConnection,
  checkOverload,
};
