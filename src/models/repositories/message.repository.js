"use strict";

const { NotImplementedError } = require("../../core/error.response");
const { convertStringToObjectId, selectDataQuery, unSelectDataQuery } = require("../../utils");
const { MessageModel } = require("../message.model");

class MessageRepository {
  static queryMessageWithUnselect = async ({
    filter,
    limit = 50,
    page = 1,
    unSelect,
    sort = { createdAt: -1 },
  }) => {
    const skip = (page - 1) * limit;

    return await MessageModel.find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .select(unSelectDataQuery(unSelect))
      .lean();
  };

  static queryMessageWithSelect = async ({
    filter,
    limit,
    page,
    select,
    sort = { createdAt: -1 },
  }) => {
    const skip = (page - 1) * limit;

    return await MessageModel.find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .select(selectDataQuery(select))
      .lean();
  };
}

module.exports = MessageRepository;
