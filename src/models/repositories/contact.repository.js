"use strict";

const { convertStringToObjectId } = require("../../utils");
const ContactRequestModel = require("../contactRequest.model");

class ContactRequestRepository {
  static filterContactRequest = async ({ filter, page, limit, populate }) => {
    const skip = (page - 1) * limit;

    return await ContactRequestModel.find(filter)
      .populate(populate)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  };

  static getPendingContactRequestById = async (id) => {
    return await ContactRequestModel.findOne({
      _id: convertStringToObjectId(id),
      status: "pending",
    });
  };

  static countDocs = async (filter) => {
    return await ContactRequestModel.countDocuments(filter);
  };

  static updateContactRequestPopulate = async ({
    contactRequestId,
    bodyUpdate,
    isNew = true,
    populate = {},
  }) => {
    return await ContactRequestModel.findByIdAndUpdate(contactRequestId, bodyUpdate, {
      new: isNew,
    }).populate(populate);
  };
}

module.exports = ContactRequestRepository;
