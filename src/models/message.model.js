"use strict";

const mongoose = require("mongoose");

const COLLECTTION_NAME = "Messages";
const DOCUMENT_NAME = "Message";

const MessageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    conservation: {
      type: mongoose.Types.ObjectId,
      ref: "Conservation",
    },
    type: {
      type: String,
      enum: ["regular"],
      default: "regular",
      index: true,
    },
    text: String,
    attachments: [
      {
        type: {
          type: String,
          enum: ["file", "image", "audio", "video"],
        },
        content: {},
      },
    ],
    pinned: {
      isPinned: {
        type: Boolean,
        default: false,
      },
      type: {
        type: String,
        enum: ["permanent", "temporary"],
      },
      pinnedAt: {
        type: Date,
        required: true,
      },
      expiredAt: Date,
    },
    mentionedMembers: {
      type: [
        {
          type: mongoose.Types.ObjectId,
          ref: "User",
        },
      ],
      validate: {
        validator: function (value) {
          return value.length <= 25;
        },
        message: "Maximum amount of allowed members",
      },
    },
    replyTo: {
      type: mongoose.Types.ObjectId,
      ref: "Message",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: COLLECTTION_NAME,
    timestamps: true,
  }
);

MessageSchema.index({
  text: "text",
});

MessageSchema.pre(/^find/, function (next) {
  if (
    this.pinned?.type === "temporary" &&
    this.pinned?.expiredAt < new Date() &&
    !this.pinned.isPinned
  ) {
    this.pinned.isPinned = false;
  }

  next();
});

const MessageModel = mongoose.model(DOCUMENT_NAME, MessageSchema);

module.exports = MessageModel;
