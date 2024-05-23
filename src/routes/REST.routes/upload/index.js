"use strict";

const express = require("express");
const UploadController = require("../../../controller/upload.controller");
const asyncHandler = require("../../../helpers/asyncHandler");
const { authentication } = require("../../../auth/auth.middlewares");
const { uploadDisk } = require("../../../multer/multer.init");

const uploadRouter = express.Router();

uploadRouter.use(authentication);

uploadRouter.post(
  "/attachment",
  uploadDisk.single("attachment"),
  asyncHandler(UploadController.uploadAttachment)
);

uploadRouter.post(
  "/attachments",
  uploadDisk.array("attachments", 20),
  asyncHandler(UploadController.uploadAttachments)
);

module.exports = uploadRouter;
