"use strict";

const { RtcTokenBuilder, RtmTokenBuilder } = require("agora-token");
const {
  agora: { app_id, app_cerf },
} = require("../config/config.app");

const generateNumericUid = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash) % 10000;
};

class AgoraService {
  static generateAgoraRTCToken = ({ channelName, uid, role, expiredTimestampInSeconds }) => {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const tokenExpirationTimestamp = currentTimestamp + expiredTimestampInSeconds;

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
