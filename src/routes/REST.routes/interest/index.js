"use strict";

const express = require("express");
const InterestController = require("../../../controller/interest.controller");
const asyncHandler = require("../../../helpers/asyncHandler");
const { authentication } = require("../../../auth/auth.middlewares");

const interestRouter = express.Router();

interestRouter.get("/", asyncHandler(InterestController.getAll));
interestRouter.get("/search/:keySearch", asyncHandler(InterestController.searchInterests));

interestRouter.use(authentication);

interestRouter.post("/", asyncHandler(InterestController.createInterest));
interestRouter.delete("/:interestId", asyncHandler(InterestController.deleteInterest));
interestRouter.patch("/:interestId", asyncHandler(InterestController.updateInterest));
interestRouter.patch("/:interestId/usedCount", asyncHandler(InterestController.increaseUsedCount));

module.exports = interestRouter;
