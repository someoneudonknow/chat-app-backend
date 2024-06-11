"use strict";

const eventNames = {
  CONNECTED: "user/connected",
  DISCONNECTED: "user/disconnected",
};

module.exports = (socket) => {
  socket.on(eventNames.CONNECTED, (userId) => {
    if (!userId) return;

    socket.join(userId);
  });

  socket.on(eventNames.DISCONNECTED, (userId) => {
    if (!userId) return;
    socket.leave(userId);
  });
};
