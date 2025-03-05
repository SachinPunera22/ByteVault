import { ClientEvents, EventState } from "../constants";
import { systemEventService } from "../events/systemEvent.service";
import { MessageService } from "../message.service";
import LoggerService from "./logger-service";

export class ClientCliService {
  private static instance: ClientCliService | null = null;
  private messageService: MessageService;

  private constructor() {
    this.messageService = MessageService.getInstance();
  }

  public static getInstance(): ClientCliService {
    if (!ClientCliService.instance) {
      ClientCliService.instance = new ClientCliService();
    }
    return ClientCliService.instance;
  }

  public startListening() {
    process.stdin.on("data", (input: Buffer) => {
      let msg = input.toString().trim().toLowerCase();
      if (this.messageService.eventState === EventState.INACTIVE)
        this.clientEvents(msg);
    });
  }

  public async clientEvents(event: string) {
    if (ClientEvents.includes(event)) {
      systemEventService.emit(event);
    } else {
      LoggerService.error(`Invalid Command`);
    }
  }
}
