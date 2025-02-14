import type { Socket, TCPSocket } from "bun";
import { ClientConfiguration } from "./config/config";
import { MessageService } from "./client-message";

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

      const messageService = new MessageService();

      this.socket = await Bun.connect({
        hostname,
        port,
        socket: {
          open: (socket: Socket) => {
            console.log(`Client connected to ${hostname}:${port}`);
            messageService.send(Buffer.from("PING"), socket);
          },
          data: (socket: Socket, data: Buffer) => {
            const message = messageService.receive(data);
            console.log("Received data from server:", message);
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
