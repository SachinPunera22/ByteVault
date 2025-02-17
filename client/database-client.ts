import type { Socket, TCPSocket } from "bun";
import { ClientConfiguration } from "./config/config";
import { MessageService } from "./client-message";
import LoggerService from "./utils/logger-service";
import { AuthenticationService } from "./authentication/authentication-service";

export class DatabaseClient {
  private socket!: TCPSocket;
  private authService: AuthenticationService;
  private messageService: MessageService;

  constructor() {
    this.authService = new AuthenticationService();
    this.messageService = new MessageService();
  }

  /**
   * Starts the client connection to the server
   * @returns {Promise<void>}
   */
  public connectToServer(): Promise<void> {
    return new Promise(async (resolve, reject) => {
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
              LoggerService.success(`Client connected to ${hostname}:${port}`);
              messageService.send(Buffer.from("PING"), socket);
              resolve();
            },
            data: (socket: Socket, data: Buffer) => {
              const message = this.messageService.receive(data);
              LoggerService.info(`Received data from server: ${message}`);
              if (message === "PONG") {
                LoggerService.success("Server responded with PONG!");

                this.authService.login(socket, "testuser", "password123");
              } else if (message === "OK") {
                LoggerService.success("Authentication Successful");
              } else if (message.startsWith("ERR")) {
                LoggerService.error(`Authentication Failed: ${message}`);
              }
            
            },
            close: () => {
              LoggerService.error("Connection closed");
              reject(new Error("Connection closed unexpectedly"));
            },
            error: (socket, error) => {
              LoggerService.error(`Error occurred: ${error.message}`);
              reject(error);
            },
          },
        });
      } catch (error) {
        LoggerService.error(`Failed to connect to server: ${error}`);
        reject(error);
      }
    });
  }
}