"use strict";

const { RtcTokenBuilder, RtmTokenBuilder } = require("agora-token");
const {
  agora: { app_id, app_cerf },
} = require("../config/config.app");

class AgoraService {
  static generateAgoraRTCToken = ({ channelName, uid, role, expiredTimestampInSeconds }) => {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const tokenExpirationTimestamp = currentTimestamp + expiredTimestampInSeconds;

    const token = RtcTokenBuilder.buildTokenWithUid(
      app_id,
      app_cerf,
      channelName,
      uid,
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
