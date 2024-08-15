"use strict";

const { authentication } = require("../auth/auth.middlewares");
const SocketController = require("../controller/socket.controller");
const socketRoutes = require("../routes/socket.routes");
const { middlewareWrapper, socketErrorHandler } = require("./socket.utils");

module.exports = (io) => {
  async function onConnect(socket) {
    await SocketController.initializeUser.call(socket);

    socketRoutes(socket);

    socket.on(
      "disconnect",
      socketErrorHandler.call(socket, SocketController.handleUserDisconnected)
    );
  }

  io.use(middlewareWrapper(authentication)).on("connection", onConnect);
};
