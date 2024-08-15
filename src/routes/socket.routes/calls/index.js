"use strict";

const socketController = require("../../../controller/socket.controller");
const { socketErrorHandler } = require("../../../socket/socket.utils");

const eventNames = {
  CREATE_CALL: "calls/created",
  CALL_REJECT: "calls/rejected",
  SETUP_CALL: "calls/setup",
  LEAVE_CALL: "calls/leave",
};

module.exports = (socket) => {
  socket.on(eventNames.CREATE_CALL, socketErrorHandler.call(socket, socketController.onCreateCall));
  socket.on(
    eventNames.CALL_REJECT,
    socketErrorHandler.call(socket, socketController.onCallRejected)
  );
  socket.on(eventNames.SETUP_CALL, socketErrorHandler.call(socket, socketController.onCallSetup));
  socket.on(eventNames.LEAVE_CALL, socketErrorHandler.call(socket, socketController.onLeaveCall));
};
