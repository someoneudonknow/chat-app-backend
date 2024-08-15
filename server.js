"use strict";

// process.on("uncaughtException", (e) => {
//   console.log("Uncaught exception::" + e);
//   console.log("Process is exiting");
//   process.exit(1);
// });

const http = require("http");
const app = require("./src/app");
const {
  app: { port },
  origin,
} = require("./src/config/config.app");

const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: `${origin}`,
  },
  debug: true,
});

const serverInstance = server.listen(port, () => {
  console.log("App start with port::" + port);
});

// init socket server events listeners
require("./src/socket/index")(io);

global._io = io;

// process.on("unhandledRejection", (e) => {
//   console.log("Unhandled rejection::" + e);
//   console.log("Server is shutting down");

//   serverInstance.close(() => {
//     process.exit(1);
//   });
// });

// process.on("SIGINT", () => {
//   console.log("Ctrl c deteted app is closing");

//   serverInstance.close(() => {
//     console.log("Server closed");
//   });
// });

module.exports = server;
