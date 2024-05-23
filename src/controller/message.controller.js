"use strict";

const { Created, SuccessResponse } = require("../core/success.response");
const MessageService = require("../services/message.service");

class MessageController {
  sendMessage = async (req, res, next) => {
    new Created({
      message: "Your message has been sent",
      metadata: await MessageService.createMessage({
        userId: req.user.userId,
        conservationId: req.params.conservationId,
        ...req.body,
      }),
    }).send(res);
  };

  searchMessage = async (req, res, next) => {
    new SuccessResponse({
      message: "Get messages successfully",
      metadata: await MessageService.searchMessage({
        keySearch: req.params.keySearch,
      }),
    }).send(res);
  };

  softDeleteMessage = async (req, res, next) => {
    new SuccessResponse({
      message: "Delete messages successfully",
      metadata: await MessageService.softDelete(req.params.messageId),
    }).send(res);
  };

  hardDeleteMessage = async (req, res, next) => {
    new SuccessResponse({
      message: "Delete messages successfully",
      metadata: await MessageService.hardDelete(req.params.messageId),
    }).send(res);
  };

  getAllMessageInConservation = async (req, res, next) => {
    new SuccessResponse({
      message: "Get messages successfully",
      metadata: await MessageService.getAllMessagesInConservation({
        conservationId: req.params.conservationId,
        ...req.query,
      }),
    }).send(res);
  };

  filterMessages = async (req, res, next) => {
    new SuccessResponse({
      message: "Get messages successfully",
      metadata: await MessageService.filterMessages({
        userId: req.user.userId,
        queryParams: req.query,
      }),
    }).send(res);
  };

  updateMessage = async (req, res, next) => {
    new SuccessResponse({
      message: "Update messages successfully",
      metadata: await MessageService.updateMessage({
        messageId: req.params.messageId,
        bodyUpdate: req.body,
        userId: req.user.userId,
      }),
    }).send(res);
  };
}

module.exports = new MessageController();
