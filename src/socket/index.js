"use strict";

const { authentication } = require("../auth/auth.middlewares");
const socketRoutes = require("../routes/socket.routes");

module.exports = (io) => {
  function onConnect(socket) {
    console.log(`A socket has been established::${socket.id}`);

    socketRoutes(socket);

    socket.on("disconnect", function () {
      console.log(`A socket has disconected::${this.id}`);
    });
  }

  io.on("connection", onConnect);
};
