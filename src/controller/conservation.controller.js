"use strict";

const { Created, SuccessResponse } = require("../core/success.response");
const ConservationService = require("../services/conservation.service");

class ConservationController {
  getConservationById = async (req, res, next) => {
    new SuccessResponse({
      message: "Get conservation successfully",
      metadata: await ConservationService.getConservationById({
        conservationId: req.params.conservationId,
      }),
    }).send(res);
  };

  searchConservations = async (req, res, next) => {
    new SuccessResponse({
      message: "Get conservations successfully",
      metadata: await ConservationService.searchConsevations({
        keyword: req.params.keyword,
        query: req.query,
      }),
    }).send(res);
  };

  updateConservation = async (req, res, next) => {
    new SuccessResponse({
      message: "Your conservation has been updated",
      metadata: await ConservationService.updateConservation({
        bodyUpdate: req.body,
        conservationId: req.params.conservationId,
      }),
    }).send(res);
  };

  createConservation = async (req, res, next) => {
    new Created({
      message: "Your conservation has been created",
      metadata: await ConservationService.createConservation(req.body.type, {
        ...req.body,
        creator: req.user.userId,
      }),
    }).send(res);
  };

  getAllPublicConservations = async (req, res, next) => {
    new SuccessResponse({
      message: "Get conservations successfully!",
      metadata: await ConservationService.getAllPublicConservations({ query: req.query }),
    }).send(res);
  };

  getAllPrivateConservations = async (req, res, next) => {
    new SuccessResponse({
      message: "Get conservations successfully!",
      metadata: await ConservationService.getAllPrivateConservations({ query: req.query }),
    }).send(res);
  };

  joinExistingConservation = async (req, res, next) => {
    new SuccessResponse({
      message: "Successfully joined",
      metadata: await ConservationService.joinExistingConservation({
        userId: req.user.userId,
        conservationId: req.params.conservationId,
      }),
    }).send(res);
  };

  leaveExistingConservation = async (req, res, next) => {
    new SuccessResponse({
      message: "Successfully leave",
      metadata: await ConservationService.leaveExistingConservation({
        userId: req.user.userId,
        conservationId: req.params.conservationId,
      }),
    }).send(res);
  };

  deleteExistingConservation = async (req, res, next) => {
    new SuccessResponse({
      message: "Successfully deleted",
      metadata: await ConservationService.deleteExistingConservation(req.params.conservationId),
    }).send(res);
  };

  getAllJoinedConservations = async (req, res, next) => {
    new SuccessResponse({
      message: "Get conservations successfully!",
      metadata: await ConservationService.getAllJoinedConservations({
        userId: req.user.userId,
        query: req.query,
      }),
    }).send(res);
  };
}

module.exports = new ConservationController();
