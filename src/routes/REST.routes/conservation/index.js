"use strict";

const express = require("express");
const asyncHandler = require("../../../helpers/asyncHandler");
const { authentication } = require("../../../auth/auth.middlewares");
const ConservationController = require("../../../controller/conservation.controller");
const { restrictToGroupRole } = require("../../../middlewares/role.middleware");

const conservationRouter = express.Router();

conservationRouter.get(
  "/publish/all",
  asyncHandler(ConservationController.getAllPublicConservations)
);
conservationRouter.get(
  "/private/all",
  asyncHandler(ConservationController.getAllPrivateConservations)
);
conservationRouter.get(
  "/search/:keyword",
  asyncHandler(ConservationController.searchConservations)
);
conservationRouter.get(
  "/:conservationId",
  asyncHandler(ConservationController.getConservationById)
);

conservationRouter.use(authentication);

conservationRouter.get(
  "/joined/all",
  asyncHandler(ConservationController.getAllJoinedConservations)
);
conservationRouter.patch(
  "/:conservationId/join",
  asyncHandler(ConservationController.joinExistingConservation)
);
conservationRouter.patch(
  "/:conservationId/leave",
  asyncHandler(ConservationController.leaveExistingConservation)
);
conservationRouter.patch(
  "/:conservationId",
  asyncHandler(ConservationController.updateConservation)
);
conservationRouter.post("", asyncHandler(ConservationController.createConservation));

// host route
conservationRouter.delete(
  "/:conservationId",
  restrictToGroupRole("HOST"),
  asyncHandler(ConservationController.deleteExistingConservation)
);

module.exports = conservationRouter;
