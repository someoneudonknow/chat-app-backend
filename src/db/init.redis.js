"use strict";

const redis = require("redis");
const { RedisError } = require("../core/error.response");
const {
  redis: { port, host, password, username },
} = require("../config/config.app");

const connectionStatus = {
  CONNECT: "connect",
  END: "end",
  RECONNECT: "reconnecting",
  ERROR: "error",
};
const REDIS_CONNECT_TIMEOUT = 10000; // 10 milliseconds
const REDIS_CONNECT_TIMEOUT_MESSAGE = {
  code: -99,
  message: {
    vn: "Redis lỗi rồi ae ơi!!!",
    en: "Redis connection error",
  },
};

class RedisClient {
  redisClientInstance = null;
  #connectTimeout = null;

  constructor() {}

  init() {
    this.redisClientInstance = redis.createClient({
      // password: password,
      socket: {
        host: host,
        port: port,
        reconnectStrategy: function (retries) {
          if (retries > 20) {
            console.log("Too many attempts to reconnect. Redis connection was terminated");
            return new Error("Too many retries.");
          } else {
            return retries * 500;
          }
        },
      },
    });
    this.handleConnectionEvents();
    this.redisClientInstance.connect();
  }

  getClient() {
    return this.redisClientInstance;
  }

  closeConnection() {
    console.log("Closing redis connection...");
    this.redisClientInstance.quit();
  }

  handleConnectionEvents() {
    if (this.redisClientInstance == null) {
      throw new Error("Connection is not established");
    }

    this.redisClientInstance.on(connectionStatus.CONNECT, () => {
      console.log(`Connection established - Connection status: ${connectionStatus.CONNECT}`);

      if (this.#connectTimeout) {
        clearTimeout(this.#connectTimeout);
      }
    });

    this.redisClientInstance.on(connectionStatus.ERROR, (err) => {
      if (process.env.NODE_ENV !== "production") {
        console.error(err);
      }
      console.log(`Connection error - Connection status: ${connectionStatus.ERROR}`);
      this.handleTimeoutErrors();
    });

    this.redisClientInstance.on(connectionStatus.END, () => {
      console.log(`Connection end - Connection status: ${connectionStatus.END}`);
      this.handleTimeoutErrors();
    });

    this.redisClientInstance.on(connectionStatus.RECONNECT, () => {
      console.log(`Reconnecting connection - Connection status: ${connectionStatus.RECONNECT}`);

      if (this.#connectTimeout) {
        clearTimeout(this.#connectTimeout);
      }
    });
  }

  handleTimeoutErrors() {
    this.#connectTimeout = setTimeout(() => {
      throw new RedisError(
        REDIS_CONNECT_TIMEOUT_MESSAGE.message.vn,
        REDIS_CONNECT_TIMEOUT_MESSAGE.code
      );
    }, REDIS_CONNECT_TIMEOUT);
  }
}

const redisClient = new RedisClient();

module.exports = redisClient;
