import type { Socket, TCPSocket } from "bun";
import { ClientConfiguration } from "./config/config";
import { MessageService } from "./client-message";
import LoggerService from "./utils/logger-service";
import { AuthenticationService } from "./authentication/authentication-service";
import { EventEmitter } from "events";

export class DatabaseClient extends EventEmitter {
  private socket!: TCPSocket;
  private authService: AuthenticationService;
  private messageService: MessageService;
  

  constructor() {
    super();
    this.authService = new AuthenticationService(this);
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
             const authPayload = JSON.stringify({ username: "testuser", password: "password123" });
             LoggerService.info(`Sending authentication request: ${authPayload}`);
       
             const { username, password } = JSON.parse(authPayload);
             this.authService.login(socket, username, password);  
       
             resolve();
            },
            data: (socket: Socket, data: Buffer) => {
              const message = this.messageService.receive(data);
              LoggerService.info(`Received data from server: ${message}`);
              this.emit("server-message", socket, message);
            
            },
            close: () => {
              LoggerService.error("Connection closed");
              this.emit("disconnected");
              reject(new Error("Connection closed unexpectedly"));
            },
            error: (socket, error) => {
              LoggerService.error(`Error occurred: ${error.message}`);
              this.emit("error", error);
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