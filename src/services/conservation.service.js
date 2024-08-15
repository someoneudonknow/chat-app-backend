"use strict";

const ConservationModel = require("../models/conservation.model");
const { BadRequestError, NotFoundError } = require("../core/error.response");
const ConservationRepository = require("../models/repositories/conservation.repository");
const UserRepository = require("../models/repositories/user.repository");
const { Types } = require("mongoose");
const UserModel = require("../models/user.model");
const {
  pickDataInfoExcept,
  deepCleanObject,
  flattenObject,
  convertStringToObjectId,
} = require("../utils");

const ConservationType = {
  GROUP: "GROUP",
  INBOX: "INBOX",
  DIRECT_MESSAGE: "DIRECT_MESSAGE",
};

class Conservation {
  constructor({ creator, type, members, conservationAttributes }) {
    this.creator = creator;
    this.type = type;
    this.conservationAttributes = conservationAttributes;
    this.members = members;
  }

  async create() {
    return await ConservationModel.create(this);
  }
}

class Group extends Conservation {
  create = async () => {
    const membersSet = new Set(this.members);

    membersSet.add(this.creator);

    const membersSetToArray = Array.from(membersSet);

    const membersCheck = await Promise.all(
      membersSetToArray.map(async (m) => {
        return !!(await UserRepository.getUserById(m));
      })
    );

    if (!membersCheck.every((m) => m)) throw new BadRequestError("Member not exists");

    this.members = membersSetToArray.map((m) => {
      if (m === this.creator) {
        return { user: new Types.ObjectId(m), role: "HOST" };
      }
      return { user: new Types.ObjectId(m), role: "MEMBER" };
    });

    const newConservation = await super.create();

    if (!newConservation) throw new BadRequestError("Error while creating new conservation");

    return newConservation;
  };
}

class Inbox extends Conservation {
  create = async () => {
    if (this.members.length > 2) throw new BadRequestError("Inbox must have only 2 members");
    const membersSet = new Set(this.members);

    membersSet.add(this.creator);

    const membersSetToArray = Array.from(membersSet);

    const membersCheck = await Promise.all(
      membersSetToArray.map(async (m) => {
        return !!(await UserRepository.getUserById(m));
      })
    );

    if (!membersCheck.every((m) => m)) throw new BadRequestError("Member not exists");

    this.members = membersSetToArray.map((m) => {
      return { user: new Types.ObjectId(m), role: "MEMBER" };
    });

    const newConservation = await super.create();
    if (!newConservation) throw new BadRequestError("Error while creating new conservation");

    return newConservation;
  };
}

class ConservationFactory {
  static conservationTypeRegister = {};

  static register(type, classReference) {
    ConservationFactory.conservationTypeRegister[type] = classReference;
  }

  static async create(type, payload) {
    const ConservationClass = ConservationFactory.conservationTypeRegister[type];

    if (!ConservationFactory.conservationTypeRegister[type])
      throw new BadRequestError("Conservation type is not available");

    return new ConservationClass(payload).create();
  }
}

ConservationFactory.register(ConservationType.GROUP, Group);
ConservationFactory.register(ConservationType.INBOX, Inbox);
ConservationFactory.register(ConservationType.DIRECT_MESSAGE, Inbox);

class ConservationService {
  static getConservationById = async ({ conservationId }) => {
    return await ConservationModel.findById(conservationId)
      .populate({
        path: "members.user",
        select: "userName email photo country interests industry gender isOnline",
      })
      .lean();
  };

  static searchConsevations = async ({ keyword, query }) => {
    return await ConservationRepository.searchConservations({
      keySearch: keyword,
      query,
    });
  };

  static updateConservation = async ({ bodyUpdate, conservationId }) => {
    const invalidFields = ["type", "createdAt", "updatedAt", "members", "creator"];
    const validObject = deepCleanObject(pickDataInfoExcept(invalidFields, bodyUpdate));

    return await ConservationRepository.updateConservationById({
      conservationId,
      updatedPart: flattenObject(validObject),
    });
  };

