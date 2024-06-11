"use strict";

const express = require("express");
const MessageController = require("../../../controller/message.controller");
const asyncHandler = require("../../../helpers/asyncHandler");
const { authentication } = require("../../../auth/auth.middlewares");

const messageRouter = express.Router();

messageRouter.use(authentication);

messageRouter.get("", asyncHandler(MessageController.filterMessages));
messageRouter.get("/:keySearch", asyncHandler(MessageController.searchMessage));
messageRouter.get(
  "/conservations/:conservationId",
  asyncHandler(MessageController.getAllMessageInConservation)
);
messageRouter.post("", asyncHandler(MessageController.sendMessage));
messageRouter.delete("/soft/:messageId", asyncHandler(MessageController.softDeleteMessage));
messageRouter.delete("/hard/:messageId", asyncHandler(MessageController.hardDeleteMessage));
messageRouter.patch("/:messageId", asyncHandler(MessageController.updateMessage));

module.exports = messageRouter;
