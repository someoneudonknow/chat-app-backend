"use strict";

const { Created, SuccessResponse } = require("../core/success.response");
const CallService = require("../services/call.service");

class CallController {
  initCall = async (req, res, next) => {
    new SuccessResponse({
      message: "Create call successfully",
      metadata: await CallService.initCall({ callerId: req.user.userId, ...req.body }),
    }).send(res);
  };

  joinCall = async (req, res, next) => {
    new SuccessResponse({
      message: "Join call successfully",
      metadata: await CallService.joinCall({
        joinerId: req.user.userId,
        callId: req.params.callId,
      }),
    }).send(res);
  };

  endCall = async (req, res, next) => {
    new SuccessResponse({
      message: "Join call successfully",
      metadata: await CallService.endCall({
        ender: req.user.userId,
        callId: req.params.callId,
      }),
    }).send(res);
  };
}

module.exports = new CallController();
