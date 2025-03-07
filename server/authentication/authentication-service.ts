import type { Socket } from "bun";
import LoggerService from "../utils/logger-service";
import { MessageService } from "../message.service";
import { systemEventService } from "../events/systemEvent.service.ts";
import { SocketService } from "../utils/socket.service.ts"; // Import Singleton SocketService
import { ClientCommands, ServerCommands, StatusCode } from "../constants.ts";

export class AuthenticationService {
  private socketService: SocketService; // Store the SocketService instance
  private messageService: MessageService;
  static instance: AuthenticationService;

  constructor() {
    this.messageService = MessageService.getInstance();
    this.socketService = SocketService.getInstance(); // Get singleton instance
    this.setUpAuthenticationListener();
  }

  public static getInstance(): AuthenticationService {
    if (!AuthenticationService.instance) {
      AuthenticationService.instance = new AuthenticationService();
    }
    return AuthenticationService.instance;
  }

  /**
   * Handles authentication request from client
   */
  public handleAuthRequest(auth: { data: Buffer; socket: Socket }) {
    try {
      LoggerService.info("Checking auth...");

      this.messageService.send(
        {
          command: ServerCommands.AUTH_RESPONSE,
          code: StatusCode.SUCCESS,
          message: Buffer.from("OK"),
        },
        auth.socket
      );
      LoggerService.info("Auth Success...");
    } catch (error) {
      LoggerService.error("Invalid authentication data");
      this.messageService.send(
        {
          command: ServerCommands.AUTH_RESPONSE,
          code: StatusCode.ERROR,
          message: Buffer.from("ERR: Invalid authentication data"),
        },
        auth.socket
      );

      auth.socket.end();
    }
  }

  public setUpAuthenticationListener() {
    systemEventService.on(ClientCommands.AUTH_INIT, ({ data, socket }) => {
      this.handleAuthRequest({ data, socket });
    });
  }
}
