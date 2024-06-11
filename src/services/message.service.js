"use strict";

const { BadRequestError, NotImplementedError } = require("../core/error.response");
const ConservationRepository = require("../models/repositories/conservation.repository");
const {
  convertStringToObjectId,
  filterDataWithQueryObj,
  compareObjIdAndStr,
  deepCleanObject,
  pickDataInfo,
} = require("../utils/index");
const {
  MessageModel,
  TextMessageModel,
  GifMessageModel,
  FileMessageModel,
  ImageMessageModel,
  AudioMessageModel,
  VideoMessageModel,
} = require("../models/message.model");
const UserRepository = require("../models/repositories/user.repository");
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
const messageTypes = {
  TEXT: "text",
  GIF: "gif",
  FILE: "file",
  IMAGE: "image",
  AUDIO: "audio",
  VIDEO: "video",
  CONSULT: "consult",
  LOCATION: "location",
};

class Message {
  constructor({
    sender,
    conservation,
    type,
    pinned,
    content,
    mentionedMembers,
    replyTo,
    isDeleted,
  }) {
    this.sender = sender;
    this.conservation = conservation;
    this.type = type;
    this.pinned = pinned;
    this.content = content;
    this.mentionedMembers = mentionedMembers;
    this.replyTo = replyTo;
    this.isDeleted = isDeleted;
  }

  async createMessage(id) {
    return await MessageModel.create({ _id: id, ...this });
  }
}

class TextMessage extends Message {
  async create() {
    const { text } = this.content;
    if (!text) throw new BadRequestError("Please provide a text content of your message");

    const textMessageCreated = await TextMessageModel.create({
      ...this.content,
      sender: this.sender,
    });
    if (!textMessageCreated) throw new InternalError("Something went while creating");

    const createdMessage = await super.createMessage(textMessageCreated._id);
    if (!createdMessage) throw new InternalError("Something went while creating");

    return createdMessage;
  }
}

class GifMessage extends Message {
  async create() {
    const createdGifMessage = await GifMessageModel.create({
      ...this.content,
      sender: this.sender,
    });
    if (!createdGifMessage) throw new InternalError("Something went while creating");

    const createdMessage = await super.createMessage(createdGifMessage._id);
    if (!createdMessage) throw new InternalError("Something went while creating");

    return createdMessage;
  }
}

class FileMessage extends Message {
  async create() {
    const createdFileMessage = await FileMessageModel.create({
      ...this.content,
      sender: this.sender,
    });
    if (!createdFileMessage) throw new InternalError("Something went while creating");

    const createdMessage = await super.createMessage(createdFileMessage._id);
    if (!createdMessage) throw new InternalError("Something went wrong while creating");

    return createdMessage;
  }
}

class ImageMessage extends Message {
  async create() {
    const createdImageMessage = await ImageMessageModel.create({
      ...this.content,
      sender: this.sender,
    });
    if (!createdImageMessage) throw new InternalError("Something went while creating");

    const createdMessage = await super.createMessage(createdImageMessage._id);
    if (!createdMessage) throw new InternalError("Something went wrong while creating");

    return createdMessage;
  }
}

class AudioMessage extends Message {
  async create() {
    const createdAudioMessage = await AudioMessageModel.create({
      ...this.content,
      sender: this.sender,
    });
    if (!createdAudioMessage) throw new InternalError("Something went while creating");

    const createdMessage = await super.createMessage(createdAudioMessage._id);
    if (!createdMessage) throw new InternalError("Something went wrong while creating");

    return createdMessage;
  }
}

class VideoMessage extends Message {
  async create() {
    const createdVideoMessage = await VideoMessageModel.create({
      ...this.content,
      sender: this.sender,
    });
    if (!createdVideoMessage) throw new InternalError("Something went while creating");

    const createdMessage = await super.createMessage(createdVideoMessage._id);
    if (!createdMessage) throw new InternalError("Something went wrong while creating");

    return createdMessage;
  }
}

class MessageFactory {
  static registeredMessage = {};

  static registerMessage = async (type, model) => {
    MessageFactory.registeredMessage[type] = model;
  };

  static createMessage = async (type, body) => {
    const referMessageClass = MessageFactory.registeredMessage[type];

    if (!referMessageClass) throw new NotImplementedError("Message type not valid");

    return new referMessageClass(body).create();
  };
}

