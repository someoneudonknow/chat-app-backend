"use strict";

const { Types } = require("mongoose");
const CallModel = require("../call.model");

class CallRepository {
  static updateById = async ({ id, updated, isNew = true }) => {
    return await CallModel.findByIdAndUpdate(id, updated, { new: isNew });
  };

  static getById = async (id) => {
    return await CallModel.findById(id).lean();
  };

  static getByIdAndPopulate = async ({ id, populate }) => {
    return await CallModel.findById(id).populate(populate).lean();
  };
}

module.exports = CallRepository;
