"use strict";

const mongoose = require("mongoose");

const COLLECTTION_NAME = "Industries";
const DOCUMENT_NAME = "Industry";

const IndustrySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Industry name must be provided"],
      unique: true,
    },
    description: String,
  },
  {
    collection: COLLECTTION_NAME,
    timestamps: true,
  }
);

const IndustryModel = mongoose.model(DOCUMENT_NAME, IndustrySchema);

module.exports = IndustryModel;
