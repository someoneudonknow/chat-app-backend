const messageRoute = require("./message");

module.exports = (socket) => {
  socket.use((socket, next) => {
    try {
      socket[1].body = JSON.parse(socket[1].body);
    } catch (err) {
      next(new Error(err.message));
    }

    next();
  });

  messageRoute(socket);
};
