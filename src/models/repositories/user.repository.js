"use strict";

const { Types } = require("mongoose");
const UserModel = require("../user.model");
const { unSelectDataQuery, selectDataQuery } = require("../../utils");

class UserRepository {
  static getUserById = async (userId) => {
    return await UserModel.findOne({ _id: new Types.ObjectId(userId) });
  };

  static updateUserByIdAndPopulate = async ({ userId, update, isNew = true, populate = {} }) => {
    return await UserModel.findByIdAndUpdate(userId, update, {
      new: isNew,
    }).populate(populate);
  };

  static updateUserById = async ({ userId, update, isNew = true }) => {
    return await UserModel.findByIdAndUpdate(userId, update, {
      new: isNew,
    });
  };

  static getAllUsersUnSelect = async ({ unSelect, page, limit, sort = { createdAt: -1 } }) => {
    return await UserModel.find({})
      .limit(limit)
      .skip((page - 1) * limit)
      .select(unSelect)
      .sort(sort)
      .lean();
  };

  static getAllUsersSelect = async ({ select, page, limit, sort = { createdAt: -1 } }) => {
    return await UserModel.find({})
      .limit(limit)
      .skip((page - 1) * limit)
      .select(selectDataQuery(select))
      .sort(sort)
      .lean();
  };
}

module.exports = UserRepository;
