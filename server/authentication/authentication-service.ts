import type { Socket } from "bun";
import LoggerService from "../utils/logger-service";
import { MessageService } from "../message.service";
import { systemEventService } from "../events/systemEvent.service.ts";
import { SocketService } from "../utils/socket.service.ts";// Import Singleton SocketService

export class AuthenticationService {
  private socketService: SocketService; // Store the SocketService instance

  constructor(private messageService: MessageService) {
    this.socketService = SocketService.getInstance(); // Get singleton instance
  }

  /**
   * Handles authentication request from client
   */
  public handleAuthRequest(auth: { data: Buffer; socket: Socket }) {
    try {
      LoggerService.info("Checking auth...");

      this.messageService.send(
        { command: "auth-res", code: "SUCCESS", message: Buffer.from("OK") },
        auth.socket
      );

      LoggerService.info("Auth Success...");
    } catch (error) {
      LoggerService.error("Invalid authentication data");

      this.messageService.send(
        {
          command: "auth",
          code: "ERROR",
          message: Buffer.from("ERR: Invalid authentication data"),
        },
        auth.socket
      );

      auth.socket.end();
    }
  }

  /**
   * Registers event listeners for managing authentication state
   */
  public initAuth() {
    LoggerService.info("Initializing authentication...");

    systemEventService.on("auth-init", (data: any) => {
      this.handleAuthRequest(data);
    });
  }
}
