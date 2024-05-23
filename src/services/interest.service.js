"use strict";

const { BadRequestError } = require("../core/error.response");
const InterestModel = require("../models/interest.model");
const { pickDataInfo, deepCleanObject } = require("../utils");
/**
 * 1) create a new Interest
 * 2) update the existing Interest
 * 3) delete the existing Interest
 * 4) get all Interests
 */

class InterestService {
  static createInterest = async ({ body }) => {
    const { name } = body;

    if (!name) throw new BadRequestError("InterestName is required");

    const newInterest = await InterestModel.create({
      name,
    });

    return newInterest;
  };

  static updateInterest = async ({ id, body }) => {
    const cleanedBody = deepCleanObject(pickDataInfo(["name"], body));

    return await InterestModel.findByIdAndUpdate(id, cleanedBody, {
      new: true,
      upsert: true,
    }).lean();
  };

  static deleteInterest = async ({ id }) => {
    return await InterestModel.findByIdAndDelete(id).lean();
  };

  static increaseUsedCount = async ({ id }) => {
    return await InterestModel.findByIdAndUpdate(
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
    return await InterestModel.find({}).select("-__v -updatedAt -createdAt").lean();
  };

  static isInterestsExist = async (interestIds) => {
    if (interestIds.length === 0) return false;

    const foundInterests = await Promise.all(
      interestIds.map(async (id) => {
        const foundInterest = await InterestModel.findById(id);

        return foundInterest?._id;
      })
    );

    return foundInterests.every((i) => i);
  };

  static searchInterests = async ({ keySearch, query }) => {
    const keySearchRegex = new RegExp(keySearch);

    const results = await InterestModel.aggregate([
      {
        $match: {
          name: {
            $regex: new RegExp(keySearchRegex, "i"),
          },
        },
      },
      {
        $addFields: {
          score: {
            $regexMatch: {
              input: "$name",
              regex: new RegExp(keySearchRegex, "i"),
            },
          },
        },
      },
      {
        $sort: {
          score: -1,
        },
      },
      { $project: { _id: 1, name: 1, usedCount: 1 } },
    ]);

    const cnt = await InterestModel.countDocuments({
      name: { $regex: keySearchRegex, $options: "i" },
    });

    return {
      list: results,
    };
  };
}

module.exports = InterestService;
