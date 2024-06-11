"use strict";

const { ReasonPhrases, StatusCodes } = require("../utils/httpStatusCode");

class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.status = statusCode;
  }
}

class ConflictError extends ErrorResponse {
  constructor(message = ReasonPhrases.CONFLICT, statusCode = StatusCodes.CONFLICT) {
    super(message, statusCode);
  }
}

class NotFoundError extends ErrorResponse {
  constructor(message = ReasonPhrases.NOT_FOUND, statusCode = StatusCodes.NOT_FOUND) {
    super(message, statusCode);
  }
}

class BadRequestError extends ErrorResponse {
  constructor(message = ReasonPhrases.BAD_REQUEST, statusCode = StatusCodes.BAD_REQUEST) {
    super(message, statusCode);
  }
}

class AuthFailureError extends ErrorResponse {
  constructor(message = ReasonPhrases.UNAUTHORIZED, statusCode = StatusCodes.UNAUTHORIZED) {
    super(message, statusCode);
  }
}

class ForbiddenError extends ErrorResponse {
  constructor(message = ReasonPhrases.FORBIDDEN, statusCode = StatusCodes.FORBIDDEN) {
    super(message, statusCode);
  }
}

class NotAcceptableError extends ErrorResponse {
  constructor(message = ReasonPhrases.NOT_ACCEPTABLE, statusCode = StatusCodes.NOT_ACCEPTABLE) {
    super(message, statusCode);
  }
}

class InternalServerError extends ErrorResponse {
  constructor(
    message = ReasonPhrases.INTERNAL_SERVER_ERROR,
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR
  ) {
    super(message, statusCode);
  }
}

class RedisError extends ErrorResponse {
  constructor(
    message = ReasonPhrases.INTERNAL_SERVER_ERROR,
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR
  ) {
    super(message, statusCode);
  }
}

class NotModifiedError extends ErrorResponse {
  constructor(message = ReasonPhrases.NOT_MODIFIED, statusCode = StatusCodes.NOT_MODIFIED) {
    super(message, statusCode);
  }
}

class NotImplementedError extends ErrorResponse {
  constructor(message = ReasonPhrases.NOT_IMPLEMENTED, statusCode = StatusCodes.NOT_IMPLEMENTED) {
    super(message, statusCode);
  }
}

module.exports = {
  NotImplementedError,
  NotModifiedError,
  InternalServerError,
  RedisError,
  ErrorResponse,
  NotFoundError,
  ConflictError,
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
  NotAcceptableError,
};
