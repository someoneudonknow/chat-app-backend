"use strict";

const cloudinary = require("../cloudinary/cloudinary.init");
const { v4: uuidv4 } = require("uuid");

const settings = {
  IMAGE_SETTING: {
    resource_type: "image",
    transformation: [
      { width: 800, crop: "scale" }, // Resize the image to 800
      { quality: "auto" }, // Automatically determine the optimal quality
      { fetch_format: "auto" },
    ],
  },
  VIDEO_SETTING: {
    resource_type: "video",
    quality: 50,
    transformation: [
      { width: 500, crop: "scale" }, // Resize the image to 800
      { quality: "auto" }, // Automatically determine the optimal quality
      { fetch_format: "auto" },
    ],
  },
  OTHER_SETTING: {
    resource_type: "raw",
  },
};

class UploadService {
  static uploadOne = async ({ folder, file, userId }) => {
    const fileType = file.mimetype.split("/")[0];

    const paramObject = {
      folder,
      localUrl: file.path,
      userId,
      fileName: uuidv4(),
    };

    let result;

    switch (fileType) {
      case "image":
        result = await this.uploadImage(paramObject);
        break;
      case "video":
        result = await this.uploadVideo(paramObject);
        break;
      case "audio":
        result = await this.uploadAudioFile(paramObject);
        break;
      default:
        result = await this.uploadFile(paramObject);
        break;
    }

    return {
      type: result.type,
      content: {
        secureUrl: result.secure_url,
        url: result.url,
        originalName: result.original_filename,
      },
    };
  };

  static uploadMany = async ({ folder, files, userId }) => {
    const pendingUpload = files.map((file) => UploadService.uploadOne({ folder, file, userId }));

    return await Promise.all(pendingUpload);
  };

  static uploadImage = async ({ folder, localUrl, userId, fileName }) => {
    const _folder = `${folder}/images/${userId}`;

    const options = {
      public_id: fileName,
      folder: _folder,
    };

    return {
      ...(await cloudinary.uploader.upload(localUrl, options)),
      type: "image",
    };
  };

  static uploadVideo = async ({ folder, localUrl, userId, fileName }) => {
    const _folder = `${folder}/videos/${userId}`;

    const options = {
      public_id: fileName,
      folder: _folder,
      ...settings.VIDEO_SETTING,
    };

    return {
      ...(await cloudinary.uploader.upload(localUrl, options)),
      type: "video",
    };
  };

  static uploadFile = async ({ folder, localUrl, userId, fileName }) => {
    const _folder = `${folder}/files/${userId}`;

    const options = {
      public_id: fileName,
      folder: _folder,
      ...settings.OTHER_SETTING,
    };

    return {
      ...(await cloudinary.uploader.upload(localUrl, options)),
      type: "file",
    };
  };

  static uploadAudioFile = async ({ folder, localUrl, userId, fileName }) => {
    const _folder = `${folder}/audios/${userId}`;

    const options = {
      public_id: fileName,
      folder: _folder,
      ...settings.OTHER_SETTING,
    };

    return {
      ...(await cloudinary.uploader.upload(localUrl, options)),
      type: "audio",
    };
  };

  static deleteFile = async () => {};
}

module.exports = UploadService;
