"use strict";

const { SuccessResponse, Created } = require("../core/success.response");
const IndustryService = require("../services/industry.service");

class IndustryController {
  createIndustry = async (req, res, next) => {
    new Created({
      message: "Create industry successfully",
      metadata: await IndustryService.createIndustry({ body: req.body }),
    }).send(res);
  };

  updateIndustry = async (req, res, next) => {
    new SuccessResponse({
      message: "Update industry successfully",
      metadata: await IndustryService.updateIndustry({ id: req.params.industryId, body: req.body }),
    }).send(res);
  };

  deleteIndustry = async (req, res, next) => {
    new SuccessResponse({
      message: "Delete industry successfully",
      metadata: await IndustryService.deleteIndustry({ id: req.params.industryId }),
    }).send(res);
  };

  increaseUsedCount = async (req, res, next) => {
    new SuccessResponse({
      message: "Increase used count successfully",
      metadata: await IndustryService.increaseUsedCount({ id: req.params.industryId }),
    }).send(res);
  };

  getAll = async (req, res, next) => {
    new SuccessResponse({
      message: "Get all industries successfully",
      metadata: await IndustryService.getAll(),
    }).send(res);
  };
}

module.exports = new IndustryController();
