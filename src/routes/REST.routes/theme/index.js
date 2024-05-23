"use strict"

const express = require("express")
const ThemeController = require("../../../controller/theme.controller")
const asyncHandler = require("../../../helpers/asyncHandler")
const { authentication } = require("../../../auth/auth.middlewares")
const { restrictTo } = require("../../../middlewares/role.middleware")

const themeRouter = express.Router()

themeRouter.use(authentication)

// query
themeRouter.get("/all", asyncHandler(ThemeController.getUserThemes))
themeRouter.get("/published/all", asyncHandler(ThemeController.getPublishedThemes))

// create
themeRouter.post("", asyncHandler(ThemeController.createUserTheme))
themeRouter.post(
    "/published",
    restrictTo("ADMIN"),
    asyncHandler(ThemeController.createPublishedTheme)
)

// update
themeRouter
    .route("/:themeId")
    .patch(asyncHandler(ThemeController.updateTheme))
    .delete(asyncHandler(ThemeController.deleteTheme))

module.exports = themeRouter
