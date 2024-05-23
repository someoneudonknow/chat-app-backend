"use strict";

const { Created, SuccessResponse } = require("../core/success.response");
const UserService = require("../services/user.service");

class UserController {
  searchConservations = async (req, res, next) => {
    new SuccessResponse({
      message: "Get convervations info successfully",
      metadata: await UserService.searchUserConservations({
        keyword: req.params.keySearch,
        userId: req.user.userId,
        query: req.query,
      }),
    }).send(res);
  };

  searchContacts = async (req, res, next) => {
    new SuccessResponse({
      message: "Get contacts info successfully",
      metadata: await UserService.searchContacts({
        keyword: req.params.keySearch,
        userId: req.user.userId,
        query: req.query,
      }),
    }).send(res);
  };

  getMeContactInfo = async (req, res, next) => {
    new SuccessResponse({
      message: "Get contacts info successfully",
      metadata: await UserService.getMeContactInfo({
        userId: req.user.userId,
        query: req.query,
      }),
    }).send(res);
  };

  discoverUser = async (req, res, next) => {
    new SuccessResponse({
      message: "Get user info successfully",
      metadata: await UserService.discoverUser({
        userId: req.params.userId,
      }),
    }).send(res);
  };

  getContactRecommendations = async (req, res, next) => {
    new SuccessResponse({
      message: "Get user contact recommendations successfully",
      metadata: await UserService.getContactRecomendations({
        page: req.query?.page,
        limit: req.query?.limit,
        userId: req.user.userId,
      }),
    }).send(res);
  };

  getMeInfo = async (req, res, next) => {
    new SuccessResponse({
      message: "Get info successfully",
      metadata: await UserService.getMeInfo({ userId: req.user.userId }),
    }).send(res);
  };

  updateMe = async (req, res, next) => {
    new SuccessResponse({
      message: "Update your information successfully",
      metadata: await UserService.updateUser({
        userId: req.user.userId,
        bodyUpdate: req.body,
      }),
    }).send(res);
  };

  forgotPassword = async (req, res, next) => {
    new SuccessResponse({
      message: "We have sent a confirmation email to your email address",
      metadata: await UserService.forgotPassword({ email: req.body.email }),
    }).send(res);
  };

  resetPassword = async (req, res, next) => {
    new SuccessResponse({
      message: "Your password has been reset",
      metadata: await UserService.resetPassword({
        otp: req.body.otp,
        uid: req.body.id,
        bodyUpdate: req.body,
      }),
    }).send(res);
  };

  searchUsers = async (req, res, next) => {
    new SuccessResponse({
      message: "Search for users successfully",
      metadata: await UserService.searchUsers({
        keySearch: req.params.keySearch,
      }),
    }).send(res);
  };

  increaseProfileCompletionStep = async (req, res, next) => {
    new SuccessResponse({
      message: "Increasing profile completion success",
      metadata: await UserService.increaseProfileCompletionStep({ userId: req.user.userId }),
    }).send(res);
  };

  addInterests = async (req, res, next) => {
    new SuccessResponse({
      message: "Add interests success",
      metadata: await UserService.addInterest({
        userId: req.user.userId,
        interestIds: req.body.interests,
      }),
    }).send(res);
  };

  removeInterest = async (req, res, next) => {
    new SuccessResponse({
      message: "Remove interests success",
      metadata: await UserService.removeInterest({
        userId: req.user.userId,
        interestId: req.body.interest,
      }),
    }).send(res);
  };
}

module.exports = new UserController();
