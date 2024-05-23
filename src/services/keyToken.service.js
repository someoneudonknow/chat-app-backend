"use strict";

const KeyTokenModel = require("../models/keyToken.model");
const { Types } = require("mongoose");

class KeyTokenService {
  static createKeyToken = async ({
    userId,
    publicKey,
    privateKey,
    refreshToken,
  }) => {
    try {
      const filter = {
        userId,
      };

      const update = {
        publicKey,
        privateKey,
        refreshTokensUsed: [],
        refreshToken,
      };

      const options = {
        upsert: true,
        new: true,
      };

      const token = await KeyTokenModel.findOneAndUpdate(
        filter,
        update,
        options
      );

      return token ? token.publicKey : null;
    } catch (error) {
      throw error;
    }
  };

  static findByUserId = async (userId) => {
    const keyFound = await KeyTokenModel.findOne({
      userId,
    }).lean();

    return keyFound;
  };

  static removeByKeyId = async (keyId) => {
    return await KeyTokenModel.findByIdAndDelete(keyId);
  };

  static findByRefreshTokenUsed = async (refreshToken) => {
    return await KeyTokenModel.findOne({
      refreshTokenUsed: refreshToken,
    }).lean();
  };

  static deleteByUserId = async (userId) => {
    return await KeyTokenModel.deleteOne({ userId: userId });
  };

  static findByRefreshToken = async (refreshToken) => {
    return await KeyTokenModel.findOne({ refreshToken }).lean();
  };

  static findByIdAndUpdate = async (id, update) => {
    return await KeyTokenModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id) },
      update
    );
  };
}

module.exports = KeyTokenService;
