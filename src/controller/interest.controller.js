"use strict";

const { SuccessResponse, Created } = require("../core/success.response");
const InterestService = require("../services/interest.service");

class InterestController {
  createInterest = async (req, res, next) => {
    new Created({
      message: "Create Interest successfully",
      metadata: await InterestService.createInterest({ body: req.body }),
    }).send(res);
  };

  updateInterest = async (req, res, next) => {
    new SuccessResponse({
      message: "Update Interest successfully",
      metadata: await InterestService.updateInterest({ id: req.params.interestId, body: req.body }),
    }).send(res);
  };

  deleteInterest = async (req, res, next) => {
    new SuccessResponse({
      message: "Delete Interest successfully",
      metadata: await InterestService.deleteInterest({ id: req.params.interestId }),
    }).send(res);
  };

  increaseUsedCount = async (req, res, next) => {
    new SuccessResponse({
      message: "Increase used count successfully",
      metadata: await InterestService.increaseUsedCount({ id: req.params.interestId }),
    }).send(res);
  };

  getAll = async (req, res, next) => {
    new SuccessResponse({
      message: "Get all interests successfully",
      metadata: await InterestService.getAll(),
    }).send(res);
  };

  searchInterests = async (req, res, next) => {
    new SuccessResponse({
      message: "Search interests successfully",
      metadata: await InterestService.searchInterests({
        keySearch: req.params.keySearch,
        query: req.query,
      }),
    }).send(res);
  };
}

module.exports = new InterestController();
