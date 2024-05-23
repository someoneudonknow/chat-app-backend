"use strict";

const JWT = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("node:crypto");
const {
  ConflictError,
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
  InternalServerError,
} = require("../core/error.response");
const KeyTokenService = require("./keyToken.service");
const UserService = require("./user.service");
const UserModel = require("../models/user.model");
const { createTokenPair } = require("../auth/auth.ultils");
const { pickDataInfoExcept } = require("../utils");

class AccessService {
  static refreshTheToken = async ({ refreshToken, user, storedKey }) => {
    if (!refreshToken) throw new BadRequestError("Please provide a refresh token");

    const { userId, email } = user;
    /**
     * 1) check if the token has been refreshed
     * 2) if yes, delete all the token to force the user to login again
     * 3) if no, find the token in the db if not found return error
     * 4) verify the token and with the found token private key if
     * 5) find user by verified email, if not found return error
     * 6) create a new token pair and update it to the database
     * 7) if update is successful return token pair
     */

    if (storedKey.refreshTokenUsed.includes(refreshToken)) {
      await KeyTokenService.deleteByUserId(userId);

      throw new ForbiddenError(
        "There was some suspicious behaviour in your account! Please log in again!"
      );
    }

    if (storedKey.refreshToken !== refreshToken) {
      throw new AuthFailureError("User not registered!");
    }

    const userFound = await UserService.findByEmail(email);
    if (!userFound) throw new AuthFailureError("User not registered!");

    const newTokens = await createTokenPair(
      {
        userId: userFound._id,
        email: userFound.email,
      },
      storedKey.publicKey,
      storedKey.privateKey
    );

    await KeyTokenService.findByIdAndUpdate(storedKey._id, {
      $set: {
        refreshToken: newTokens.refreshToken,
      },
      $addToSet: {
        refreshTokenUsed: refreshToken,
      },
    });

    return {
      user,
      tokens: newTokens,
    };
  };

  static login = async ({ email, password, refreshToken = null }) => {
    const userFound = await UserService.findByEmail(email);

    if (!userFound) throw new BadRequestError("User is not registered");
    const isPasswordTrue = await bcrypt.compare(password, userFound.password);

    if (!isPasswordTrue) throw new AuthFailureError("Authentication failed");

    const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: "spki",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
      },
    });

    const createdTokens = await createTokenPair(
      {
        userId: userFound._id,
        email: userFound.email,
      },
      publicKey,
      privateKey
    );

    const insertedKeys = await KeyTokenService.createKeyToken({
      userId: userFound._id,
      publicKey,
      privateKey,
      refreshToken: createdTokens.refreshToken,
    });

    if (!insertedKeys) throw new InternalServerError("Something went wrong");

    return {
      user: pickDataInfoExcept(["password", "createdAt", "updatedAt", "__v"], userFound),
      tokens: createdTokens,
    };
  };

  static signup = async ({ email, password }) => {
    const userFound = await UserModel.findOne({ email }).lean();

    if (userFound) {
      throw new ConflictError("User already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await UserModel.create({
      email: email,
      password: hashedPassword,
    });

    if (newUser) {
      const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
        modulusLength: 4096,
        publicKeyEncoding: {
          type: "spki",
          format: "pem",
        },
        privateKeyEncoding: {
          type: "pkcs8",
          format: "pem",
        },
      });

      const insertedKeys = await KeyTokenService.createKeyToken({
        userId: newUser._id,
        privateKey: privateKey.toString(),
        publicKey: publicKey.toString(),
      });

      if (!insertedKeys) throw new InternalServerError("Something went wrong while inserting keys");

      const createdTokens = await createTokenPair(
        {
          userId: newUser._id,
          email: newUser.email,
        },
        publicKey,
        privateKey
      );

      return {
        user: pickDataInfoExcept(["password", "createdAt", "updatedAt", "__v"], newUser),
        tokens: createdTokens,
      };
    } else {
      throw new InternalServerError("Something went wrong");
    }
  };

  static logout = async ({ storedKey }) => {
    await KeyTokenService.removeByKeyId(storedKey._id);

    return null;
  };
}

module.exports = AccessService;
