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
    isRecording: {
      type: Boolean,
      default: false,
    },
    isRecordingPaused: {
      type: Boolean,
      default: false,
    },
    recordingStopped: {
      type: Boolean,
      default: false,
    },
    recordingData: {
      type: Object,
      default: null,
    },
    recordingFiles: {
      type: Array,
      default: [],
    },
    recordingS3Urls: {
      type: Array,
      default: [],
    },
    recordingStartedAt: {
      type: Date,
    },
    recordingPausedAt: {
      type: Date,
    },
    recordingResumedAt: {
      type: Date,
    },
    recordingStoppedAt: {
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
