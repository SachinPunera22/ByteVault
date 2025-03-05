import { ClientSocketService } from "./socket.service.ts";
import { MessageService } from "../message.service.ts";
import { systemEventService } from "../events/systemEvent.service.ts";
import LoggerService from "./logger-service.ts";
import { ClientCommands, ServerCommands } from "../constants.ts";
import { AuthenticationService } from "../authentication/authentication-service.ts";

export class HealthService {
  private socketService: ClientSocketService;
  private messageService:MessageService;

  constructor() {
    this.messageService = MessageService.getInstance()
    this.socketService = ClientSocketService.getInstance();
    this.setupListener();
  }

  public checkConnection() {
    return this.messageService.send(
      { command: ClientCommands.PING, message: Buffer.from("ping") },
      this.socketService.getClientSocket(),
      { maxRetries: 2 }
    );
  }

  public async setupListener() {
    systemEventService.on("ping", () => this.checkConnection());
    systemEventService.on(ServerCommands.PONG, () => {
      LoggerService.success("pong");
      const authenticationService = AuthenticationService.getInstance()      
          authenticationService.initAuth();
    });
  }
}
