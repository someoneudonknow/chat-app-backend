"use strict";

const bcrypt = require("bcrypt");
const {
  NotFoundError,
  InternalServerError,
  BadRequestError,
  NotModifiedError,
  ForbiddenError,
} = require("../core/error.response");
const { sendMail } = require("./email.service");
const UserRepository = require("../models/repositories/user.repository");
const UserModel = require("../models/user.model");
const {
  pickDataInfoExcept,
  pickDataInfo,
  deepCleanObject,
  replaceTemplateData,
  unSelectDataQuery,
  convertStringToObjectId,
} = require("../utils");
const { clientUrl } = require("../config/config.app");
const { createOTP, verifyOTP } = require("./otp.service");
const verifyEmailTemplate = require("../templates/verifyEmail.template");
const InterestModel = require("../models/interest.model");
const ConservationModel = require("../models/conservation.model");

class UserService {
  static searchUserConservations = async ({ keyword, userId, query }) => {
    const limit = parseInt(query.limit) || 10;
    const page = parseInt(query.page) || 1;

    const foundUser = await UserRepository.getUserById(userId);
    if (!foundUser) throw new BadRequestError("You're not registered !");

    const aggregateConservations = [
      {
        $match: {
          isDeleted: false,
          "members.user": convertStringToObjectId(foundUser._id),
        },
      },
      {
        $lookup: {
          from: "Users",
          localField: "members.user",
          foreignField: "_id",
          as: "joinedMembers",
        },
      },
      {
        $match: {
          $or: [
            {
              "joinedMembers.userName": {
                $regex: new RegExp(keyword, "i"),
              },
            },
            {
              "joinedMembers.email": {
                $regex: new RegExp(keyword, "i"),
              },
            },
            {
              "conservationAttributes.groupName": {
                $regex: new RegExp(keyword, "i"),
              },
            },
          ],
        },
      },
      {
        $project: {
          members: {
            $map: {
              input: {
                $range: [0, { $size: "$joinedMembers" }],
              },
              as: "i",
              in: {
                $mergeObjects: [
                  { nickname: { $arrayElemAt: ["$members.nickname", "$$i"] } },
                  {
                    user: {
                      _id: { $arrayElemAt: ["$joinedMembers._id", "$$i"] },
                      email: { $arrayElemAt: ["$joinedMembers.email", "$$i"] },
                      isOnline: { $arrayElemAt: ["$joinedMembers.isOnline", "$$i"] },
                      role: { $arrayElemAt: ["$joinedMembers.role", "$$i"] },
                      birthday: { $arrayElemAt: ["$joinedMembers.birthday", "$$i"] },
                      userName: { $arrayElemAt: ["$joinedMembers.userName", "$$i"] },
                      photo: { $arrayElemAt: ["$joinedMembers.photo", "$$i"] },
                    },
                  },
                ],
              },
            },
          },
          _id: 1,
          type: 1,
          creator: 1,
          lastMessage: 1,
        },
      },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ];

    const aggregateCnt = [
      {
        $match: {
          isDeleted: false,
          "members.user": convertStringToObjectId(foundUser._id),
        },
      },
      {
        $lookup: {
          from: "Users",
          localField: "members.user",
          foreignField: "_id",
          as: "joinedMembers",
        },
      },
      {
        $match: {
          $or: [
            {
              "joinedMembers.userName": {
                $regex: new RegExp(keyword, "i"),
              },
            },
            {
              "joinedMembers.email": {
                $regex: new RegExp(keyword, "i"),
              },
            },
            {
              "conservationAttributes.groupName": {
                $regex: new RegExp(keyword, "i"),
              },
            },
          ],
        },
      },
      { $count: "cnt" },
      {
        $project: {
          totalPages: {
            $ceil: { $divide: ["$cnt", limit] },
          },
        },
      },
    ];

    const [userConservations, docCount] = await Promise.all([
      ConservationModel.aggregate(aggregateConservations),
      ConservationModel.aggregate(aggregateCnt),
    ]);
    console.log({ userConservations, docCount });
    return {
      list: userConservations,
      totalPages: docCount?.[0]?.totalPages || 0,
    };
  };

