"use strict";

const mongoose = require("mongoose");
const validator = require("validator");
const { unSelectDataQuery } = require("../utils");

const COLLECTTION_NAME = "Users";
const DOCUMENT_NAME = "User";

const UserSchema = mongoose.Schema(
  {
    userName: {
      type: String,
      maxLength: [100, "Username must be lower or equal to 100 characters"],
    },
    lastCompletedUserProfileStep: {
      type: Number,
      default: 0,
    },
    birthday: {
      type: Date,
      validate: {
        validator: function (value) {
          return validator.isBefore(value.toString(), new Date());
        },
        message: "birthday must be before the current time",
      },
    },
    gender: {
      type: String,
      enum: {
        values: ["MALE", "FEMALE", "NON_BINARY", "GENDERQUEER", "UNKNOWN"],
        message: "{VALUE} is not a valid gender",
      },
    },
    country: {
      countryName: String,
      countryCode: String,
    },
    industry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Industry",
    },
    description: String,
    interests: [{ type: mongoose.Schema.Types.ObjectId, ref: "Interest" }],
    photo: String,
    background: String,
    email: {
      type: String,
      required: [true, "Email must be provided"],
      unique: [true, "Email must be unique"],
      validate: [validator.isEmail, "Email invalid, please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password must be provided"],
    },
    status: {
      type: String,
      enum: {
        values: ["BANNED", "ACTIVE"],
        message: "{VALUE} is not a valid status",
      },
      default: "ACTIVE",
    },
    contactList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: DOCUMENT_NAME,
      },
    ],
    blockedList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: DOCUMENT_NAME,
      },
    ],
    joinedConservations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conservation",
      },
    ],
    loginMethod: {
      type: String,
      enum: ["FACEBOOK", "GOOGLE", "EMAIL_PASSWORD"],
      default: "EMAIL_PASSWORD",
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastOnlineAt: Date,
    role: {
      type: String,
      enum: {
        values: ["ADMIN", "USER"],
        message: "{VALUE} is not a valid role",
      },
      default: "USER",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isCalling: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: COLLECTTION_NAME,
  }
);

UserSchema.index({
  userName: "text",
  email: "text",
});

UserSchema.pre(/^find/, function (next) {
  this.find({
    isDeleted: { $ne: true },
  })
    .populate({
      path: "industry",
      select: unSelectDataQuery(["createdAt", "updatedAt", "__v"]),
    })
    .populate({
      path: "interests",
      select: unSelectDataQuery(["createdAt", "updatedAt", "__v"]),
    });

  next();
});

const UserModel = mongoose.model(DOCUMENT_NAME, UserSchema);

module.exports = UserModel;
