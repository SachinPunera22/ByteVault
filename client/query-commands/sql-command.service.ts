import {
  ClientCommands,
  ServerCommands,
  StatusCode,
  type EventConfigurationInterface,
} from "../constants.ts";
import { systemEventService } from "../events/systemEvent.service.ts";
import { MessageService } from "../message.service.ts";
import LoggerService from "../utils/logger-service.ts";
import type { Socket } from "bun";

export enum QueryStatus {
  IDLE = "idle",
  PROCESSING = "processing",
  SUCCESS = "success",
  FAILED = "failed",
}

export class SqlCommandService {
  private messageService: MessageService;
  private socket: Socket;
  private timeoutHandle: ReturnType<typeof setTimeout> | null = null;
  public queryStatus: QueryStatus = QueryStatus.IDLE;

  constructor(socket: Socket) {
    this.messageService = MessageService.getInstance();
    this.socket = socket;
    this.setupListener();
  }

  /**
   * Sends SQL query to the server
   */
  public sendQuery(query: string) {
    if (!query.trim()) {
      LoggerService.error("Empty query. Please enter a valid SQL command.");
      return;
    }

    this.messageService.send(
      {
        command: ClientCommands.QUERY_EXECUTION,
        message: Buffer.from(query.trim()),
      },
      this.socket
    );
    this.queryStatus = QueryStatus.PROCESSING;
    this.timeoutHandle = setTimeout(() => {
      if (this.queryStatus === QueryStatus.PROCESSING) {
        LoggerService.error("Query execution timeout. Closing connection.");
      }
    }, 3000);
  }

  public async setupListener() {
    systemEventService.on(ClientCommands.QUERY_EXECUTION, (query: string) => {
      this.sendQuery(query);
    });
    systemEventService.on(
      ServerCommands.QUERY_EXECUTION_RESPONSE,
      ({ data, code }) => {
        if (this.timeoutHandle) {
          clearTimeout(this.timeoutHandle);
          this.timeoutHandle = null;
        }

        if (code.toString() === StatusCode.ERROR) {
          this.queryStatus = QueryStatus.FAILED;
          LoggerService.error(`Query Failed: ${data.toString()}`);
        } else {
          this.queryStatus = QueryStatus.SUCCESS;
          LoggerService.success(`Query Success: ${data.toString()}`);
        }

        this.queryStatus = QueryStatus.IDLE;
      }
    );
  }
}