  static searchContacts = async ({ keyword, userId, query }) => {
    const limit = parseInt(query.limit) || 10;
    const page = parseInt(query.page) || 1;

    const foundUser = await UserRepository.getUserById(userId);
    if (!foundUser) throw new BadRequestError("You're not registered !");

    const userContacts = foundUser.contactList;

    if (!userContacts.length === 0) return [];

    const keySearch = new RegExp(keyword);

    const results = await UserModel.find({
      $text: {
        $search: keySearch,
      },
      isDeleted: false,
      _id: {
        $in: userContacts,
      },
    })
      .sort({
        score: { $meta: "textScore" },
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .select(
        unSelectDataQuery([
          "password",
          "status",
          "contactList",
          "blockedList",
          "joinedConservations",
          "loginMethod",
          "isOnline",
          "lastOnlineAt",
          "role",
          "isDeleted",
          "createdAt",
          "updatedAt",
          "__v",
        ])
      )
      .lean();

    return {
      list: results,
      totalPages: Math.ceil(userContacts.length / limit),
    };
  };

  static getMeContactInfo = async ({ userId, query }) => {
    const limit = parseInt(query.limit) || 10;
    const page = parseInt(query.page) || 1;

    const foundUser = await UserRepository.getUserById(userId);
    if (!foundUser) throw new BadRequestError("You're not registered !");

    const userContacts = foundUser.contactList;

    if (!userContacts.length === 0) return [];

    const contactLength = userContacts.length;

    const idsAfterSkipped = userContacts.filter((_, i) => i > (page - 1) * limit - 1);
    const idsAfterLimited = idsAfterSkipped.filter((_, i) => i < limit);

    const result = await Promise.all(
      idsAfterLimited.map(async (id) => {
        const userById = await UserRepository.getUserById(id);

        return pickDataInfoExcept(
          [
            "password",
            "status",
            "contactList",
            "blockedList",
            "joinedConservations",
            "loginMethod",
            "role",
            "isDeleted",
            "createdAt",
            "updatedAt",
            "__v",
          ],
          userById.toObject()
        );
      })
    );

    return {
      list: result,
      totalPages: Math.ceil(contactLength / limit),
    };
  };

  static getContactRecomendations = async ({ userId, page, limit }) => {
    const foundUser = await UserRepository.getUserById(userId);

    if (!foundUser) throw new ForbiddenError("You're not registered");
    // maybe implement recomendations system
    const pageNum = page || 1;
    const limitCnt = limit || 5;

    const foundResult = await UserModel.find()
      .skip((pageNum - 1) * limit)
      .limit(limitCnt)
      .select("userName photo email country _id gender");
    const docsNum = await UserModel.countDocuments();

    return {
      list: foundResult,
      totalPages: Math.ceil(docsNum / limitCnt),
    };
  };

  static findByEmail = async (email) => {
    return await UserModel.findOne({ email }).lean();
  };

  static discoverUser = async ({ userId }) => {
    return pickDataInfo(
      [
        "userName",
        "country",
        "interests",
        "_id",
        "gender",
        "birthday",
        "description",
        "photo",
        "background",
        "email",
        "isOnline",
        "industry",
      ],
      await UserModel.findById(userId).lean()
    );
  };

  static getMeInfo = async ({ userId }) => {
    return pickDataInfoExcept(
      ["password", "createdAt", "updatedAt", "__v", "isDeleted"],
      await UserModel.findById(userId).lean()
    );
  };

  static increaseProfileCompletionStep = async ({ userId }) => {
    const foundUser = await UserRepository.getUserById(userId);

    if (!foundUser) throw new NotFoundError("You're not registered");

    if (foundUser.lastCompletedUserProfileStep >= 4) {
      throw new BadRequestError("Already reach to the last step");
    }

    const updated = await UserRepository.updateUserById({
      userId,
      update: {
        $inc: {
          lastCompletedUserProfileStep: 1,
        },
      },
      isNew: true,
    });

    return pickDataInfo(["lastCompletedUserProfileStep"], updated.toObject());
  };

  static searchUsers = async ({ keySearch }) => {
    const keySearchRegex = new RegExp(keySearch);

    return await UserModel.find(
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
      .select(
        unSelectDataQuery([
          "password",
          "status",
          "contactList",
          "blockedList",
          "joinedConservations",
          "loginMethod",
          "isOnline",
          "lastOnlineAt",
          "role",
          "isDeleted",
          "createdAt",
          "updatedAt",
          "__v",
        ])
      )
      .limit(10)
      .lean();
  };

  static updateUser = async ({ userId, bodyUpdate }) => {
    const foundUser = await UserRepository.getUserById(userId);

    if (!foundUser) throw new NotFoundError("User not found");

    const cleanedUpdateBody = pickDataInfo(
      [
        "userName",
        "birthday",
        "photo",
        "isOnline",
        "lastOnlineAt",
        "gender",
        "country",
        "industry",
        "description",
        "background",
      ],
      deepCleanObject(bodyUpdate)
    );

    const updatedUser = await UserRepository.updateUserById({
      userId: foundUser._id,
      update: cleanedUpdateBody,
    });

    if (!updatedUser) throw new InternalServerError("Something went wrong");

    return pickDataInfoExcept(
      ["password", "createdAt", "updatedAt", "__v", "isDeleted"],
      updatedUser.toObject()
    );
  };

  static forgotPassword = async ({ email }) => {
    const foundUser = await this.findByEmail(email);

    if (!foundUser) throw new BadRequestError("You are not registered");

    const TIMEOUT = 3;

    const createdOtp = await createOTP({ uid: foundUser._id, timeout: TIMEOUT });

    await sendMail({
      from: "Tran Tu <nguyentu550278@gmail.com>",
      to: email,
      subject: "This is your verification email",
      html: replaceTemplateData(verifyEmailTemplate, {
        expiredMinutes: TIMEOUT,
        verifyLink: `${clientUrl}/resetPassword?otp=${createdOtp}&id=${foundUser._id}`,
      }),
    });

    return null;
  };

  static resetPassword = async ({ otp, uid, bodyUpdate }) => {
    const foundUser = await UserRepository.getUserById(uid);
    if (!foundUser) throw new BadRequestError("You are not registered");

    const verifedOTP = await verifyOTP({
      otp,
      uid,
    });

    if (!verifedOTP) throw new BadRequestError("Invalid or expired otp");

    const cleanedBodyUpdate = pickDataInfo(["password"], deepCleanObject(bodyUpdate));

    const hashedPassword = await bcrypt.hash(cleanedBodyUpdate.password, 10);

    await UserRepository.updateUserById({ userId: uid, update: { password: hashedPassword } });

    return null;
  };

  static addInterest = async ({ userId, interestIds }) => {
    if (interestIds.length === 0) throw new NotModifiedError("Nothing changed");

    const foundInterests = await Promise.all(
      interestIds.map(async (id) => {
        const foundInterest = await InterestModel.findById(id);

        return foundInterest?._id;
      })
    );

    if (!foundInterests.every((i) => i)) throw new BadRequestError("Interest not found");

    const foundUser = await UserRepository.getUserById(userId);

    if (!foundUser) throw new BadRequestError("you're not register");

    const userInterestIds = foundUser.interests.map((i) => i._id);
    const removedDubIds = foundInterests.filter(
      (i) => !userInterestIds.some((ui) => ui.toString() === i.toString())
    );

    const updatedInterests = await InterestModel.updateMany(
      {
        _id: {
          $in: removedDubIds,
        },
      },
      {
        $inc: {
          usedCount: 1,
        },
      }
    );

    if (!updatedInterests) throw new InternalServerError("Something went wrong");

    const updated = await UserRepository.updateUserById({
      userId,
      update: {
        $addToSet: {
          interests: {
            $each: removedDubIds,
          },
        },
      },
      isNew: true,
    });

    if (!updated) throw new InternalServerError("Something went wrong");

    return pickDataInfoExcept(
      ["password", "createdAt", "updatedAt", "__v", "isDeleted"],
      updated.toObject()
    );
  };

  static removeInterest = async ({ userId, interestId }) => {
    const foundInterest = await InterestModel.findById(interestId);

    if (!foundInterest) throw new BadRequestError("Interest not found");

    const foundUser = await UserRepository.getUserById(userId);

    if (!foundUser) throw new BadRequestError("You're not registered");

    if (!foundUser.interests.some((i) => i.equals(foundInterest._id))) {
      return pickDataInfoExcept(
        ["password", "createdAt", "updatedAt", "__v", "isDeleted"],
        foundUser.toObject()
      );
    }

    const updatedInterest = await InterestModel.findByIdAndUpdate(interestId, {
      $inc: {
        usedCount: -1,
      },
    });

    if (!updatedInterest) throw new InternalServerError("Something went wrong");

    const updated = await UserRepository.updateUserById({
      userId,
      update: {
        $pull: {
          interests: convertStringToObjectId(interestId),
        },
      },
      isNew: true,
    });

    return pickDataInfoExcept(
      ["password", "createdAt", "updatedAt", "__v", "isDeleted"],
      updated.toObject()
    );
  };
}

module.exports = UserService;
