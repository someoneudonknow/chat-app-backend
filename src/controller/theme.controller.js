"use strict";

const { Created, SuccessResponse } = require("../core/success.response");
const ThemeService = require("../services/theme.service");

class ThemeController {
  // themes
  createUserTheme = async (req, res, next) => {
    new Created({
      message: "Your theme has been created",
      metadata: await ThemeService.createTheme({
        ...req.body,
        isPublished: false,
        createdBy: req.user.userId,
      }),
    }).send(res);
  };

  createPublishedTheme = async (req, res, next) => {
    new Created({
      message: "Your theme has been created",
      metadata: await ThemeService.createTheme({
        ...req.body,
        isPublished: true,
        createdBy: req.user.userId,
      }),
    }).send(res);
  };

  getUserThemes = async (req, res, next) => {
    new SuccessResponse({
      message: "Get themes successfully",
      metadata: await ThemeService.getAllUserThemes({
        userId: req.user.userId,
      }),
    }).send(res);
  };

  getPublishedThemes = async (req, res, next) => {
    new SuccessResponse({
      message: "Get themes successfully",
      metadata: await ThemeService.getAllPublishedThemes(),
    }).send(res);
  };

  updateTheme = async (req, res, next) => {
    new SuccessResponse({
      message: "Update theme successfully",
      metadata: await ThemeService.updateTheme({
        themeId: req.params.themeId,
        updatedPart: req.body,
        userId: req.user.userId,
      }),
    }).send(res);
  };

  deleteTheme = async (req, res, next) => {
    new SuccessResponse({
      message: "Delete theme successfully",
      metadata: await ThemeService.deleteTheme({
        themeId: req.params.themeId,
        userId: req.user.userId,
      }),
    }).send(res);
  };
}

module.exports = new ThemeController();
