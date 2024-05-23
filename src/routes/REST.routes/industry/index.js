"use strict";

const express = require("express");
const IndustryController = require("../../../controller/industry.controller");
const asyncHandler = require("../../../helpers/asyncHandler");
const { authentication } = require("../../../auth/auth.middlewares");

const industryRouter = express.Router();

industryRouter.get("/", asyncHandler(IndustryController.getAll));

industryRouter.use(authentication);

industryRouter.post("/", asyncHandler(IndustryController.createIndustry));
industryRouter.delete("/:industryId", asyncHandler(IndustryController.deleteIndustry));
industryRouter.patch("/:industryId", asyncHandler(IndustryController.updateIndustry));
industryRouter.patch("/:industryId/usedCount", asyncHandler(IndustryController.increaseUsedCount));

module.exports = industryRouter;
