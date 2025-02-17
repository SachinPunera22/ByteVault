import type { Socket } from "bun";
import { MessageService } from "../client-message";
import LoggerService from "../utils/logger-service";

export class AuthenticationService {
  private messageService: MessageService;

  constructor() {
    this.messageService = new MessageService();
  }

  /**
   * Sends login credentials to the server
   */
  public login(socket: Socket, username: string, password: string) {
    const loginData = JSON.stringify({ username, password });
    LoggerService.info(`Sending authentication request for ${username}`);
    this.messageService.send(Buffer.from(loginData), socket);
  }

}
