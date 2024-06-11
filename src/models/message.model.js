"use strict";

const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const MESSAGE_COLLECTION_NAME = "Messages";
const MESSAGE_DOCUMENT_NAME = "Message";

const TEXT_MESSAGE_COLLECTION_NAME = "TextMessages";
const TEXT_MESSAGE_DOCUMENT_NAME = "TextMessage";

const GIF_MESSAGE_COLLECTION_NAME = "GifMessages";
const GIF_MESSAGE_DOCUMENT_NAME = "GifMessage";

const FILE_MESSAGE_COLLECTION_NAME = "FileMessages";
const FILE_MESSAGE_DOCUMENT_NAME = "FileMessage";

const IMAGE_MESSAGE_COLLECTION_NAME = "ImageMessages";
const IMAGE_MESSAGE_DOCUMENT_NAME = "ImageMessage";

const AUDIO_MESSAGE_COLLECTION_NAME = "AudioMessages";
const AUDIO_MESSAGE_DOCUMENT_NAME = "AudioMessage";

const VIDEO_MESSAGE_COLLECTION_NAME = "VideoMessages";
const VIDEO_MESSAGE_DOCUMENT_NAME = "VideoMessage";

const MessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    conservation: {
      type: mongoose.Types.ObjectId,
      ref: "Conservation",
    },
    type: {
      type: String,
      enum: ["text", "gif", "file", "image", "audio", "video", "consult", "location"],
      default: "text",
      index: true,
    },
    content: {},
    pinned: {
      isPinned: {
        type: Boolean,
        default: false,
      },
      type: {
        type: String,
        enum: ["permanent", "temporary"],
      },
      pinnedAt: {
        type: Date,
      },
      expiredAt: Date,
    },
    mentionedMembers: {
      type: [
        {
          type: mongoose.Types.ObjectId,
          ref: "User",
        },
      ],
    },
    replyTo: {
      type: mongoose.Types.ObjectId,
      ref: "Message",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: MESSAGE_COLLECTION_NAME,
    timestamps: true,
  }
);

// indexes
MessageSchema.index({
  text: "text",
});

// plugins
MessageSchema.plugin(mongoosePaginate);

const TextMessageSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    sender: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  { collection: TEXT_MESSAGE_COLLECTION_NAME }
);

const GifMessageSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["gif", "sticker"],
    },
    sender: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    altText: String,
    giphyId: String,
    rating: String,
    images: {},
  },
  { collection: GIF_MESSAGE_COLLECTION_NAME }
);

const FileMessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: String,
    downloadUrl: String,
    totalBytes: Number,
    publicId: String,
    additionalContents: {},
  },
  { collection: FILE_MESSAGE_COLLECTION_NAME }
);

const ImageMessageSchema = new mongoose.Schema(
  {
    totalBytes: Number,
    publicId: String,
    originalName: {
      type: String,
      required: true,
    },
    originalImage: {
      width: Number,
      height: Number,
      url: String,
    },
    sender: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    additionalContents: {},
  },
  { collection: IMAGE_MESSAGE_COLLECTION_NAME }
);

const AudioMessageSchema = new mongoose.Schema(
  {
    url: String,
    totalBytes: Number,
    publicId: String,
    duration: Number,
    url: String,
    sender: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    additionalContents: {},
  },
  { collection: AUDIO_MESSAGE_COLLECTION_NAME }
);

const VideoMessageSchema = new mongoose.Schema(
  {
    totalBytes: Number,
    publicId: String,
    sender: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    originalVideo: {
      duration: Number,
      url: String,
    },
    additionalContents: {},
  },
  { collection: VIDEO_MESSAGE_COLLECTION_NAME }
);

const MessageModel = mongoose.model(MESSAGE_DOCUMENT_NAME, MessageSchema);
const TextMessageModel = mongoose.model(TEXT_MESSAGE_DOCUMENT_NAME, TextMessageSchema);
const GifMessageModel = mongoose.model(GIF_MESSAGE_DOCUMENT_NAME, GifMessageSchema);
const FileMessageModel = mongoose.model(FILE_MESSAGE_DOCUMENT_NAME, FileMessageSchema);
const ImageMessageModel = mongoose.model(IMAGE_MESSAGE_DOCUMENT_NAME, ImageMessageSchema);
const AudioMessageModel = mongoose.model(AUDIO_MESSAGE_DOCUMENT_NAME, AudioMessageSchema);
const VideoMessageModel = mongoose.model(VIDEO_MESSAGE_DOCUMENT_NAME, VideoMessageSchema);

module.exports = {
  MessageModel,
  TextMessageModel,
  GifMessageModel,
  FileMessageModel,
  AudioMessageModel,
  ImageMessageModel,
  VideoMessageModel,
};
