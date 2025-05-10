"use strict";

process.on("uncaughtException", (e) => {
  console.log("Uncaught exception::" + e);
  console.log("Process is exiting");
  process.exit(1);
});

const http = require("http");
const app = require("./src/app");
const {
  app: { port },
  origin,
} = require("./src/config/config.app");

const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: `${origin}`,
  },
  debug: true,
});

const ConservationAssistant = require("./src/services/aiAssistant/conservation.assistant");

const EventEmitter = require("events");
const internalEvents = new EventEmitter();
internalEvents.setMaxListeners(50);

internalEvents.on("process:ai:message", async (data) => {
  try {
    const { message, conservationId } = data;
    console.log("Processing AI message for conservation:", conservationId);

    const aiResponse = await ConservationAssistant.processMessage(message, conservationId);

    if (aiResponse) {
      console.log("AI Assistant responded to message:", aiResponse._id);
    }
  } catch (error) {
    console.error("Error processing AI message:", error);
  }
});

global._internalEvents = internalEvents;

const serverInstance = server.listen(port, () => {
  console.log("App start with port::" + port);
});

require("./src/socket/index")(io);

global._io = io;

process.on("unhandledRejection", (e) => {
  console.log("Unhandled rejection::" + e);
  console.log("Server is shutting down");

  serverInstance.close(() => {
    process.exit(1);
  });
});

process.on("SIGINT", () => {
  console.log("Ctrl c deteted app is closing");

  serverInstance.close(() => {
    console.log("Server closed");
  });
});

module.exports = server;
