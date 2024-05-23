"use strict";

const { Created, SuccessResponse } = require("../core/success.response");
const ContactService = require("../services/contact.service");

class ContactController {
  createContactRequest = async (req, res, next) => {
    new SuccessResponse({
      message: "Successfully requested",
      metadata: await ContactService.createContactRequest({
        senderId: req.user.userId,
        receiverId: req.params.receiverId,
        requestMessage: req.body.requestMessage,
      }),
    }).send(res);
  };

  getAllReceivedContactRequest = async (req, res, next) => {
    new SuccessResponse({
      message: "Get contact requests successfully",
      metadata: await ContactService.getAllReceivedContactRequest({
        userId: req.user.userId,
      }),
    }).send(res);
  };

  getAllSentContactRequest = async (req, res, next) => {
    new SuccessResponse({
      message: "Get contact requests successfully",
      metadata: await ContactService.getAllSentContactRequest({
        userId: req.user.userId,
      }),
    }).send(res);
  };

  cancelAContactRequest = async (req, res, next) => {
    new SuccessResponse({
      message: "Cancel successfully",
      metadata: await ContactService.cancelContactRequest({
        id: req.params.requestId,
        userId: req.user.userId,
      }),
    }).send(res);
  };

  acceptARequest = async (req, res, next) => {
    new SuccessResponse({
      message: "Successfully accepted",
      metadata: await ContactService.acceptContactRequest({
        id: req.params.requestId,
        userId: req.user.userId,
      }),
    }).send(res);
  };

  rejectARequest = async (req, res, next) => {
    new SuccessResponse({
      message: "Reject successfully",
      metadata: await ContactService.rejectContactRequest({
        id: req.params.requestId,
        userId: req.user.userId,
      }),
    }).send(res);
  };

  updateAContactRequest = async (req, res, next) => {
    new SuccessResponse({
      message: "Updated successfully",
      metadata: await ContactService.updateContactRequest({
        id: req.params.requestId,
        userId: req.user.userId,
        updatedMessage: req.body.requestMessage,
      }),
    }).send(res);
  };
}

module.exports = new ContactController();
