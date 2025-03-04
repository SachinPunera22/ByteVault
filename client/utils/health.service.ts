import { ClientSocketService } from "./socket.service.ts";
import type { MessageService } from "../message.service.ts";
import { systemEventService } from "../events/systemEvent.service.ts";
import LoggerService from "./logger-service.ts";
import { ClientCommands, ServerCommands } from "../constants.ts";

export class HealthService {
  private socketService: ClientSocketService;

  constructor(protected messageService: MessageService) {
    this.socketService = ClientSocketService.getInstance();
    this.setupListener();
  }

  public checkConnection() {
    return this.messageService.send(
      { command: ClientCommands.PING, message: Buffer.from("ping") },
      this.socketService.getClientSocket(), // Use singleton socket
      2,
      true
    );
  }

  public async setupListener() {
    systemEventService.on("ping", () => this.checkConnection());
    systemEventService.on(ServerCommands.PONG, () => {
      LoggerService.success("pong");
    });
  }
}
