"use strict";

const { Types } = require("mongoose");
const { BadRequestError } = require("../core/error.response");
const IndustryModel = require("../models/industry.model");
const { pickDataInfo, deepCleanObject } = require("../utils");
/**
 * 1) create a new area of study or industry
 * 2) update the existing area of study or industry
 * 3) delete the existing area of study or industry
 * 4) get all the areas of study or industry
 */

class IndustryService {
  static createIndustry = async ({ body }) => {
    const { name } = body;

    if (!name) throw new BadRequestError("industryName is required");

    const newIndustry = await IndustryModel.create({
      name,
    });

    return newIndustry;
  };

  static updateIndustry = async ({ id, body }) => {
    const cleanedBody = deepCleanObject(pickDataInfo(["name"], body));

    return await IndustryModel.findByIdAndUpdate(id, cleanedBody, {
      new: true,
      upsert: true,
    }).lean();
  };

  static deleteIndustry = async ({ id }) => {
    return await IndustryModel.findByIdAndDelete(id).lean();
  };

  static increaseUsedCount = async ({ id }) => {
    return await IndustryModel.findByIdAndUpdate(
      id,
      {
        $inc: {
          usedCount: 1,
        },
      },
      { new: true, upsert: true }
    ).lean();
  };

  static getAll = async () => {
    return await IndustryModel.find({}).select("-__v -updatedAt -createdAt").lean();
  };
}

module.exports = IndustryService;
