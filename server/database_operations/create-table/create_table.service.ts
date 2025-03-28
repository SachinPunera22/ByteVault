import { DatabaseMetaService } from "../../database-meta.service";

export class CreateTableService {
  private databaseMetaService: DatabaseMetaService;
  constructor() {
    this.databaseMetaService = new DatabaseMetaService();
  }

  /**
   * crete a table and update the database meta file
   * @param tableName
   */
  public async create(tableName: string) {
    const dbMeta = await this.databaseMetaService.readMeta();
    const tableObj = {
      Name: tableName,
      path: `${tableName}.ibd`,
    };
    dbMeta.tables.push(tableObj);
    dbMeta.Number_of_tables = dbMeta.Number_of_tables + 1;
    this.databaseMetaService.saveMeta(dbMeta);
    //Create table meta and file
  }
}