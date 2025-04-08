import type { Socket } from "bun";
import { ServerConfiguration } from "../config/config";
import {
  ClientCommands,
  ServerCommands,
  StatusCode,
  type QueryResponseFormat,
} from "../constants";
import { MessageService } from "../message.service";
import { SocketService } from "../utils/socket.service";
import { systemEventService } from "../events/systemEvent.service";
import LoggerService from "../utils/logger-service";
import { QueryParserService } from "../utils/query-parser/query-parser-service";
import { QueryExecuterService } from "../database_operations/execute-query.service";

export class SqlCommandsService {
  private messageService: MessageService;
  private socketService: SocketService;
  private config: ServerConfiguration;
  private queryParser: QueryParserService;
  private queryExecuter: QueryExecuterService;

  constructor() {
    this.messageService = MessageService.getInstance();
    this.socketService = SocketService.getInstance();
    this.config = ServerConfiguration.getInstance();
    this.queryParser = QueryParserService.getInstance();
    this.queryExecuter = QueryExecuterService.getInstance();
    this.setupQueryListener();
  }
  public async executeQuery(query: Buffer, socket: Socket) {
    LoggerService.info(`Executing query: ${query}`);

    const result: QueryResponseFormat = this.queryParser.validateQuerySyntax({
      data: query,
      socket: socket,
    });
    if (result.status == StatusCode.SUCCESS) {
      const queryResult = await this.queryExecuter.executeQuery(result.data!);
      this.messageService.send(
        {
          command: ServerCommands.QUERY_RESPONSE,
          code: queryResult.status,
          message: Buffer.from(queryResult.message),
        },
        socket
      );
    } else if (result.status == StatusCode.ERROR) {
      this.messageService.send(
        {
          command: ServerCommands.QUERY_RESPONSE,
          code: result.status,
          message: Buffer.from(result.message),
        },
        socket
      );
    }
  }

  public setupQueryListener() {
    systemEventService.on(
      ClientCommands.QUERY_EXECUTION,
      (query: { data: Buffer; socket: Socket }) => {
        this.executeQuery(query.data, query.socket);
      }
    );
  }
}
