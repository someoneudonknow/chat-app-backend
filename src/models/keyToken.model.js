"use strict";

const mongoose = require("mongoose");

const COLLECTTION_NAME = "Keys";
const DOCUMENT_NAME = "Key";

const keyTokenSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    publicKey: {
      type: String,
      required: true,
    },
    privateKey: {
      type: String,
      required: true,
    },
    refreshTokenUsed: {
      type: Array,
      default: [],
    },
    refreshToken: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: COLLECTTION_NAME,
  }
);

const KeyTokenModel = mongoose.model(DOCUMENT_NAME, keyTokenSchema);

module.exports = KeyTokenModel;
