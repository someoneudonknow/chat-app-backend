"use strict";

const mongoose = require("mongoose");
const {
  db: { host, port, name },
} = require("../config/config.app");
const { countConnection } = require("../helpers/connection.check");

const CONNECTION_STRING = `mongodb://${host}:${port}/${name}`;

class Database {
  static instance;

  constructor() {}

  connect = (type = "mongodb") => {
    if (type === "mongodb") {
      mongoose.set("debug", false);
      mongoose.set("debug", { color: false });
      mongoose
        .connect(CONNECTION_STRING, {
          maxPoolSize: 50,
        })
        .then(() => {
          console.log("Connected to database::" + CONNECTION_STRING);
          countConnection();
        })
        .catch((err) => {
          console.log("Error connecting to database: \n" + err);
        });
    }
  };

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }

    return Database.instance;
  }
}

const dbInstance = Database.getInstance();

module.exports = dbInstance;
