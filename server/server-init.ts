import type { TCPSocketListener } from "bun";

export class DatabaseServer {
  public server!: TCPSocketListener;
  constructor() {}

  /**
   * starts a server
   * @returns
   */
  public async startServer(): Promise<TCPSocketListener> {
    this.server = Bun.listen({
      hostname: "localhost",
      port: 4000,
      socket: {
        data(socket, data) {
          const input = data.toString().trim();
          console.log(`Received data: ${input}`);
        },
        open(socket) {
          console.log("Client connected");
          socket.write("Connected to the server");
        },
        close(socket) {
          console.log("Connection closed");
        },
        error(socket, error) {
          console.error("Error occurred:", error);
          socket.write(`Error occurred: ${error.message}`);
        },
      },
    });
    return this.server;
  }
}