MessageFactory.registerMessage(messageTypes.TEXT, TextMessage);
MessageFactory.registerMessage(messageTypes.GIF, GifMessage);
MessageFactory.registerMessage(messageTypes.FILE, FileMessage);
MessageFactory.registerMessage(messageTypes.IMAGE, ImageMessage);
MessageFactory.registerMessage(messageTypes.AUDIO, AudioMessage);
MessageFactory.registerMessage(messageTypes.VIDEO, VideoMessage);

const eventNames = {
  NEW_MESSAGE: "messages/new",
};

class MessageService {
  static createMessage = async ({ userId, body }) => {
    const foundUser = await UserRepository.getUserById(userId);

    if (!foundUser) throw new BadRequestError("You're not registered");

    const { mentionedMembers = [], replyTo, type, conservation } = body;

    let convervationFound = await ConservationRepository.getConservationById(conservation);

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

      const isMentionedSelf = mentionedMembers.find((m) => m === userId);

      if (isMentionedSelf) throw new BadRequestError("Can't mention to yourself");
    }

    const insertedMessage = await MessageFactory.createMessage(type, { ...body, sender: userId });
    const returnResult = {
      ...insertedMessage.toObject(),
      sender: pickDataInfo(["photo", "userName", "email", "country", "_id"], foundUser.toObject()),
    };

   await ConservationRepository.updateConservationById({
      conservationId: insertedMessage.conservation.toString(),
      updatedPart: {
        lastMessage: insertedMessage._id
      }
    });

    global._io
      .to(insertedMessage.conservation.toString())
      .emit(eventNames.NEW_MESSAGE, returnResult);

    return returnResult;
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

  // cursor base pagination implement
  static getAllMessagesInConservation = async ({
    conservationId,
    limit = 20,
    nextCursor,
    prevCursor,
  }) => {
    let results = [];
    let hasNext = false,
      hasPrev = false,
      next = null,
      prev = null;
    const query = { conservation: convertStringToObjectId(conservationId) };

    if (!nextCursor && !prevCursor) {
      results = await MessageModel.find(query).limit(limit).sort({ createdAt: -1 }).populate({
        path: "sender",
        select: "photo userName email country _id",
      });
    } else {
      if (nextCursor) {
        const [createdAt, id] = nextCursor.split("_");
        if (!createdAt || !id) throw new BadRequestError("Invalid cursor");

        results = await MessageModel.find({
          ...query,
          $or: [
            { createdAt: { $lt: new Date(createdAt) } },
            { createdAt: new Date(createdAt), _id: { $lt: id } },
          ],
        })
          .limit(limit)
          .sort({ createdAt: -1 })
          .populate({
            path: "sender",
            select: "photo userName email country _id",
          });
      } else if (prevCursor) {
        const [createdAt, id] = prevCursor.split("_");
        if (!createdAt || !id) throw new BadRequestError("Invalid cursor");

        results = await MessageModel.find({
          ...query,
          $or: [
            { createdAt: { $gt: new Date(createdAt) } },
            { createdAt: new Date(createdAt), _id: { $gt: id } },
          ],
        })
          .limit(limit)
          .sort({ createdAt: 1, _id: 1 })
          .populate({
            path: "sender",
            select: "photo userName email country _id",
          });

        results.reverse();
      }
    }

    if (results.length > 0) {
      const lastItem = results[results.length - 1];
      const firstItem = results[0];

      hasNext = !!(await MessageModel.findOne({ ...query, _id: { $lt: lastItem._id } }));
      hasPrev = !!(await MessageModel.findOne({ ...query, _id: { $gt: firstItem._id } }));

      if (hasNext) next = `${lastItem.createdAt.toISOString()}_${lastItem._id}`;
      if (hasPrev) prev = `${firstItem.createdAt.toISOString()}_${firstItem._id}`;
    }

    return {
      list: results.map((r) => ({
        ...r.toObject(),
        sender: pickDataInfo(["photo", "userName", "email", "country", "_id"], r.sender),
      })),
      hasNext,
      hasPrev,
      next,
      prev,
    };
  };

  static filterMessages = async ({ userId, queryParams }) => {
    const query = MessageModel.find({
      sender: convertStringToObjectId(userId),
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
    return [];
  };

  static updateMessage = async ({ messageId, userId, bodyUpdate }) => {
    const foundMessage = await MessageModel.findById(messageId);

    if (!foundMessage) throw new BadRequestError("Couldn't find message");

    if (!compareObjIdAndStr(foundMessage.sender, userId)) {
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
