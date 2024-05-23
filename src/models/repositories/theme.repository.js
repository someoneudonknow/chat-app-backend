"use strict";

const { Types } = require("mongoose");
const ThemeModel = require("../theme.model");

class ThemeRepository {
  static getDefaultTheme = async () => {
    return await ThemeModel.findOne({ isPublished: true }).select("_id").lean();
  };

  static getAllPublishedThemes = async () => {
    return await ThemeModel.find({ isPublished: true }).select("-__v").lean();
  };

  static getAllUsersThemes = async ({ userId }) => {
    return await ThemeModel.find({
      isPublished: false,
      createdBy: new Types.ObjectId(userId),
    }).lean();
  };

  static updateTheme = async ({ themeId, update, isNew }) => {
    return await ThemeModel.findByIdAndUpdate(themeId, update, {
      new: isNew,
    });
  };

  static findThemeById = async ({ themeId }) => {
    return await ThemeModel.findById(themeId).lean();
  };

  static deleteTheme = async ({ themeId }) => {
    const { modifiedCount } = await ThemeModel.findByIdAndDelete(themeId);

    return modifiedCount;
  };
}

module.exports = ThemeRepository;
