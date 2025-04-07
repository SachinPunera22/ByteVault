import type { Socket } from "bun";
import { ServerConfiguration } from "../config/config";
import { ClientCommands, ServerCommands, StatusCode } from "../constants";
import { MessageService } from "../message.service";
import { SocketService } from "../utils/socket.service";
import { systemEventService } from "../events/systemEvent.service";
import LoggerService from "../utils/logger-service";

export class SqlCommandsService {
  private messageService: MessageService;
  private socketService: SocketService;
  private config: ServerConfiguration;

  constructor() {
    this.messageService = MessageService.getInstance();
    this.socketService = SocketService.getInstance();
    this.config = ServerConfiguration.getInstance();
    this.setupQueryListener();
  }
  public async executeQuery(query: string, socket: Socket) {
    LoggerService.info(`Executing query: ${query}`);
    this.messageService.send(
      {
        command: ServerCommands.QUERY_RESPONSE,
        code: StatusCode.SUCCESS,
        message: Buffer.from("Query executed successfully!"),
      },
      socket
    );
  }

  public setupQueryListener() {
    systemEventService.on(
      ClientCommands.QUERY_EXECUTION,
      (query: { data: Buffer; socket: Socket }) => {
        this.executeQuery(query.data.toString(), query.socket);
      }
    );
  }
}
