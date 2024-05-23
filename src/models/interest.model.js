"use strict";

const mongoose = require("mongoose");

const COLLECTTION_NAME = "Interests";
const DOCUMENT_NAME = "Interest";

const InterestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Interest name must be provided"],
      unique: true,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
  },
  {
    collection: COLLECTTION_NAME,
    timestamps: true,
  }
);

const InterestModel = mongoose.model(DOCUMENT_NAME, InterestSchema);

module.exports = InterestModel;
