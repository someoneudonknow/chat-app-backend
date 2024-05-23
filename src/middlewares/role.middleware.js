"use strict";

const { BadRequestError, ForbiddenError } = require("../core/error.response");
const ConservationRepository = require("../models/repositories/conservation.repository");
const UserRepository = require("../models/repositories/user.repository");

const restrictTo = (role) => {
  return async (req, res, next) => {
    const userId = req.user.userId;

    const userFound = await UserRepository.getUserById(userId);

    if (!userFound) {
      return next(new NotFoundError("You are not registered"));
    }

    if (!(userFound.role === role)) {
      return next(
        new ForbiddenError("You don't have permission to access this")
      );
    }

    return next();
  };
};

const restrictToGroupRole = (role) => {
  return async (req, res, next) => {
    const conservationId = req.params.conservationId;

    if (!conservationId)
      return next(new BadRequestError("Invalid conservation id"));

    const conservation = await ConservationRepository.getConservationById(
      conservationId
    );

    if (!conservation)
      return next(new BadRequestError("Conservation not found"));

    const userId = req.user.userId;
    if (!userId) return next(new BadRequestError("Invalid user id"));

    if (
      !conservation.members.find(
        (mem) => mem.user.toString() === userId && mem.role === role
      )
    )
      return next(new ForbiddenError("You are not allowed to do this"));

    next();
  };
};

module.exports = {
  restrictTo,
  restrictToGroupRole,
};
