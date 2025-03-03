import { ClientSocketService } from "../utils/socket.service";
import { MessageService } from "../message.service.ts";
import LoggerService from "../utils/logger-service";
import { EventEmitter } from "events";
import type { TCPSocket } from "bun";

export class AuthenticationService extends EventEmitter {
  private messageService: MessageService;
  private authStatus: "initiated" | "connected" = "initiated";
  private timeoutHandle: ReturnType<typeof setTimeout> | null = null;
  private socketService: ClientSocketService;
  private clientSocket: TCPSocket;

  constructor(eventEmitter: EventEmitter) {
    super();
    this.messageService = new MessageService();
    this.socketService = ClientSocketService.getInstance();
    this.clientSocket = this.socketService.getClientSocket(); 

    eventEmitter.on("server-message", (message: string) => {
      this.handleAuthResponse(message);
    });

    eventEmitter.on("disconnected", () => {
      LoggerService.error("Disconnected from the server.");
    });

    eventEmitter.on("error", (error: Error) => {
      LoggerService.error(`Error occurred: ${error.message}`);
    });
  }

  /**
   * Sends login credentials to the server
   */
  public login(username: string, password: string) {
    const loginData = JSON.stringify({ code: "auth-init", username, password });

    LoggerService.info(`Sending authentication request for ${username}`);
    this.messageService.send(
      { message: Buffer.from(loginData), command: "auth-res" },
      this.clientSocket
    );

    this.timeoutHandle = setTimeout(() => {
      if (this.authStatus === "initiated") {
        LoggerService.error("Authentication timeout. Closing connection.");
        this.clientSocket.end();
      }
    }, 30000);
  }

  /**
   * Handles server response for authentication
   */
  public handleAuthResponse(message: string) {
    if (message === "OK") {
      this.authStatus = "connected";
      if (this.timeoutHandle) clearTimeout(this.timeoutHandle);
      LoggerService.success("Authentication successful!");
      this.emit("authenticated");
    } else if (message.startsWith("ERR")) {
      LoggerService.error(`Authentication failed: ${message}`);
      this.emit("authentication-failed", message);
      this.clientSocket.end();
    }
  }
}
