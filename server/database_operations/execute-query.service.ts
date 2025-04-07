import type { Socket } from "bun";
import { QueryExecuteMapper } from "./execute-query-mapper.service";
import { StatusCode, type QueryTypesEnum } from "../constants";
import LoggerService from "../utils/logger-service";

export class ExecuteQueryService {
  static instance: ExecuteQueryService;
  constructor() {}

  public static getInstance(): ExecuteQueryService {
    if (!ExecuteQueryService.instance) {
      ExecuteQueryService.instance = new ExecuteQueryService();
    }
    return ExecuteQueryService.instance;
  }

  public executeQuery(query: RegExpMatchArray) {
    const requestQuery = query[0];
    const prefix = requestQuery.split(" ")[0].toUpperCase() as QueryTypesEnum;
    const command = prefix as QueryTypesEnum;
    const handler = QueryExecuteMapper[command];
    if (!handler) {
      LoggerService.error(`No handler found for prefix: ${command}`);
      return {
        status: StatusCode.ERROR,
        message: `Invalid Syntax`,
      };
    }
    return handler.execute(query);
  }
}
