import { systemEventService } from "../events/systemEvent.service";
import LoggerService from "./logger-service";

export class ClientCliService {
  private static instance: ClientCliService | null = null;

  private constructor() {}

  public static getInstance(): ClientCliService {
    if (!ClientCliService.instance) {
      ClientCliService.instance = new ClientCliService();
    }
    return ClientCliService.instance;
  }

  public async clientEvents(event: string) {
    try {
      systemEventService.emit(event);
    } catch (error) {
      LoggerService.error(`Fail to get event: ${error}`);
    }
  }
}
