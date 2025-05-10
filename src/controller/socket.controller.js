"use strict";

const SocketService = require("../services/socket.service");

class SocketController {
  initializeUser = SocketService.initializeUser;
  handleUserDisconnected = SocketService.handleUserDisconnected;
  onLeaveCall = SocketService.onLeaveCall;
  onCreateCall = SocketService.onCreateCall;
  onCallRejected = SocketService.onCallRejected;
  onCallSetup = SocketService.setUpCall;
  getCallParticipants = SocketService.getCallParticipants;
}

module.exports = new SocketController();
