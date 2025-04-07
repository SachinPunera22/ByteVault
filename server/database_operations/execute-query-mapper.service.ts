import {
  QueryTypesEnum,
  type ExecuteHandlerImplementation,
} from "../constants";
import { CreateTableService } from "./create-table/create_table.service";

export const QueryExecuteMapper: Record<
  QueryTypesEnum,
  ExecuteHandlerImplementation
> = {
  [QueryTypesEnum.CREATE]: CreateTableService.getInstance(),
};
