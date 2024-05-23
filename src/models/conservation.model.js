"use strict";

const mongoose = require("mongoose");
const slugify = require("slugify");
const ThemeRepository = require("./repositories/theme.repository");

const COLLECTTION_NAME = "Conservations";
const DOCUMENT_NAME = "Conservation";

const ConservationSchema = new mongoose.Schema(
  {
    slug: String,
    theme: {
      type: mongoose.Types.ObjectId,
      ref: "Theme",
    },
    members: [
      {
        user: {
          type: mongoose.Types.ObjectId,
          ref: "User",
        },
        nickname: String,
        role: {
          type: String,
          enum: ["HOST", "MEMBER"],
          required: true,
          default: "MEMBER",
        },
      },
    ],
    creator: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    specialMessages: [String],
    type: {
      type: String,
      enum: ["GROUP", "INBOX", "DIRECT_MESSAGE"],
    },
    isStarred: {
      type: Boolean,
      default: false,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
    lastMessage: {
      type: mongoose.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    conservationAttributes: {},
  },
  {
    collection: COLLECTTION_NAME,
    timestamps: true,
  }
);

// indexes
ConservationSchema.index(
  {
    "conservationAttributes.groupName": "text",
  },
  {
    sparse: true,
  }
);

// middlewares
ConservationSchema.pre("save", async function (next) {
  if (!this.theme) {
    this.theme = await ThemeRepository.getDefaultTheme()._id;
  }
  next();
});

ConservationSchema.pre(/^find/, function (next) {
  this.find({ isDeleted: { $ne: true } }).select("-__v");
  next();
});

const ConservationModel = mongoose.model(DOCUMENT_NAME, ConservationSchema);

module.exports = ConservationModel;
