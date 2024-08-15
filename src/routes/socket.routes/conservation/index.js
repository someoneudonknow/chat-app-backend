"use strict";

const eventNames = {
  SET_UP: "conservation/setup",
  LEAVE: "conservation/leave",
  TYPING: "conservation/typing",
  CANCEL_TYPING: "conservation/cancel-typing",
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

  socket.on(eventNames.TYPING, ({ userId, conservation }) => {
    console.log("typing user::", userId + "::", conservation);
    socket.to(conservation).emit(eventNames.TYPING, userId);
  });

  socket.on(eventNames.CANCEL_TYPING, ({ userId, conservation }) => {
    console.log("typing user::", userId + "::", conservation);
    socket.to(conservation).emit(eventNames.CANCEL_TYPING, userId);
  });
};
