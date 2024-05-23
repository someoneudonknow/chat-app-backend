"use strict";

const { Created, SuccessResponse } = require("../core/success.response");
const AccessService = require("../services/access.service");

class AccessController {
  login = async (req, res, next) => {
    new SuccessResponse({
      metadata: await AccessService.login(req.body),
    }).send(res);
  };

  signup = async (req, res, next) => {
    new Created({
      message: "Your account has been created.",
      metadata: await AccessService.signup(req.body),
    }).send(res);
  };

  logout = async (req, res, next) => {
    new SuccessResponse({
      message: "Logout successfully",
      metadata: await AccessService.logout({ storedKey: req.storedKey }),
    }).send(res);
  };

  refreshTheToken = async (req, res, next) => {
    new SuccessResponse({
      message: "The token has been refreshed!",
      metadata: await AccessService.refreshTheToken({
        storedKey: req.storedKey,
        user: req.user,
        refreshToken: req.refreshToken,
      }),
    }).send(res);
  };
}

module.exports = new AccessController();
