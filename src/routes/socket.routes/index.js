const conservationRoute = require("./conservation");

module.exports = (socket) => {
  conservationRoute(socket);
};
