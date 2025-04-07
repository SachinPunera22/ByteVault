import type { Socket } from "bun";
import {
  StatusCode,
  type HandlerImplementation,
  type QueryResponseFormat,
} from "../../constants";
import { CreateTableService } from "../../database_operations/create-table/create_table.service";

export class CreateValidator implements HandlerImplementation {
  static instance: CreateValidator;
  private createTable: CreateTableService;

  constructor() {
    this.createTable = CreateTableService.getInstance();
  }

  public static getInstance(): CreateValidator {
    if (!CreateValidator.instance) {
      CreateValidator.instance = new CreateValidator();
    }
    return CreateValidator.instance;
  }

  public validate(query: {
    data: Buffer;
    socket: Socket;
  }): QueryResponseFormat {
    const requestQuery = query.data.toString();
    const regExp =
      /^CREATE TABLE ([A-Za-z]\w+) \(([A-Za-z]\w+) (INTEGER|FLOAT) (NOT NULL)? (PRIMARY KEY)?(, ([A-Za-z]\w+) (INTEGER|FLOAT|VARCHAR|LONG TEXT|BOOLEAN|DATE)( NOT NULL| NULL)?( DEFAULT ("\w+"|-?\d+(\.\d{1,3})?|TRUE|FALSE|NULL|NOT NULL))?)*?\);$/;

    const matches = requestQuery.match(regExp);
    if (!requestQuery.match(regExp)) {
      return {
        status: StatusCode.ERROR,
        message: `Invalid SQL syntax`,
      };
    }
    return {
      status: StatusCode.SUCCESS,
      message: `valid sql syntax`,
      data: matches,
    };
  }
}
