"use strict";

const { SuccessResponse } = require("../core/success.response");
const UploadService = require("../services/upload.service");

class UploadController {
  uploadAttachments = async (req, res, next) => {
    new SuccessResponse({
      message: "Upload attachment successfully",
      metadata: await UploadService.uploadMany({
        folder: "user-uploads",
        files: req.files,
        userId: req.user.userId,
      }),
    }).send(res);
  };

  uploadAttachment = async (req, res, next) => {
    new SuccessResponse({
      message: "Upload attachments successfully",
      metadata: await UploadService.uploadOne({
        folder: "user-uploads",
        file: req.file,
        userId: req.user.userId,
      }),
    }).send(res);
  };
}

module.exports = new UploadController();
