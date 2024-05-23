"use strict";

const { ReasonPhrases, StatusCodes } = require("../utils/httpStatusCode");

module.exports = (err, req, res, next) => {
  const status = err?.status || StatusCodes.INTERNAL_SERVER_ERROR;

  return res.status(status).json({
    status: "error",
    code: status,
    message: err.message || ReasonPhrases.INTERNAL_SERVER_ERROR,
    stackTrace: err.stack,
  });
};
