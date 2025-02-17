import type { Socket } from "bun";
import LoggerService from "../utils/logger-service";
import { MessageService } from "../sever-message";

export class AuthenticationService {
  private messageService: MessageService;

  constructor() {
    this.messageService = new MessageService();
  }

 
  /**
   * Handles authentication request from client
   */
  public handleAuthRequest(socket: Socket, data: Buffer) {
    try {
      const message = this.messageService.receive(data);
      const { username, password } = JSON.parse(message);

      if (!username || !password) {
        LoggerService.error("Missing username or password");
        this.messageService.send(Buffer.from("ERR: Missing username or password"), socket);
        return;
      }

      LoggerService.success(`Authentication request received - Username: ${username}`);
      this.messageService.send(Buffer.from("OK"), socket);
    } catch (error) {
      LoggerService.error("Invalid authentication data");
      this.messageService.send(Buffer.from("ERR: Invalid authentication data"), socket);
    }
  }
}
