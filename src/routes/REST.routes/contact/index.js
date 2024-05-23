"use strict";

const express = require("express");
const asyncHandler = require("../../../helpers/asyncHandler");
const { authentication } = require("../../../auth/auth.middlewares");
const ContactController = require("../../../controller/contact.controller");

const contactRouter = express.Router();

contactRouter.use(authentication);

contactRouter.get("/recommended", asyncHandler(ContactController.getContactRecommendations));
contactRouter.post("/:receiverId", asyncHandler(ContactController.createContactRequest));
contactRouter.get("/received", asyncHandler(ContactController.getAllReceivedContactRequest));
contactRouter.get("/sent", asyncHandler(ContactController.getAllSentContactRequest));
contactRouter.delete("/:requestId", asyncHandler(ContactController.cancelAContactRequest));
contactRouter.post("/:requestId/accept", asyncHandler(ContactController.acceptARequest));
contactRouter.post("/:requestId/reject", asyncHandler(ContactController.rejectARequest));
contactRouter.patch("/:requestId", asyncHandler(ContactController.updateAContactRequest));

module.exports = contactRouter;
