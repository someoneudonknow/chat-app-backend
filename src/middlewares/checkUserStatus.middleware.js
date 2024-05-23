"use strict";

const { BadRequestError, ForbiddenError, NotAcceptableError } = require("../core/error.response");
const ConservationRepository = require("../models/repositories/conservation.repository");
const UserRepository = require("../models/repositories/user.repository");

const UserStatus = {
  BANNED: "BANNED",
};

const checkUserStatus = (role) => {
  return async (req, res, next) => {
    const userId = req.user.userId;

    const userFound = await UserRepository.getUserById(userId);

    if (!userFound) {
      return next(new NotFoundError("You are not registered"));
    }

    if (userFound.status === UserStatus.BANNED) {
      throw new NotAcceptableError("Your account have been banned");
    }

    return next();
  };
};

module.exports = {
  checkUserStatus,
};
