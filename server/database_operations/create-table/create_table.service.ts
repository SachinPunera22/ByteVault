import {
  StatusCode,
  type ExecuteHandlerImplementation,
  type QueryResponseFormat,
} from "../../constants";
import { DatabaseMetaService } from "../../database-meta.service";
import LoggerService from "../../utils/logger-service";

export class CreateTableService implements ExecuteHandlerImplementation {
  static instance: CreateTableService;
  private databaseMetaService: DatabaseMetaService;
  constructor() {
    this.databaseMetaService = new DatabaseMetaService();
  }

  public static getInstance(): CreateTableService {
    if (!CreateTableService.instance) {
      CreateTableService.instance = new CreateTableService();
    }
    return CreateTableService.instance;
  }

  /**
   * crete a table and update the database meta file
   * @param tableName
   */
  public async execute(query: RegExpMatchArray): Promise<QueryResponseFormat> {
    const tableName = query[1];
    const dbMeta = await this.databaseMetaService.readMeta();

    if (await this.databaseMetaService.checkIfTableExists(dbMeta, tableName)) {
      LoggerService.error("Table name already exists");
      return {
        status: StatusCode.ERROR,
        message: "Table name already exists",
      };
    }
    const tableObj = {
      Name: tableName,
      path: `${tableName}.ibd`,
    };
    dbMeta.tables.push(tableObj);
    dbMeta.Number_of_tables = +dbMeta.Number_of_tables + 1;
    this.databaseMetaService.saveMeta(dbMeta);
    //Create table meta and file
    return {
      status: StatusCode.SUCCESS,
      message: "table created successfully",
    };
  }
}
