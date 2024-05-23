"use strict";

const mongoose = require("mongoose");

const COLLECTTION_NAME = "ContactRequests";
const DOCUMENT_NAME = "ContactRequest";

const ContactRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    receiver: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
    },
    requestMessage: {
      type: String,
      default: "Let's be friends!!",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: COLLECTTION_NAME,
  }
);

const ContactRequestModel = mongoose.model(DOCUMENT_NAME, ContactRequestSchema);

module.exports = ContactRequestModel;
