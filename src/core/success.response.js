"use strict";

const { StatusCodes, ReasonPhrases } = require("../utils/httpStatusCode");

class SuccessResponse {
  constructor({ message, statusCode, metadata = {} }) {
    this.message = message || ReasonPhrases.OK;
    this.status = statusCode || StatusCodes.OK;
    this.metadata = metadata;
  }

  send(res) {
    res.status(this.status).json(this);
  }
}

class Ok extends SuccessResponse {
  constructor({ message, metadata = {} }) {
    super({ message, metadata });
  }
}

class Created extends SuccessResponse {
  constructor({
    message = ReasonPhrases.CREATED,
    statusCode = StatusCodes.CREATED,
    metadata = {},
  }) {
    super({ message, statusCode, metadata });
  }
}

module.exports = {
  SuccessResponse,
  Ok,
  Created,
};
