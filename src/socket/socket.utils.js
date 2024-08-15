"use-strict";

const middlewareWrapper = (middleware) => (socket, next) => middleware(socket.request, {}, next);

const socketErrorHandler = function (socketCb) {
  return (payload) => {
    socketCb.call(this, payload).catch((error) => {
      console.error(error);
      this.emit("exception", error);
    });
  };
};

module.exports = {
  middlewareWrapper,
  socketErrorHandler,
};
