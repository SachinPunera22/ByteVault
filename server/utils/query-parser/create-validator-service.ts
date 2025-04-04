import type { Socket } from "bun";
import {
  StatusCode,
  type HandlerImplementation,
  type QueryResponseFormat,
} from "../../constants";

export class CreateValidator implements HandlerImplementation {
  static instance: CreateValidator;

  constructor() {}

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
    console.log("query", requestQuery);
    const regExp =
      /^CREATE TABLE ([A-Za-z]\w+) \(([A-Za-z]\w+) (INTEGER|FLOAT)\s*?(NOT NULL)? \s*?(PRIMARY KEY)?(, ([A-Za-z]\w+) (INTEGER|FLOAT|VARCHAR|LONG TEXT|BOOLEAN|DATE)( NOT NULL| NULL)?( DEFAULT ("\w+"|-?\d+(\.\d{1,3})?|TRUE|FALSE|NULL|NOT NULL))?)*?\);$/;

    const test = regExp.test(requestQuery);
    console.log(test);
    const matches = requestQuery.match(regExp);
    console.log("mathces", matches);
    if (!requestQuery.match(regExp)) {
      return {
        status: StatusCode.ERROR,
        message: `Invalid SQL syntax`,
      };
    }
    // save table to database meta
    return {
      status: StatusCode.SUCCESS,
      message: `Table created successfully`,
    };
  }
}
