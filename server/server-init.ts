import type { TCPSocketListener } from "bun";
import { ServerConfiguration } from "./config/config";

export class DatabaseServer {
  public server!: TCPSocketListener;
  constructor() {}

  /**
   * starts a server
   * @returns
   */
  public async startServer(): Promise<TCPSocketListener> {
    const config = new ServerConfiguration();
    await config.readConfig();

    this.server = Bun.listen({
      hostname: config.get("hostname", "localhost"),
      port: +(config.get("port", "4000")),
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
