"use strict";

const multer = require("multer");
const path = require("path");

const MAX_FILE_SIZE = 1024 * 1024 * 100; // 10 mb

const fileFilter = (req, file, cb) => {
  const unExcutableFile = new RegExp(
    /.(exe|bat|sh|msi|cmd|com|scr|bash|pif|app|dmg|command|pkg|sh|run)$/
  );
  if (unExcutableFile.test(file.filename)) {
    return cb(new Error("Can't upload this type of file"), false);
  }

  return cb(null, true);
};

const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./src/uploads");
  },
  filename: function (req, file, cb) {
    console.log(file);
    const fileExt = path.extname(file.originalname);

    cb(null, `user-${req.user.userId}-${Date.now()}${fileExt}`);
  },
});

const uploadDisk = multer({
  storage: diskStorage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

module.exports = { uploadDisk, uploadMemory };
