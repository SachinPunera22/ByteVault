import type { Socket, TCPSocketListener } from "bun";
import { ServerConfiguration } from "./config/config";
import { MessageService } from "./sever-message";
import LoggerService from "./utils/logger-service";
import { AuthenticationService } from "./authentication/authentication-service";

export class DatabaseServer {
  public server!: TCPSocketListener;
  private authService: AuthenticationService;
  private messageService: MessageService;

  constructor() {
    this.authService = new AuthenticationService();
    this.messageService = new MessageService();
  }

  /**
   * starts a server
   * @returns
   */
  public async startServer(): Promise<TCPSocketListener> {
    const config = new ServerConfiguration();
    await config.readConfig();
    const messageService = new MessageService();

    this.server = Bun.listen({
      hostname: config.get("hostname", "localhost"),
      port: +config.get("port", "4000"),
      socket: {
        data: (socket: Socket, data: Buffer) => {
          const message = this.messageService.receive(data);
          LoggerService.info(`Received data: ${message}`);

          if (message === "PING") {
            LoggerService.info("Received PING, sending PONG...");
            this.messageService.send(Buffer.from("PONG"), socket);
          } else {
            LoggerService.info("Handling authentication request...");
            this.authService.handleAuthRequest(socket, data);
          }
        },
        open(socket: Socket) {
          LoggerService.success("Client connected");
        },
        close(socket) {
          LoggerService.error("Connection closed");
        },
        error(socket, error) {
          LoggerService.error(`Error occurred: ${error.message}`);
          socket.write(`Error occurred: ${error.message}`);
        },
      },
    });
    return this.server;
  }
}