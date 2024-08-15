"use strict";

const UserRepository = require("../../../models/repositories/user.repository");

const eventNames = {
  CONNECTED: "user/connected",
  DISCONNECTED: "user/disconnected",
};

module.exports = (socket) => {
  socket.on(eventNames.CONNECTED, async (userId) => {
    if (userId) {
      socket.join(userId);
    }
  });

  socket.on(eventNames.DISCONNECTED, async (userId) => {
    if (userId) {
      socket.leave(userId);
    }
  });
};
