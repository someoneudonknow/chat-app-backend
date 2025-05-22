"use strict";

const express = require("express");
const CallController = require("../../../controller/call.controller");
const asyncHandler = require("../../../helpers/asyncHandler");
const { authentication } = require("../../../auth/auth.middlewares");

const callRouter = express.Router();

callRouter.use(authentication);
callRouter.post("/", asyncHandler(CallController.initCall));
callRouter.post("/join/:callId", asyncHandler(CallController.joinCall));
callRouter.post("/end/:callId", asyncHandler(CallController.endCall));
callRouter.get("/:callId", asyncHandler(CallController.getCallInfo));

callRouter.post("/record/start/:callId", asyncHandler(CallController.startRecord));
callRouter.post("/record/pause/:callId", asyncHandler(CallController.pauseRecord));
callRouter.post("/record/resume/:callId", asyncHandler(CallController.resumeRecord));
callRouter.post("/record/stop/:callId", asyncHandler(CallController.stopRecord));

callRouter.post("/summary", asyncHandler(CallController.getCallSummary));

module.exports = callRouter;
