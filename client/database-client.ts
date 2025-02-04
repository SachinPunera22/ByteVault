import type { TCPSocket } from "bun";
import { ClientConfiguration } from "./config/config";

export class DatabaseClient {
  private socket!: TCPSocket;

  constructor() {}

  /**
   * Starts the client connection to the server
   * @returns {Promise<void>}
   */
  public async connectToServer(): Promise<void> {
    try {
      const config = new ClientConfiguration();
      await config.readConfig(); // Load configuration file

      const hostname: string = config.get("hostname", "localhost");
      const port: number = Number(config.get("port", "4000"));

      this.socket = await Bun.connect({
        hostname,
        port,
        socket: {
          open: () => {
            console.log(`Client connected to ${hostname}:${port}`);
          },
          data: (socket, data) => {
            console.log("Received data from server:", data.toString());
          },
          close: () => {
            console.log("Connection closed");
          },
          error: (socket, error) => {
            console.error("Error occurred:", error);
          },
        },
      });

      console.log("Client connection established successfully.");
    } catch (error) {
      console.error("Failed to connect to server:", error);
    }
  }
}
