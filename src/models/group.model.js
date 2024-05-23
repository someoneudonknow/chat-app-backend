"use strict";

const mongoose = require("mongoose");

const COLLECTTION_NAME = "Groups";
const DOCUMENT_NAME = "Group";

const GroupSchema = new mongoose.Schema(
  {
    groupName: {
      type: String,
      required: [true, "Group's name must be provided"],
      index: true,
    },
    groupAvatar: String,
    description: String,
    joinConditions: {
      type: Array,
    },
    memberLimit: {
      type: Number,
      min: [1, "memberLimit cannot be lower than 1"],
      default: 100,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
      select: false,
    },
  },
  {
    collection: COLLECTTION_NAME,
  }
);

const GroupModel = mongoose.model(DOCUMENT_NAME, GroupSchema);

module.exports = GroupModel;
