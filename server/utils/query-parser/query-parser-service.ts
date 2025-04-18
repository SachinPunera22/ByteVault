import type { Socket } from "bun";
import {
  ClientCommands,
  QueryTypes,
  QueryTypesEnum,
  StatusCode,
  type QueryResponseFormat,
} from "../../constants";
import { systemEventService } from "../../events/systemEvent.service";
import LoggerService from "../logger-service";
import { QueryValidationMapper } from "./query-parser-mapper-service";

export class QueryParserService {
  static instance: QueryParserService;
  constructor() {}

  public static getInstance(): QueryParserService {
    if (!QueryParserService.instance) {
      QueryParserService.instance = new QueryParserService();
    }
    return QueryParserService.instance;
  }

  public validateQuerySyntax(query: {
    data: Buffer;
    socket: Socket;
  }): QueryResponseFormat {
    const requestQuery = query.data.toString();
    const prefix = requestQuery.split(" ")[0].toUpperCase() as QueryTypesEnum;
    if (!QueryTypes.includes(prefix)) {
      LoggerService.error(
        `Invalid SQL syntax near ${requestQuery.split(" ")[0]}`
      );
      return {
        status: StatusCode.ERROR,
        message: `Invalid SQL syntax near ${requestQuery.split(" ")[0]}`,
      };
    }
    const handler = QueryValidationMapper[prefix];
    if (!handler) {
      LoggerService.error(`No handler found for prefix: ${prefix}`);
      return {
        status: StatusCode.ERROR,
        message: `Invalid SQL syntax near ${requestQuery.split(" ")[0]}`,
      };
    }
    return handler.validate(query);
  }
}
