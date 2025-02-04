import type { TCPSocket } from "bun";

export class DatabaseClient {
  private socket!: TCPSocket;

  constructor() {}

  /**
   * Starts the client connection to the server
   * @returns {Promise<void>}
   */
  public async connectToServer(): Promise<void> {
    try {
      this.socket = await Bun.connect({
        hostname: "localhost",
        port: 4000,
        socket: {
          open: () => {
            console.log("Client connected to server");
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


