"use strict";

const ThemeRepository = require("../models/repositories/theme.repository");
const ThemeModel = require("../models/theme.model");
const { BadRequestError } = require("../core/error.response");
const {
  deepCleanObject,
  flattenObject,
  compareObjIdAndStr,
} = require("../utils");

class ThemeService {
  static getAllUserThemes = async ({ userId }) => {
    return await ThemeRepository.getAllUsersThemes({ userId });
  };

  static createTheme = async (theme) => {
    return await ThemeModel.create(theme);
  };

  static getAllPublishedThemes = async () => {
    return await ThemeRepository.getAllPublishedThemes();
  };

  static updateTheme = async ({ themeId, updatedPart, userId }) => {
    const themeFound = await ThemeRepository.findThemeById({ themeId });

    if (!themeFound) throw new BadRequestError(`Theme not found`);

    if (!compareObjIdAndStr(themeFound.createdBy, userId))
      throw new BadRequestError("Can't update theme not belong to you");

    const validObject = deepCleanObject(updatedPart);

    return await ThemeRepository.updateTheme({
      themeId,
      update: flattenObject(validObject),
      isNew: true,
    });
  };

  static deleteTheme = async ({ themeId, userId }) => {
    const themeFound = await ThemeRepository.findThemeById({ themeId });

    if (!themeFound) throw new BadRequestError(`Theme not found`);

    if (!compareObjIdAndStr(themeFound.createdBy, userId))
      throw new BadRequestError("Can't delete theme not belong to you");

    return await ThemeRepository.deleteTheme({ themeId });
  };
}

module.exports = ThemeService;
