"use strict";

const express = require("express");

const accessRouter = require("./access");
const themeRouter = require("./theme/index");
const conservationRouter = require("./conservation/index");
const contactRouter = require("./contact/index");
const messageRouter = require("./message");
const uploadRouter = require("./upload");
const userRouter = require("./user");
const industryRouter = require("./industry");
const interestRouter = require("./interest");

const router = express.Router();

router.use("/v1/api/auth", accessRouter);
router.use("/v1/api/users", userRouter);
router.use("/v1/api/themes", themeRouter);
router.use("/v1/api/conservations", conservationRouter);
router.use("/v1/api/contact-request", contactRouter);
router.use("/v1/api/upload", uploadRouter);
router.use("/v1/api/message", messageRouter);
router.use("/v1/api/industries", industryRouter);
router.use("/v1/api/interests", interestRouter);

module.exports = router;
