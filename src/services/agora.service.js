"use strict";

const { RtcTokenBuilder, RtmTokenBuilder } = require("agora-token");
const {
  agora: { app_id, app_cerf },
} = require("../config/config.app");

// Generate a numeric UID from a string by hashing
const generateNumericUid = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Ensure positive number and limit to Agora's valid range (0-10000)
  return Math.abs(hash) % 10000;
};

class AgoraService {
  static generateAgoraRTCToken = ({ channelName, uid, role, expiredTimestampInSeconds }) => {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const tokenExpirationTimestamp = currentTimestamp + expiredTimestampInSeconds;

    // Convert UUID to numeric UID if it's a string
    const numericUid = typeof uid === "string" ? generateNumericUid(uid) : uid;

    const token = RtcTokenBuilder.buildTokenWithUid(
      app_id,
      app_cerf,
      channelName,
      numericUid,
      role,
      tokenExpirationTimestamp
    );

    return token;
  };

  static generateAgoraRTMToken = ({ uid, expiredTimestampInSeconds }) => {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const tokenExpirationTimestamp = currentTimestamp + expiredTimestampInSeconds;

    const token = RtmTokenBuilder.buildToken(app_id, app_cerf, uid, tokenExpirationTimestamp);

    return token;
  };
}

module.exports = AgoraService;
