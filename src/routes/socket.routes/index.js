const conservationRoute = require("./conservation");
const connectionRoute = require("./connections");
const callRoute = require("./calls");

module.exports = (socket) => {
  connectionRoute(socket);
  conservationRoute(socket);
  callRoute(socket);
};
