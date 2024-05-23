"use strict";

const { AuthFailureError, NotFoundError, BadRequestError } = require("../core/error.response");
const asyncHandler = require("../helpers/asyncHandler");
const KeyTokenService = require("../services/keyToken.service");
const JWT = require("jsonwebtoken");

const HEADERS = {
  AUTHORIZATION: "authorization",
  CLIENT_ID: "x-client-id",
  REFRESHTOKEN: "refreshtoken",
};

const authentication = asyncHandler(async (req, res, next) => {
  const clientId = req.headers[HEADERS.CLIENT_ID];
  if (!clientId) throw new AuthFailureError("Invalid request");

  const storedKey = await KeyTokenService.findByUserId(clientId);
  if (!storedKey) throw new NotFoundError("You are not logged in");

  const accessToken = req.headers[HEADERS.AUTHORIZATION];
  if (!accessToken) throw new AuthFailureError("Invalid request");

  if (req.headers[HEADERS.REFRESHTOKEN]) {
    const refreshToken = req.headers[HEADERS.REFRESHTOKEN];
    let decodedRefreshToken = JWT.verify(refreshToken, storedKey.publicKey);

    req.storedKey = storedKey;
    req.user = decodedRefreshToken;
    req.refreshToken = refreshToken;

    return next();
  }

  const decoded = JWT.verify(accessToken, storedKey.publicKey);

  if (decoded.userId !== clientId) {
    throw new AuthFailureError("Invalid token");
  }

  req.storedKey = storedKey;
  req.user = decoded;

  return next();
});

module.exports = {
  authentication,
};
