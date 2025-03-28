import { DatabaseMetaService } from "../../database-meta.service";

export class CreateTableService {
  private databaseMetaService: DatabaseMetaService;
  constructor() {
    this.databaseMetaService = new DatabaseMetaService();
  }
  public async create(tableName: string) {
    const dbMeta = await this.databaseMetaService.readMeta();
    const tableObj = {
      Name: tableName,
      path: `${tableName}.ibd`,
    };
    dbMeta.tables.push(tableObj);
    let numberOfTables = dbMeta.Number_of_tables;
    numberOfTables = +numberOfTables + 1;
    dbMeta.Number_of_tables = numberOfTables;
    const metaString = JSON.stringify(dbMeta);
    this.databaseMetaService.saveMeta(dbMeta);
  }
}
