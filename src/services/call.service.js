"use strict";

const ConservationRepository = require("../models/repositories/conservation.repository");
const {
  BadRequestError,
  InternalServerError,
  ConflictError,
  GoneError,
  NotFoundError,
} = require("../core/error.response");
const CallModel = require("../models/call.model");
const { convertStringToObjectId } = require("../utils");
const UserRepository = require("../models/repositories/user.repository");
const { v4: uuid } = require("uuid");
const CallRepository = require("../models/repositories/call.repository");
const AgoraService = require("./agora.service");
const { createKey, hSet, del, sAdd } = require("./redis.service");
const { RtcRole } = require("agora-token");

const callStatus = {
  INIT: "INIT",
  PENDING: "PENDING",
  ENDED: "ENDED",
};

class CallService {
  static initCall = async ({ callerId, conservationId, mediaType }) => {
    const foundUser = await UserRepository.getUserById(callerId);

    if (!foundUser) throw new BadRequestError("You're not register");

    if (foundUser.isCalling)
      throw new ConflictError(
        "You're in a call now, please end up the current call if you want to perform a new call"
      );

    const foundConservation = await ConservationRepository.getConservationById(conservationId);

    if (!foundConservation) throw new BadRequestError("Conservation not found");

    if (foundConservation.isCalling)
      throw new ConflictError(
        "Your conservation are in a call now, please end up the current call if you want to perform a new call"
      );

    const createdCall = await CallModel.create({
      beginAt: Date.now(),
      caller: convertStringToObjectId(callerId),
      conservation: convertStringToObjectId(conservationId),
      attendances: [convertStringToObjectId(callerId)],
      status: callStatus.INIT,
      mediaType: mediaType,
      type: foundConservation.type === "GROUP" ? "GROUP" : "ONE_TO_ONE",
    });

    if (!createdCall) throw new InternalServerError("Can't create call");

    const channelName = `channel-${foundConservation._id.toString()}`;
    const rtcTokenUid = uuid();
    const rtmTokenUid = uuid();

    const rtcToken = AgoraService.generateAgoraRTCToken({
      channelName,
      role: RtcRole.PUBLISHER,
      uid: rtcTokenUid,
      expiredTimestampInSeconds: 3600,
    });

    const rtmToken = AgoraService.generateAgoraRTMToken({
      uid: rtmTokenUid,
      expiredTimestampInSeconds: 3600,
    });

    await ConservationRepository.updateConservationById({
      conservationId: conservationId,
      updatedPart: { isCalling: true },
    });

    await UserRepository.updateUserById({ userId: callerId, update: { isCalling: true } });

    return {
      call: createdCall,
      channel: channelName,
      rtcToken: rtcToken,
      rtmToken: rtmToken,
      rtcUid: rtcTokenUid,
      rtmUid: rtmTokenUid,
    };
  };

  static joinCall = async ({ joinerId, callId }) => {
    const foundCall = await CallModel.findById(callId);

    if (!foundCall) throw new BadRequestError("Call not exists");

    if (foundCall.status === callStatus.ENDED) throw new GoneError("Call has ended");

    let updatedCall = await CallRepository.updateById({
      id: callId,
      updated: { $addToSet: { attendances: convertStringToObjectId(joinerId) } },
    });

    if (updatedCall.attendances.length === 2) {
      updatedCall = await CallRepository.updateById({
        id: callId,
        updated: { status: callStatus.PENDING },
      });
    }

    if (!updatedCall)
      throw new InternalServerError("Some thing went wrong, please try again later");

    const channelName = `channel-${foundCall.conservation.toString()}`;
    const rtcTokenUid = uuid();
    const rtmTokenUid = uuid();

    const rtcToken = AgoraService.generateAgoraRTCToken({
      channelName,
      role: RtcRole.PUBLISHER,
      uid: rtcTokenUid,
      expiredTimestampInSeconds: 3600,
    });

    const rtmToken = AgoraService.generateAgoraRTMToken({
      uid: rtmTokenUid,
      expiredTimestampInSeconds: 3600,
    });

    await UserRepository.updateUserById({ userId: joinerId, update: { isCalling: true } });

    return {
      call: updatedCall,
      channel: channelName,
      rtcToken,
      rtmToken,
      rtcUid: rtcTokenUid,
      rtmUid: rtmTokenUid,
    };
  };

  static getCallAttendances = async ({ callId }) => {
    const foundCall = await CallRepository.getByIdAndPopulate({
      id: callId,
      populate: { path: "attendances", select: "_id userName email photo" },
    });

    if (!foundCall) throw new NotFoundError("Call not found");

    return foundCall.attendances;
  };

  static endCall = async ({ ender, callId }) => {
    const foundCall = await CallModel.findById(callId);
    console.log("check");
    if (!foundCall) throw new BadRequestError("Call not exists");

    if (foundCall.status === callStatus.ENDED) throw new GoneError("Call has ended");

    const updatedCall = await CallRepository.updateById({
      id: callId,
      updated: {
        status: callStatus.ENDED,
        endAt: Date.now(),
        callEnder: convertStringToObjectId(ender),
      },
    });

    if (!updatedCall)
      throw new InternalServerError("Some thing went wrong, please try again later");

    await UserRepository.updateUserById({ userId: joinerId, update: { isCalling: false } });

    await ConservationRepository.updateConservationById({
      conservationId: foundCall.conservation.toString(),
      updatedPart: { isCalling: false },
    });

    await del(createKey({ modelName: "calls", id: callId }));

    return updatedCall;
  };
}

module.exports = CallService;
