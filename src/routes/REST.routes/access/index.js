"use strict";

const express = require("express");
const AccessController = require("../../../controller/access.controller");
const asyncHandler = require("../../../helpers/asyncHandler");
const { authentication } = require("../../../auth/auth.middlewares");

const accessRouter = express.Router();

accessRouter.post("/signup", asyncHandler(AccessController.signup));
accessRouter.post("/login", asyncHandler(AccessController.login));
accessRouter.use(authentication);
accessRouter.post("/refresh", asyncHandler(AccessController.refreshTheToken));
accessRouter.post("/logout", asyncHandler(AccessController.logout));

module.exports = accessRouter;
