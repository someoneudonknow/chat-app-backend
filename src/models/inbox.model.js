"use strict";

const mongoose = require("mongoose");

const COLLECTTION_NAME = "Inboxs";
const DOCUMENT_NAME = "Inbox";

const InboxSchema = new mongoose.Schema(
  {},
  {
    collection: COLLECTTION_NAME,
  }
);

const InboxModel = mongoose.model(DOCUMENT_NAME, InboxSchema);

module.exports = InboxModel;
