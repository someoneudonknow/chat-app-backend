"use strict";

const { BadRequestError } = require("../core/error.response");
const ConservationRepository = require("../models/repositories/conservation.repository");
const {
  convertStringToObjectId,
  filterDataWithQueryObj,
  compareObjIdAndStr,
  deepCleanObject,
  pickDataInfo,
} = require("../utils/index");
const MessageModel = require("../models/message.model");
const MessageRepository = require("../models/repositories/message.repository");

/*
 1- get all message from conservation --done
 2- search for messages --done
 3- soft delete messages --done
 4- create new message --done
 5- hard delete messages --done
 6- filter messages --done
 8- pin message --done
 9- update message --done
 */

class MessageService {
  static createMessage = async ({
    userId,
    conservationId,
    text = "",
    attachments = [],
    mentionedMembers = [],
    replyTo,
  }) => {
    let convervationFound = await ConservationRepository.getConservationById(conservationId);

    if (!convervationFound) {
      throw new BadRequestError("Can't find conservation");
    }

    if (replyTo) {
      const isSameConvervation = convervationFound.members.find((m) =>
        compareObjIdAndStr(m.user, replyTo)
      );

      if (!isSameConvervation)
        throw new BadRequestError("Can't reply to user in different conversion");
    }

    if (mentionedMembers.length > 0) {
      const isSameConvervation = mentionedMembers.every((member) =>
        convervationFound.members.some((cm) => compareObjIdAndStr(cm.user, member))
      );

      if (!isSameConvervation)
        throw new BadRequestError("Can't mention to users in different conversion");
    }

    const newMessage = {
      text,
      user: convertStringToObjectId(userId),
      conservation: convertStringToObjectId(convervationFound._id),
      attachments,
      mentionedMembers: mentionedMembers,
      replyTo,
    };

    const insertedMessage = await MessageModel.create(newMessage);

    return insertedMessage;
  };

  static searchMessages = async ({ keySearch }) => {
    const keySearchRegex = new RegExp(keySearch);

    return await MessageModel.find(
      {
        $text: {
          $search: keySearchRegex,
        },
        isDeleted: false,
      },
      {
        score: { $meta: "textScore" },
      }
    )
      .sort({
        score: { $meta: "textScore" },
      })
      .lean();
  };

  static softDelete = async (messageId) => {
    return await MessageModel.findByIdAndUpdate(
      messageId,
      {
        isDeleted: true,
      },
      { new: true }
    );
  };

  static hardDelete = async (messageId) => {
    return await MessageModel.findByIdAndDelete(messageId);
  };

  static getAllMessagesInConservation = async ({ conservationId, limit = 50, page = 1 }) => {
    return await MessageRepository.queryMessageWithUnselect({
      filter: {
        conservation: convertStringToObjectId(conservationId),
        isDeleted: false,
      },
      limit,
      page,
      unSelect: ["__v"],
    });
  };

  static filterMessages = async ({ userId, queryParams }) => {
    const query = MessageModel.find({
      user: convertStringToObjectId(userId),
      isDeleted: false,
    });

    return await filterDataWithQueryObj(query, queryParams);
  };

  static pinMessage = async ({ messageId, expiredAt }) => {
    return await MessageModel.findByIdAndUpdate(messageId, {
      pinned: {
        isPinned: true,
        pinnedAt: Date.now(),
        expiredAt: new Date(expiredAt),
      },
    });
  };

  static getAllAttachmentsInConservation = async ({ conservationId }) => {
    const allMessages = await MessageModel.find({
      conservation: convertStringToObjectId(conservationId),
    }).lean();

    return allMessages.flatMap((message) => message.attachments);
  };

  static updateMessage = async ({ messageId, userId, bodyUpdate }) => {
    const foundMessage = await MessageModel.findById(messageId);

    if (!foundMessage) throw new BadRequestError("Couldn't find message");

    if (!compareObjIdAndStr(foundMessage.user, userId)) {
      throw new BadRequestError("You can't update this message");
    }

    const transformedData = pickDataInfo(["text", "pinned"], bodyUpdate);

    if (transformedData.pinned) {
      if (transformedData.pinned.isPinned) {
        transformedData.pinned.pinnedAt = new Date();

        switch (transformedData.pinned.type) {
          case "temporary":
            if (!transformedData.pinned.expiredAt) {
              throw new BadRequestError("Must provide an expiration date");
            }

            if (new Date(transformedData.pinned?.expiredAt) <= new Date()) {
              throw new BadRequestError("Expiration time must be greater than current date");
            }
            break;
          case "permanent":
            transformedData.pinned.expiredAt = undefined;
            break;
          default:
            throw new BadRequestError("Pin type not supported");
        }
      } else {
        transformedData.pinned.pinnedAt = undefined;
        transformedData.pinned.type = undefined;
        transformedData.pinned.expiredAt = undefined;
      }
    }

    const cleanedUpdateBody = deepCleanObject(transformedData);

    const updatedMessage = await MessageModel.findByIdAndUpdate(messageId, cleanedUpdateBody, {
      new: true,
    });

    return updatedMessage;
  };
}

module.exports = MessageService;
