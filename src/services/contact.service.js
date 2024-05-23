"use strict";

const { filter } = require("lodash");
const {
  NotFoundError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
} = require("../core/error.response");
const ContactRequestModel = require("../models/contactRequest.model");
const ContactRepository = require("../models/repositories/contact.repository");
const UserRepository = require("../models/repositories/user.repository");
const {
  convertStringToObjectId,
  compareObjIdAndStr,
  pickDataInfoExcept,
  unSelectDataQuery,
} = require("../utils");
const ConservationModel = require("../models/conservation.model");
const ConservationService = require("./conservation.service");
const UserModel = require("../models/user.model");

/*
 1- create new contact request
 2- get all pending contact requests
 3- cancel or delete contact request 
 4- accept contact request
 5- reject contact request
 6- update request message
 7- remove contact from contact list / unfinished 
 8 - get user contacts information
 */

class ContactService {
  static createContactRequest = async ({ senderId, receiverId, requestMessage }) => {
    const receiver = await UserRepository.getUserById(receiverId);

    if (!receiver) throw new NotFoundError("Can't find receiver");

    if (receiverId === senderId) throw new ForbiddenError("Can't make a request to yourself");

    const foundContactRequest = await ContactRequestModel.findOne({
      sender: {
        $in: [convertStringToObjectId(senderId), convertStringToObjectId(receiverId)],
      },
      receiver: {
        $in: [convertStringToObjectId(senderId), convertStringToObjectId(receiverId)],
      },
      status: "pending",
    });

    if (foundContactRequest)
      throw new ConflictError(
        "You already have a contact request with this user, check your sent contact request or pending contact requests"
      );

    if (receiver.contactList.includes(senderId))
      throw new ConflictError("User is already in the contact list");

    const newContactRequest = await ContactRequestModel.create({
      sender: convertStringToObjectId(senderId),
      receiver: convertStringToObjectId(receiverId),
      status: "pending",
      requestMessage,
    });

    await ContactRequestModel.populate(newContactRequest, {
      path: "receiver",
      select: "userName email photo country gender",
    });

    return pickDataInfoExcept(["__v"], newContactRequest);
  };

  static getAllReceivedContactRequest = async ({ userId }) => {
    const result = await ContactRequestModel.find({
      receiver: convertStringToObjectId(userId),
      status: "pending",
    })
      .select("-__v")
      .populate({
        path: "sender",
        select: "userName email photo country gender",
      });

    return {
      list: result,
    };
  };

  static getAllSentContactRequest = async ({ userId, page, limit }) => {
    const result = await ContactRequestModel.find({
      sender: convertStringToObjectId(userId),
      status: "pending",
    })
      .select("-__v")
      .populate({
        path: "receiver",
        select: "userName email photo country gender",
      });

    return {
      list: result,
    };
  };

  static cancelContactRequest = async ({ id, userId }) => {
    const contactRequest = await ContactRepository.getPendingContactRequestById(id);
    if (!contactRequest) throw new NotFoundError("Contact request not found");

    if (!compareObjIdAndStr(contactRequest.sender, userId))
      throw new ForbiddenError("You can't cancel this contact request");

    return await ContactRequestModel.findByIdAndDelete(id);
  };

  static acceptContactRequest = async ({ id, userId }) => {
    const contactRequest = await ContactRepository.getPendingContactRequestById(id);
    if (!contactRequest) throw new NotFoundError("Contact request not found");

    const sender = await UserRepository.getUserById(contactRequest.sender);
    if (!sender) {
      await ContactRequestModel.findByIdAndDelete(id);
      throw new ConflictError("The sender account does not exist anymore");
    }

    if (!compareObjIdAndStr(contactRequest.receiver, userId))
      throw new ForbiddenError("Only receiver are allowed to accept this request");

    const updatedAcceptingUser = await UserRepository.updateUserByIdAndPopulate({
      userId,
      update: {
        $addToSet: {
          contactList: contactRequest.sender,
        },
      },
      isNew: true,
      populate: {
        path: "contactList",
        select: "userName email photo country interests industry gender",
      },
    });

    if (!updatedAcceptingUser)
      throw new InternalServerError("Something went wrong, please try again later!");

    const updatedSendingUser = await UserRepository.updateUserById({
      userId: sender._id.toString(),
      update: {
        $addToSet: {
          contactList: contactRequest.receiver,
        },
      },
    });

    if (!updatedSendingUser)
      throw new InternalServerError("Something went wrong, please try again later!");

    const updatedContactRequest = await ContactRequestModel.findByIdAndUpdate(id, {
      status: "accepted",
    });

    if (!updatedContactRequest)
      throw new InternalServerError("Something went wrong, please try again later!");

    // if they have chat before
    const previousConservation = await ConservationModel.findOne({
      "members.user": { $all: [contactRequest.sender, contactRequest.receiver] },
      type: "DIRECT_MESSAGE",
    });

    if (previousConservation) {
      previousConservation.type = "INBOX";

      await previousConservation.save();
    } else {
      await ConservationService.createConservation("INBOX", {
        creator: contactRequest.sender,
        type: "INBOX",
        members: [contactRequest.receiver],
        conservationAttributes: {
          lastMessage: null,
        },
      });
    }

    return null;
  };

  static rejectContactRequest = async ({ id, userId }) => {
    const contactRequest = await ContactRepository.getPendingContactRequestById(id);

    if (!contactRequest) throw new NotFoundError("Contact request not found");

    const sender = await UserRepository.getUserById(contactRequest.sender);

    if (!sender) {
      await ContactRequestModel.findByIdAndDelete(id);
      throw new ConflictError("The sender account does not exist anymore");
    }

    if (!compareObjIdAndStr(contactRequest.receiver, userId))
      throw new ForbiddenError("Only receiver are allowed to reject this request");

    const updatedContactRequest = await ContactRequestModel.findByIdAndUpdate(id, {
      status: "rejected",
    });

    if (!updatedContactRequest)
      throw new InternalServerError("Something went wrong, please try again later!");

    return updatedContactRequest;
  };

  static updateContactRequest = async ({ id, userId, updatedMessage }) => {
    const contactRequest = await ContactRepository.getPendingContactRequestById(id);
    if (!contactRequest) throw new NotFoundError("Contact request not found");

    if (!compareObjIdAndStr(contactRequest.sender, userId))
      throw new ForbiddenError("Only sender are allowed to update this contact request");

    const updated = await ContactRepository.updateContactRequestPopulate({
      contactRequestId: id,
      bodyUpdate: {
        requestMessage: updatedMessage,
      },
      isNew: true,
      populate: { path: "receiver", select: "userName email photo country gender" },
    });

    return {
      contactRequest: pickDataInfoExcept(["__v"], updated.toObject()),
    };
  };
}

module.exports = ContactService;