  static createConservation = async (type, payload) => {
    const newConservation = await ConservationFactory.create(type, payload);

    const results = await Promise.all(
      newConservation.members.map(async (c) => {
        const updateUser = await UserModel.findByIdAndUpdate(c.user.toString(), {
          $addToSet: {
            joinedConservations: newConservation._id,
          },
        });

        return updateUser;
      })
    );

    if (!results) throw new BadRequestError("There was an error please try again later");

    return newConservation;
  };

  static getAllConservations = async ({ query }) => {
    return await ConservationRepository.getAllConservations({
      page: query?.page || 1,
      limit: query.limit || 10,
    });
  };

  static getAllPublicConservations = async ({ query }) => {
    return await ConservationRepository.getAllPublicConservations({
      page: query?.page || 1,
      limit: query?.limit || 10,
    });
  };

  static getAllPrivateConservations = async ({ query }) => {
    return await ConservationRepository.getAllPrivateConservations({
      page: query?.page || 1,
      limit: query?.limit || 10,
    });
  };

  static joinExistingConservation = async ({ userId, conservationId }) => {
    const foundConservation = await ConservationRepository.getConservationById(conservationId);

    if (!foundConservation) throw new NotFoundError("Can't find conservation with that id");

    const userFound = await UserRepository.getUserById(userId);
    if (!userFound) throw new NotFoundError("You're not registered");

    if (foundConservation.type === "INBOX")
      throw new BadRequestError("You can't join this conservation");

    if (foundConservation.members.find((mem) => mem.user.toString() === userId))
      throw new BadRequestError("You're already joined this conservation");

    if (
      foundConservation.type === "GROUP" &&
      foundConservation.conservationAttributes.isPublished === false
    )
      throw new BadRequestError(
        "You can't directly join this conservation, please make a request to the host to join"
      );

    await userFound.updateOne({
      $addToSet: {
        joinedConservations: foundConservation._id,
      },
    });

    const { modifiedCount } = await foundConservation.updateOne({
      $addToSet: {
        members: {
          user: userFound._id,
        },
      },
    });

    return modifiedCount;
  };

  static leaveExistingConservation = async ({ userId, conservationId }) => {
    const foundConservation = await ConservationRepository.getConservationById(conservationId);

    if (!foundConservation) throw new NotFoundError("Can't find conservation with that id");

    const userFound = await UserRepository.getUserById(userId);
    if (!userFound) throw new NotFoundError("Can't find user with that id");

    if (foundConservation.type === "INBOX")
      throw new BadRequestError("You can't leave this conservation");

    const member = foundConservation.members.find((mem) => mem.user.toString() === userId);
    if (!member) throw new BadRequestError("You're not in this conservation");

    if (member.role === "HOST")
      throw new BadRequestError("You're a host member of this conservation, so you can't leave");

    await userFound.updateOne({
      $pull: {
        joinedConservations: foundConservation._id,
      },
    });

    const { modifiedCount } = await foundConservation.updateOne({
      $pull: {
        members: {
          user: userFound._id,
        },
      },
    });

    return modifiedCount;
  };

  static deleteExistingConservation = async (conservationId) => {
    await ConservationModel.findByIdAndUpdate(
      conservationId,
      {
        isDeleted: true,
      },
      { new: true }
    );

    return null;
  };

  static getAllJoinedConservations = async ({ userId, query }) => {
    const page = query?.page || 1;
    const limit = query?.limit || 10;

    const filter = {
      members: {
        $elemMatch: {
          user: convertStringToObjectId(userId),
        },
      },
    };

    const docCount = await ConservationModel.countDocuments(filter);

    const result = await ConservationModel.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({
        path: "members.user",
        select: "userName email photo country interests industry gender isOnline",
      })
      .populate({
        path: "lastMessage",
        select: "_id type content sender createdAt",
        options: {
          sort: {
            createdAt: 1,
          },
        },
      })
      .lean();

    return {
      totalPages: Math.ceil(docCount / limit),
      list: result,
    };
  };
}

module.exports = ConservationService;
