"use strict";

require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const path = require("path");
const compression = require("compression");
const db = require("./db/init.mongodb");
require("./db/init.redis").init();
const cors = require("cors");
const { NotFoundError } = require("./core/error.response");
const errorController = require("./controller/error.controller");
const appRoutes = require("./routes/REST.routes/index");
const { origin } = require("./config/config.app");

const app = express();

// init middlewares
app.use(
  cors({
    origin,
  })
);
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "50mb" }));
app.use(
  express.urlencoded({
    limit: "50mb",
    extended: true,
  })
);

// connect to databases
db.connect();

// init routes
app.use("/", appRoutes);

// error handler
app.use(errorController);

app.all("*", (req, res, next) => {
  const err = new NotFoundError(`Can not find ${req.originalUrl} on this server`);
  next(err);
});

module.exports = app;
