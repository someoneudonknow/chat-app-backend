"use strict";

const { SuccessResponse } = require("../core/success.response");
const CallService = require("../services/call.service");

class CallController {
  getCallSummary = async (req, res, next) => {
    new SuccessResponse({
      message: "Get call summary successfully",
      metadata: await CallService.getCallSummary({ ...req.body }),
    }).send(res);
  };

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
      message: "End call successfully",
      metadata: await CallService.endCall({
        ender: req.user.userId,
        callId: req.params.callId,
      }),
    }).send(res);
  };

  startRecord = async (req, res, next) => {
    new SuccessResponse({
      message: "Started recording successfully",
      metadata: await CallService.startRecord({
        callId: req.params.callId,
        ...req.body,
      }),
    }).send(res);
  };

  pauseRecord = async (req, res, next) => {
    new SuccessResponse({
      message: "Paused recording successfully",
      metadata: await CallService.pauseRecord({
        callId: req.params.callId,
      }),
    }).send(res);
  };

  stopRecord = async (req, res, next) => {
    new SuccessResponse({
      message: "Stopped recording successfully",
      metadata: await CallService.stopRecord({
        callId: req.params.callId,
      }),
    }).send(res);
  };

  getCallInfo = async (req, res, next) => {
    new SuccessResponse({
      message: "Get call info successfully",
      metadata: await CallService.getCallInfo({
        callId: req.params.callId,
      }),
    }).send(res);
  };
}

module.exports = new CallController();
