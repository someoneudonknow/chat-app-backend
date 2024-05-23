"use strict";

const mongoose = require("mongoose");

const COLLECTTION_NAME = "Calls";
const DOCUMENT_NAME = "Call";

const callSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: { values: ["DIRECT_CALL", "GROUP_CALL"] },
    },
    joinedMembers: [
      {
        type: mongoose.Types.Array,
        ref: "User",
      },
    ],
    conservation: {
      type: mongoose.Types.ObjectId,
      ref: "Conservation",
      required: true,
    },
    beginAt: {
      type: Date,
      default: Date.now,
    },
    endAt: {
      type: Date,
    },
  },
  {
    collection: COLLECTTION_NAME,
    timestamps: true,
  }
);

const CallModel = mongoose.model(DOCUMENT_NAME, callSchema);

module.exports = CallModel;
