"use strict";

const { BadRequestError } = require("../core/error.response");
const CallRepository = require("../models/repositories/call.repository");
const ConservationRepository = require("../models/repositories/conservation.repository");
const UserRepository = require("../models/repositories/user.repository");
const { hSet, hGetAll, createKey, sRem, sMembers, sAdd } = require("./redis.service");

const eventName = {
  ONLINE_USER: "users/online-user",
  OFFLINE_USER: "users/offline-user",
  CREATE_CALL: "calls/created",
  REJECT_CALL: "calls/rejected",
  NEW_CALL: "calls/new",
  CALL_REJECTED: "calls/users/rejected",
  CALLEE_LEFT: "calls/users/left",
  CALLEE_JOINED: "calls/users/joined",
  CALLEES_CHANGED: "calls/callees-changed",
};

class SocketService {
  static initializeUser = async function () {
    console.log(`A socket has been established::${this.id}`);
    const userId = this.request?.user.userId;

    this.join && this.join(userId);

    await UserRepository.updateUserById({ userId, update: { isOnline: true } });

    global._io.emit(eventName.ONLINE_USER, userId);
  };

  static handleUserDisconnected = async function () {
    const userId = this.request.user.userId;
    console.log(`A socket has disconected::${this.id}`);
    await UserRepository.updateUserById({ userId, update: { isOnline: false } });

    global._io.emit(eventName.OFFLINE_USER, userId);
  };

  static onCreateCall = async function ({
    callerId,
    conservationId,
    from,
    avatar,
    callId,
    channelName,
    mediaType,
  }) {
    const foundConservation = await ConservationRepository.getConservationById(conservationId);

    if (!foundConservation) throw new NotFoundError("Conservation not found");

    const conservationMembers = foundConservation.members.map((cm) => cm.user.toString());

    conservationMembers.forEach((uid) => {
      if (uid !== callerId) {
        global._io.to(uid).emit(eventName.NEW_CALL, {
          callerId,
          conservationId,
          from,
          avatar,
          callId,
          channelName,
          mediaType,
        });
      }
    });
  };

  static setUpCall = async function ({ callId, user }) {
    if (!callId) throw new Error("Call id is required");

    if (!user) throw new Error("User is required");

    this.join(callId);
    this.to(callId).emit(eventName.CALLEE_JOINED, user);

    await sAdd(createKey({ modelName: "calls", id: callId }), user.id);

    await SocketService.emitCalleesChanged.call(this, callId);
  };

  static onLeaveCall = async function ({ callId, user }) {
    if (!callId) throw new Error("Call id is required");
    if (!user) throw new Error("User is required");

    this.leave(callId);
    this.to(callId).emit(eventName.CALLEE_LEFT, user);

    await sRem(createKey({ modelName: "calls", id: callId }), user.id);

    await SocketService.emitCalleesChanged.call(this, callId);
  };

  static emitCalleesChanged = async function (callId) {
    const callees = await sMembers(createKey({ modelName: "calls", id: callId }));

    global._io.in(callId).emit(eventName.CALLEES_CHANGED, callees);
  };

  static onCallRejected = async function ({ callId, user }) {
    const foundCall = await CallRepository.getById(callId);

    if (!foundCall) throw new BadRequestError("Invalid call");

    const userData = {
      name: user?.userName || user.email,
      _id: user._id,
      avatar: user.photo,
    };

    this.to(callId).emit(eventName.CALL_REJECTED, { user: userData });
  };
}

module.exports = SocketService;
