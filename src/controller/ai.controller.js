"use strict";

const { SuccessResponse, Created } = require("../core/success.response");
const AIService = require("../services/ai.service");

class AIController {
  chat = async (req, res, next) => {
    new SuccessResponse({
      message: "Chat successfully",
      metadata: await AIService.chat(req.query),
    }).send(res);
  };

  translate = async (req, res, next) => {
    new SuccessResponse({
      message: "Translate successfully",
      metadata: await AIService.translate(req.query),
    }).send(res);
  };
}

module.exports = new AIController();
