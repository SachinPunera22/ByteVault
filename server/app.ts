const server = Bun.listen({
  hostname: "localhost",
  port: 4000,
  socket: {
    data(socket, data) {
      const input = data.toString().trim();
    },
    open(socket) {
      console.log("Client connected");
      socket.write("Connected to the server");
    },
    close(socket) {
      console.log("Connection closed");
    },
    error(socket, error) {
      console.log("error occured", error);
      socket.write(`error occured ${error.message}`);
    },
  },
});
console.log("Server running on port:", server.port);
