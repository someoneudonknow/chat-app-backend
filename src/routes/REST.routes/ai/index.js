"use strict";

const express = require("express");
const AIController = require("../../../controller/ai.controller");
const asyncHandler = require("../../../helpers/asyncHandler");
const { authentication } = require("../../../auth/auth.middlewares");

const callRouter = express.Router();

callRouter.use(authentication);
callRouter.get("/chat", asyncHandler(AIController.chat));
callRouter.get("/translate", asyncHandler(AIController.translate));

module.exports = callRouter;
