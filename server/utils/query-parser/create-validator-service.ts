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
    console.log(`Coming here inside create`);
    const requestQuery = query.data.toString();
    const regExp = `^CREATE TABLE ([A-Za-z_]\w*) \(\s*([A-Za-z_]\w*) (INTEGER|FLOAT)( NOT NULL)( PRIMARY KEY)?(,\s*([A-Za-z_]\w*) (INTEGER|FLOAT|VARCHAR\(\d+\)|LONG TEXT|BOOLEAN|DATE)( NOT NULL| NULL)?( DEFAULT ("\w+"|-?\d+(\.\d{1,3})?|TRUE|FALSE|NULL|NOT NULL))?)*\s*\);?$
`;

    if (!regExp.match(requestQuery)) {
      return {
        status: StatusCode.ERROR,
        message: `Invalid SQL syntax`,
      };
    }

    return {
      status: StatusCode.ERROR,
      message: `Table created successfully`,
    };
  }
}
