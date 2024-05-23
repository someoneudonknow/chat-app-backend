"use strict";

const { BadRequestError, InternalServerError } = require("../core/error.response");
const { createKey, set, get, del } = require("./redis.service");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

class OTPService {
  static generateOTP = () => {
    return crypto.randomBytes(16).toString("hex");
  };

  static createOTP = async ({ uid, timeout = 10 }) => {
    const key = createKey({
      modelName: "otps",
      id: uid,
    });

    const otp = this.generateOTP();

    const otpHashed = await bcrypt.hash(otp, 10);

    await set(key, otpHashed, {
      EX: 60 * timeout,
      NX: true,
    });

    return otp;
  };

  static verifyOTP = async ({ otp, uid }) => {
    const key = createKey({
      modelName: "otps",
      id: uid,
    });

    const otpStored = await get(key);

    if (!otpStored) {
      throw new BadRequestError("OTP not is invalid");
    }

    const validOTP = bcrypt.compare(otp, otpStored);

    return validOTP;
  };
}

module.exports = OTPService;
