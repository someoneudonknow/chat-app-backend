"use strict";

const eventNames = {
  SET_UP: "conservation/setup",
  LEAVE: "conservation/leave",
};

module.exports = (socket) => {
  socket.on(eventNames.SET_UP, (convervation) => {
    if (!convervation) return;
    console.log("socket join room::", convervation._id);
    socket.join(convervation._id);
  });

  socket.on(eventNames.LEAVE, (convervationId) => {
    if (!convervationId) return;
    console.log("socket leave room::", convervationId);
    socket.leave(convervationId);
  });
};
