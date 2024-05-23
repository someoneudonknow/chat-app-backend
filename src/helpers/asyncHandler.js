"use strict";

const asyncHandler = (asyncCallback) => {
  return (req, res, next) => {
    asyncCallback(req, res, next).catch(next);
  };
};

module.exports = asyncHandler;
