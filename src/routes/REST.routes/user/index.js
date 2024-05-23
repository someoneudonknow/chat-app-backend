"use strict";

const express = require("express");
const UserController = require("../../../controller/user.controller");
const asyncHandler = require("../../../helpers/asyncHandler");
const { authentication } = require("../../../auth/auth.middlewares");

const userRouter = express.Router();

userRouter.post("/forgotPassword", asyncHandler(UserController.forgotPassword));
userRouter.patch("/resetPassword", asyncHandler(UserController.resetPassword));
userRouter.get("/search/:keySearch", asyncHandler(UserController.searchUsers));

userRouter.use(authentication);

userRouter.get("/recommended", asyncHandler(UserController.getContactRecommendations));
userRouter.get("/contacts/:keySearch", asyncHandler(UserController.searchContacts));
userRouter.get("/conservations/:keySearch", asyncHandler(UserController.searchConservations));
userRouter.get("/discover/:userId", asyncHandler(UserController.discoverUser));
userRouter.get("/contacts", asyncHandler(UserController.getMeContactInfo));
userRouter.patch(
  "/profile/profileCompletion",
  asyncHandler(UserController.increaseProfileCompletionStep)
);
userRouter.post("/profile/interests", asyncHandler(UserController.addInterests));
userRouter.delete("/profile/interests", asyncHandler(UserController.removeInterest));
userRouter.get("/profile", asyncHandler(UserController.getMeInfo));
userRouter.patch("/profile", asyncHandler(UserController.updateMe));

module.exports = userRouter;
