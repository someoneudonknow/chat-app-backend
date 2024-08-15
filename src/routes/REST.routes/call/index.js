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

module.exports = callRouter;
