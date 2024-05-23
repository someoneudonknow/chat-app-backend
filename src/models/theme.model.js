"use strict";

const mongoose = require("mongoose");

const COLLECTTION_NAME = "Themes";
const DOCUMENT_NAME = "Theme";

const ThemeSchema = new mongoose.Schema(
  {
    themeName: {
      type: String,
      required: true,
      index: true,
      unique: [true, "Duplicate Theme Name"],
    },
    textColor: {
      type: String,
      required: true,
    },
    background: {
      type: {
        type: String,
        enum: ["IMAGE", "COLOR", "GRADIENT"],
        required: true,
        default: "COLOR",
      },
      value: {
        type: String,
        required: true,
      },
    },
    textWrapperColor: {
      type: {
        type: String,
        enum: ["COLOR", "GRADIENT"],
        required: true,
        default: "COLOR",
      },
      value: {
        type: String,
        required: true,
      },
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    isPublished: {
      type: Boolean,
      required: true,
      select: false,
      default: false,
    },
  },
  {
    collection: COLLECTTION_NAME,
    timestamps: true,
  }
);

const ThemeModel = mongoose.model(DOCUMENT_NAME, ThemeSchema);

module.exports = ThemeModel;
