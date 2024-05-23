"use strict";

const ConservationModel = require("../conservation.model");
const { convertStringToObjectId } = require("../../utils");

const findAndPaginateConservation = async ({
  filter,
  page = 1,
  limit = 10,
  sort = { createdAt: -1 },
}) => {
  return await ConservationModel.find(filter)
    .select("-__v -createdAt -updatedAt")
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
};

class ConservationRepository {
  static getAllConservations = async ({ page, limit }) => {
    return await findAndPaginateConservation({
      filter: {
        type: "GROUP",
      },
      page,
      limit,
    });
  };

  static getAllPublicConservations = async ({ page, limit }) => {
    return await findAndPaginateConservation({
      filter: {
        type: "GROUP",
        "conservationAttributes.isPublished": true,
      },
      page,
      limit,
    });
  };

  static getAllPrivateConservations = async ({ page, limit }) => {
    return await findAndPaginateConservation({
      filter: {
        type: "GROUP",
        "conservationAttributes.isPublished": false,
      },
      page,
      limit,
    });
  };

  static getConservationById = async (conservationId) => {
    return await ConservationModel.findOne({
      _id: convertStringToObjectId(conservationId),
    });
  };

  static updateConservationById = async ({ conservationId, updatedPart, isNew = true }) => {
    return await ConservationModel.findByIdAndUpdate(conservationId, updatedPart, { new: isNew });
  };

  static searchConservations = async ({ keySearch, query }) => {
    const keySearchRegex = new RegExp(keySearch);
    const limit = query?.limit || 10;
    const page = query?.page || 1;

    const filter = {
      isDeleted: false,
      type: "GROUP",
      $text: {
        $search: keySearchRegex,
      },
    };

    const docCount = await ConservationModel.countDocuments(filter);

    const result = await ConservationModel.find(filter, {
      score: {
        $meta: "textScore",
      },
    })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ score: { $meta: "textScore" } })
      .lean();

    return {
      list: result,
      totalPages: Math.ceil(docCount / limit),
    };
  };

  static isUserInConservation = async ({ conservationId, userIds }) => {
    return await ConservationModel.findOne({
      _id: convertStringToObjectId(conservationId),
      "members.user": {
        $all: [...userIds.map(convertStringToObjectId)],
      },
    });
  };
}

module.exports = ConservationRepository;
