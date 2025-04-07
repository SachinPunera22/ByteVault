import type { Socket } from "bun";
import { SqlCommandService } from "../query-commands/sql-command.service";
import { ClientCommands, ClientEvents, EventState } from "../constants";
import { systemEventService } from "../events/systemEvent.service";
import { MessageService } from "../message.service";
import LoggerService from "./logger-service";

export class ClientCliService {
  private static instance: ClientCliService | null = null;
  private messageService: MessageService;
  private sqlCommandService: SqlCommandService | null = null;

  private constructor() {
    this.messageService = MessageService.getInstance();
  }

  public static getInstance(): ClientCliService {
    if (!ClientCliService.instance) {
      ClientCliService.instance = new ClientCliService();
    }
    return ClientCliService.instance;
  }

  /**
   * Initialize with socket and SQL command service
   */
  public initialize(socket: Socket) {
    this.sqlCommandService = new SqlCommandService(socket);
  }

  /**
   * Start listening for user input
   */
  public startListening() {
    // LoggerService.info("Enter your query:");
    process.stdin.on("data", (input: Buffer) => {
      const message = input.toString().trim();
      this.clientEvents(message);
    });
  }

  /**
   * Handles client input events
   */
  public clientEvents(message: string) {
    if (!this.sqlCommandService) {
      LoggerService.error("SQL Command Service is not initialized.");
      return;
    }

    systemEventService.emit(ClientCommands.QUERY_EXECUTION, message);
  }

  /**
   * Handle server responses
   */
  public handleServerResponse(socket: Socket, rawPayload: Buffer) {
    const payload = rawPayload.toString("utf-8").trim();
    this.messageService.receive(socket, rawPayload);
  }
}
