"use strict";

const ConservationRepository = require("../models/repositories/conservation.repository");
const {
  BadRequestError,
  InternalServerError,
  GoneError,
  NotFoundError,
} = require("../core/error.response");
const CallModel = require("../models/call.model");
const { convertStringToObjectId } = require("../utils");
const UserRepository = require("../models/repositories/user.repository");
const { v4: uuid } = require("uuid");
const CallRepository = require("../models/repositories/call.repository");
const AgoraService = require("./agora.service");
const { createKey, hSet, del } = require("./redis.service");
const { RtcRole } = require("agora-token");
const axios = require("axios");
const {
  agora: { app_id, customer_id, customer_secret },
  services: { ai },
  aws,
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

const generateRecordingUid = () => {
  return 999000 + Math.floor(Math.random() * 1000);
};

const callStatus = {
  INIT: "INIT",
  PENDING: "PENDING",
  ENDED: "ENDED",
};

class CallService {
  static getCallSummary = async ({ callId, maxLength, language = "vi" }) => {
    const foundCall = await CallModel.findById(callId);
    if (!foundCall) throw new NotFoundError("Call not found");

    if (foundCall.status !== callStatus.ENDED) throw new BadRequestError("Call is not ended");

    const recordingFiles = foundCall.recordingFiles;
    if (!recordingFiles || recordingFiles.length === 0)
      throw new BadRequestError("No recording files found");

    const recordingFilePath = recordingFiles.map((file) => file?.fileName);
    let audioFilePath = recordingFilePath.find((file) => file.endsWith(".mp4"));

    if (!audioFilePath) {
      audioFilePath = recordingFilePath[0];
    }

    try {
      console.log(`Requesting summary for audio file: ${audioFilePath}, callId: ${callId}`);
      const response = await axios.post(`${ai.baseUrl}/api/v1/summarize/audio`, {
        file_path: audioFilePath,
        max_length: maxLength,
        language: language,
      });

      const summaryData = response.data;
      console.log(`Received summary for call ${callId}: ${summaryData.summary}`);

      const updatedCall = await CallRepository.updateById({
        id: callId,
        updated: {
          recordingSummary: summaryData.summary,
        },
      });

      const MessageModel = require("../models/message.model").MessageModel;
      const callMessage = await MessageModel.findOne({
        type: "call",
        "content.callId": convertStringToObjectId(callId),
      });

      if (callMessage) {
        console.log(`Updating call message ${callMessage._id} with summary for call ${callId}`);
        await MessageModel.findByIdAndUpdate(callMessage._id, {
          $set: { "content.summary": summaryData.summary },
        });

        if (global._io) {
          console.log(`Emitting message:updated event for message ${callMessage._id}`);
          global._io.to(callMessage.conservation.toString()).emit("message:updated", {
            messageId: callMessage._id,
            updates: { summary: summaryData.summary },
          });
        }
      } else {
        console.log(`No call message found for call ${callId}`);
      }

      return summaryData;
    } catch (error) {
      console.error("Error getting call summary:", error.message);

      if (error.response && error.response.data) {
        throw new InternalServerError(`AI service error: ${JSON.stringify(error.response.data)}`);
      }

      throw new InternalServerError(`Failed to get call summary: ${error.message}`);
    }
  };

  static queryRecordingStatus = async ({ resourceId, sid, channelName, uid }) => {
    if (!resourceId || !sid || !channelName || !uid) {
      throw new BadRequestError("Missing required parameters for query");
    }

    if (!app_id || !customer_id || !customer_secret) {
      throw new BadRequestError("Agora configuration is incomplete");
    }

    const query_url = `https://api.agora.io/v1/apps/${app_id}/cloud_recording/resourceid/${resourceId}/sid/${sid}/mode/mix/query`;

    try {
      const credentials = Buffer.from(`${customer_id}:${customer_secret}`).toString("base64");

      console.log("Query recording status URL:", query_url);

      const response = await axios.get(query_url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${credentials}`,
        },
      });

      console.log("Query recording status response:", JSON.stringify(response.data, null, 2));

      return {
        success: true,
        status: response.data.serverResponse?.status || "unknown",
        resourceId,
        sid,
        details: response.data,
      };
    } catch (error) {
      console.error("Failed to query recording status:", error.response?.data || error.message);

      if (error.response) {
        console.error("Error response status:", error.response.status);
        console.error("Error response data:", error.response.data);
      }

      return {
        success: false,
        status: "error",
        errorCode: error.response?.status,
        errorMessage: error.response?.data?.reason || error.message,
        resourceId,
        sid,
      };
    }
  };

  static startRecord = async ({ callId, uid, channelName }) => {
    if (!callId || !uid || !channelName) {
      throw new BadRequestError("Missing required parameters");
    }

    const foundCall = await CallModel.findById(callId);
    if (!foundCall) throw new NotFoundError("Call not found");
    if (foundCall.status === callStatus.ENDED) throw new GoneError("Call has ended");
    if (foundCall.isRecording) throw new BadRequestError("Call is already being recorded");

    if (!app_id || !customer_id || !customer_secret) {
      throw new BadRequestError(
        "Agora configuration is incomplete. Please check your environment variables for AGORA_APP_ID, AGORA_CUSTOMER_ID, and AGORA_CUSTOMER_SECRET."
      );
    }

    if (!aws?.s3?.accessKey || !aws?.s3?.secretKey || !aws?.s3?.region) {
      throw new BadRequestError(
        "AWS S3 configuration is incomplete. Please check your environment variables for S3_ACCESS_KEY, S3_SECRET, and S3_REGION."
      );
    }

    const recordingUid = generateRecordingUid();

    let resourceId;
    const acquire_url = `https://api.agora.io/v1/apps/${app_id}/cloud_recording/acquire`;

    try {
      const credentials = Buffer.from(`${customer_id}:${customer_secret}`).toString("base64");

      console.log(`credentials: ${credentials}`);

      const requestBody = {
        cname: channelName,
        uid: recordingUid.toString(),
        clientRequest: {
          resourceExpiredHour: 24,
        },
      };

      console.log("Request body:", JSON.stringify(requestBody));
      console.log("Acquire URL:", acquire_url);

      const response = await axios.post(acquire_url, requestBody, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${credentials}`,
        },
      });

      resourceId = response.data.resourceId;
      console.log("Successfully acquired resourceId:", resourceId);
    } catch (error) {
      console.error("Failed to acquire resource ID:", error.response?.data || error.message);

      if (error.response) {
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
        console.error("Error response data:", error.response.data);
      }

      throw new InternalServerError(`Failed to acquire recording resource: ${error.message}`);
    }

    const start_url = `https://api.agora.io/v1/apps/${app_id}/cloud_recording/resourceid/${resourceId}/mode/mix/start`;

    try {
      const isAudioOnly = foundCall.mediaType === "AUDIO_CALL";

      const bucketName = aws.s3.bucket;

      const storageConfig = {
        vendor: 1, // 1: Agora's cloud storage
        region: 0,
        bucket: bucketName,
        accessKey: aws.s3.accessKey,
        secretKey: aws.s3.secretKey,
        fileNamePrefix: ["calls", foundCall._id.toString()],
      };

      const credentials = Buffer.from(`${customer_id}:${customer_secret}`).toString("base64");

      const numericUid = parseInt(recordingUid.toString(), 10);
      const rtcToken = AgoraService.generateAgoraRTCToken({
        channelName,
        uid: numericUid,
        role: RtcRole.PUBLISHER,
        expiredTimestampInSeconds: 2 * 3600,
      });

      const requestBody = {
        cname: channelName,
        uid: recordingUid.toString(),
        clientRequest: {
          token: rtcToken,
          recordingConfig: {
            channelType: 0,
            streamTypes: 0,
            audioProfile: 0,
            videoStreamType: 0,
            maxIdleTime: 30,
            transcodingConfig: {
              width: 640,
              height: 480,
              fps: 30,
              bitrate: 600,
              mixedVideoLayout: 1,
              backgroundColor: "#000000",
            },
          },
          recordingFileConfig: {
            avFileType: ["hls", "mp4"],
          },
          storageConfig,
        },
      };

      console.log("Start recording request:", JSON.stringify(requestBody, null, 2));

      const response = await axios.post(start_url, requestBody, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${credentials}`,
        },
      });

      console.log("Start recording response:", JSON.stringify(response.data, null, 2));

      const recordingInfo = {
        resourceId,
        sid: response.data.sid,
        callId,
        channelName,
        uid: recordingUid,
        startedAt: Date.now(),
        storageConfig: {
          bucket: bucketName,
        },
        serverResponse: response.data.serverResponse || {},
      };

      await hSet(
        createKey({ modelName: "calls", id: callId }),
        "recording",
        JSON.stringify(recordingInfo)
      );

      await CallRepository.updateById({
        id: callId,
        updated: {
          isRecording: true,
          recordingData: recordingInfo,
        },
      });

      return {
        success: true,
        recordingInfo,
      };
    } catch (error) {
      console.error("Failed to start recording:", error.response?.data || error.message);

      if (error.response) {
        console.error("Error response status:", error.response.status);
        console.error("Error response data:", error.response.data);
      }

      throw new InternalServerError(`Failed to start recording: ${error.message}`);
    }
  };

  static pauseRecord = async ({ callId }) => {
    if (!callId) throw new BadRequestError("Call ID is required");

    const foundCall = await CallModel.findById(callId);
    if (!foundCall) throw new NotFoundError("Call not found");
    if (foundCall.status === callStatus.ENDED) throw new GoneError("Call has ended");
    if (!foundCall.isRecording) throw new BadRequestError("Call is not being recorded");
    if (foundCall.isRecordingPaused) throw new BadRequestError("Recording is already paused");

    const recordingData = foundCall.recordingData;
    if (!recordingData || !recordingData.resourceId || !recordingData.sid) {
      throw new BadRequestError("Recording data not found");
    }

    if (!app_id || !customer_id || !customer_secret) {
      throw new BadRequestError("Agora configuration is incomplete");
    }

    const { resourceId, sid, channelName, uid } = recordingData;

    const pause_url = `https://api.agora.io/v1/apps/${app_id}/cloud_recording/resourceid/${resourceId}/sid/${sid}/mode/mix/pause`;

    try {
      const credentials = Buffer.from(`${customer_id}:${customer_secret}`).toString("base64");

      const requestBody = {
        cname: channelName,
        uid: uid.toString(),
        clientRequest: {},
      };

      console.log("Pause recording request URL:", pause_url);
      console.log("Pause recording request body:", JSON.stringify(requestBody));

      const response = await axios.post(pause_url, requestBody, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${credentials}`,
        },
      });

      console.log("Pause recording response:", JSON.stringify(response.data, null, 2));

      await CallRepository.updateById({
        id: callId,
        updated: {
          isRecordingPaused: true,
        },
      });

      const redisRecordingKey = createKey({ modelName: "calls", id: callId });
      const redisRecordingData = JSON.parse(await hSet(redisRecordingKey, "recording", "{}")); // Get existing data

      if (redisRecordingData) {
        redisRecordingData.isPaused = true;
        redisRecordingData.pausedAt = Date.now();

        await hSet(redisRecordingKey, "recording", JSON.stringify(redisRecordingData));
      }

      return {
        success: true,
        message: "Recording paused successfully",
      };
    } catch (error) {
      console.error("Failed to pause recording:", error.response?.data || error.message);

      if (error.response) {
        console.error("Error response status:", error.response.status);
        console.error("Error response data:", error.response.data);
      }

      throw new InternalServerError(`Failed to pause recording: ${error.message}`);
    }
  };

  static resumeRecord = async ({ callId }) => {
    if (!callId) throw new BadRequestError("Call ID is required");

    const foundCall = await CallModel.findById(callId);
    if (!foundCall) throw new NotFoundError("Call not found");
    if (foundCall.status === callStatus.ENDED) throw new GoneError("Call has ended");
    if (!foundCall.isRecording) throw new BadRequestError("Call is not being recorded");
    if (!foundCall.isRecordingPaused) throw new BadRequestError("Recording is not paused");

    const recordingData = foundCall.recordingData;
    if (!recordingData || !recordingData.resourceId || !recordingData.sid) {
      throw new BadRequestError("Recording data not found");
    }

    if (!app_id || !customer_id || !customer_secret) {
      throw new BadRequestError("Agora configuration is incomplete");
    }

    const { resourceId, sid, channelName, uid } = recordingData;

    const resume_url = `https://api.agora.io/v1/apps/${app_id}/cloud_recording/resourceid/${resourceId}/sid/${sid}/mode/mix/resume`;

    try {
      const credentials = Buffer.from(`${customer_id}:${customer_secret}`).toString("base64");

      const requestBody = {
        cname: channelName,
        uid: uid.toString(),
        clientRequest: {},
      };

      console.log("Resume recording request URL:", resume_url);
      console.log("Resume recording request body:", JSON.stringify(requestBody));

      const response = await axios.post(resume_url, requestBody, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${credentials}`,
        },
      });

      console.log("Resume recording response:", JSON.stringify(response.data, null, 2));

      await CallRepository.updateById({
        id: callId,
        updated: {
          isRecordingPaused: false,
        },
      });

      const redisRecordingKey = createKey({ modelName: "calls", id: callId });
      const redisRecordingData = JSON.parse(await hSet(redisRecordingKey, "recording", "{}")); // Get existing data

      if (redisRecordingData) {
        redisRecordingData.isPaused = false;
        redisRecordingData.resumedAt = Date.now();

        await hSet(redisRecordingKey, "recording", JSON.stringify(redisRecordingData));
      }

      return {
        success: true,
        message: "Recording resumed successfully",
      };
    } catch (error) {
      console.error("Failed to resume recording:", error.response?.data || error.message);

      if (error.response) {
        console.error("Error response status:", error.response.status);
        console.error("Error response data:", error.response.data);
      }

      throw new InternalServerError(`Failed to resume recording: ${error.message}`);
    }
  };

  static stopRecord = async ({ callId }) => {
    if (!callId) throw new BadRequestError("Call ID is required");

    const foundCall = await CallModel.findById(callId);
    if (!foundCall) throw new NotFoundError("Call not found");
    if (!foundCall.isRecording) throw new BadRequestError("Call is not being recorded");

    const recordingData = foundCall.recordingData;
    if (!recordingData || !recordingData.resourceId || !recordingData.sid) {
      throw new BadRequestError("Recording data not found");
    }

    if (!app_id || !customer_id || !customer_secret) {
      throw new BadRequestError("Agora configuration is incomplete");
    }

    const { resourceId, sid, channelName, uid } = recordingData;

    const stop_url = `https://api.agora.io/v1/apps/${app_id}/cloud_recording/resourceid/${resourceId}/sid/${sid}/mode/mix/stop`;

    try {
      const credentials = Buffer.from(`${customer_id}:${customer_secret}`).toString("base64");
      console.log("credentials", credentials);

      const requestBody = {
        cname: channelName,
        uid: uid.toString(),
        clientRequest: {},
      };

      console.log("Stop recording request URL:", stop_url);
      console.log("Stop recording request body:", JSON.stringify(requestBody));

      const response = await axios.post(stop_url, requestBody, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${credentials}`,
        },
      });

      console.log("Stop recording response:", JSON.stringify(response.data, null, 2));
      console.log(response.data);
      const recordingFiles = response.data.serverResponse?.fileList || [];

      const s3Urls = recordingFiles.map((file) => {
        const bucket = aws.s3.bucket;
        const region = aws.s3.region;

        const fileName = file.fileName || "";

        return `https://${bucket}.s3.${region}.amazonaws.com/${fileName}`;
      });

      console.log("S3 URLs for recording files:", s3Urls);

      await CallRepository.updateById({
        id: callId,
        updated: {
          isRecording: false,
          isRecordingPaused: false,
          recordingStopped: true,
          recordingFiles: recordingFiles,
          recordingS3Urls: s3Urls,
          recordingStoppedAt: Date.now(),
        },
      });

      try {
        await del(createKey({ modelName: "calls", id: callId }));
      } catch (redisError) {
        console.error("Redis error when cleaning up:", redisError.message);
      }

      return {
        success: true,
        recordingFiles,
        recordingUrls: s3Urls,
      };
    } catch (error) {
      console.error("Failed to stop recording:", error.response?.data || error.message);

      if (error.response) {
        console.error("Error response status:", error.response.status);
        console.error("Error response data:", error.response.data);
      }

      if (
        (error.response?.status === 404 &&
          error.response?.data?.reason === "failed to find worker") ||
        error.message?.includes("failed to find worker")
      ) {
        console.log(
          "Recording resource not found. Updating call record to mark recording as stopped."
        );
        await CallRepository.updateById({
          id: callId,
          updated: {
            isRecording: false,
            isRecordingPaused: false,
            recordingStopped: true,
            recordingStoppedAt: Date.now(),
          },
        });

        try {
          await del(createKey({ modelName: "calls", id: callId }));
        } catch (redisError) {
          console.error("Redis error when cleaning up:", redisError.message);
        }

        return {
          success: true,
          message: "Recording marked as stopped (resource not found on Agora servers)",
          recordingFiles: [],
          recordingUrls: [],
        };
      }

      throw new InternalServerError(`Failed to stop recording: ${error.message}`);
    }
  };

  static initCall = async ({ callerId, conservationId, mediaType }) => {
    const foundUser = await UserRepository.getUserById(callerId);

    if (!foundUser) throw new BadRequestError("You're not register");
    // if (foundUser.isCalling)
    //   throw new ConflictError(
    //     "You're in a call now, please end up the current call if you want to perform a new call"
    //   );

    const foundConservation = await ConservationRepository.getConservationById(conservationId);

    if (!foundConservation) throw new BadRequestError("Conservation not found");

    // if (foundConservation.isCalling)
    //   throw new ConflictError(
    //     "Your conservation are in a call now, please end up the current call if you want to perform a new call"
    //   );

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
    const numericRtcUid = generateNumericUid(rtcTokenUid);

    const rtcToken = AgoraService.generateAgoraRTCToken({
      channelName,
      role: RtcRole.PUBLISHER,
      uid: numericRtcUid,
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
      rtcUid: numericRtcUid,
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
    const numericRtcUid = generateNumericUid(rtcTokenUid);

    const rtcToken = AgoraService.generateAgoraRTCToken({
      channelName,
      role: RtcRole.PUBLISHER,
      uid: numericRtcUid,
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
      rtcUid: numericRtcUid,
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

    await UserRepository.updateUserById({ userId: ender, update: { isCalling: false } });

    await ConservationRepository.updateConservationById({
      conservationId: foundCall.conservation.toString(),
      updatedPart: { isCalling: false },
    });

    await del(createKey({ modelName: "calls", id: callId }));

    new Promise((resolve, reject) => {});

    await CallService.createCallMessage({ call: updatedCall });

    return updatedCall;
  };

  static createCallMessage = async ({ call }) => {
    try {
      const duration = call.endAt ? Math.round((call.endAt - call.beginAt) / 1000) : 0;

      const participants = call.attendances ? call.attendances.map((id) => id.toString()) : [];

      console.log("Call data for message:", {
        id: call._id,
        duration,
        beginAt: call.beginAt,
        endAt: call.endAt,
        mediaType: call.mediaType,
        isRecorded: call.recordingStopped || false,
        recordingSummary: call.recordingSummary,
        participants: participants.length,
        recordingUrls: (call.recordingS3Urls || []).length,
      });

      const messageData = {
        sender: call.caller,
        conservation: call.conservation,
        type: "call",
        content: {
          duration,
          callStartedAt: call.beginAt,
          callEndedAt: call.endAt,
          callType: call.mediaType === "AUDIO_CALL" ? "audio" : "video",
          isRecorded: call.recordingStopped || false,
          summary: null,
          participants: participants,
          callId: call._id,
          recordingUrls: call.recordingS3Urls || [],
        },
      };

      console.log("Creating call message with data:", JSON.stringify(messageData, null, 2));

      const MessageService = require("./message.service");
      const createdMessage = await MessageService.createMessage({
        userId: call.caller.toString(),
        body: messageData,
      });

      console.log("Call message created successfully with ID:", createdMessage?._id);

      if (global._io) {
        global._io.to(call.conservation.toString()).emit("call:ended", {
          messageId: createdMessage?._id,
          callId: call._id,
        });
      }

      return createdMessage;
    } catch (error) {
      console.error("Error creating call message:", error);
      return null;
    }
  };

  static getCallInfo = async ({ callId }) => {
    const foundCall = await CallRepository.getByIdAndPopulate({
      id: callId,
      populate: [
        { path: "caller", select: "_id userName email photo" },
        { path: "attendances", select: "_id userName email photo" },
        { path: "conservation", select: "_id name type" },
      ],
    });

    if (!foundCall) throw new NotFoundError("Call not found");

    const channelName = `channel-${foundCall.conservation._id.toString()}`;

    return {
      call: foundCall,
      channel: channelName,
    };
  };
}

module.exports = CallService;
