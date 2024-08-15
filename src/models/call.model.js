"use strict";

const mongoose = require("mongoose");

const COLLECTTION_NAME = "Calls";
const DOCUMENT_NAME = "Call";

const callSchema = new mongoose.Schema(
  {
    caller: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mediaType: {
      type: String,
      enum: { values: ["AUDIO_CALL", "VIDEO_CALL"] },
    },
    type: {
      type: String,
      enum: { values: ["GROUP", "ONE_TO_ONE"] },
    },
    attendances: [
      {
        type: mongoose.Types.ObjectId,
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
    callEnder: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: {
        values: ["INIT", "PENDING", "ENDED"],
      },
    },
  },
  {
    collection: COLLECTTION_NAME,
    timestamps: true,
  }
);

const CallModel = mongoose.model(DOCUMENT_NAME, callSchema);

module.exports = CallModel;
