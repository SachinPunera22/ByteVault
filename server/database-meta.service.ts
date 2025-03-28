import * as fs from "node:fs/promises";
export class DatabaseMetaService {
  private dbMeta;

  constructor() {
    this.dbMeta = this.readMeta();
  }

  public async saveMeta(databaseMeta: { [key: string]: any }) {
    const databaseMetaString: string = this.convertToMetaString(databaseMeta);
    const stringBuffer = Buffer.from(databaseMetaString, "utf-8");
    const fd = await fs.open("./server/storage/database.ibd", "w");
    await fs.writeFile(fd, stringBuffer, "binary");
    await fd.close();
  }

  /**
   * reads meta file and return the database meta info
   * @returns
   */
  public async readMeta() {
    const fd = await fs.open("./server/storage/database.ibd", "r");
    const data = await fs.readFile(fd);
    const metaData = data.toString("utf-8");
    const [basicMetaString, tablesMetaString] = metaData.split("\n\n"); //split database basic meta and tables meta
    const databaseMeta = this.convertToBasicMetaObject(basicMetaString);
    const tablesMeta = this.convertToTablesMetaObject(tablesMetaString);
    databaseMeta.tables = tablesMeta;
    return databaseMeta;
  }

  /**
   * converts the string to basic meta object
   * @param metaString
   * @returns
   */
  private convertToBasicMetaObject(metaString: string) {
    let dbMeta: { [Key: string]: any } = {};
    const metaArray = metaString.split("\n"); //split string by new line delimiter
    metaArray.map((meta) => {
      const [key, value] = meta.split(":"); // Split pair by the colon delimiter
      if (key && value) {
        dbMeta[key.trim()] = value.trim();
      }
    });
    return dbMeta;
  }

  /**
   * converts the table meta string to object
   * @param tableMeta
   * @returns
   */
  private convertToTablesMetaObject(tableMeta: string) {
    const tableMetaObject = [];
    const tablesMeta: string[] = tableMeta.split("\n"); //split string by new line delimiter
    for (let i = 0; i < tablesMeta.length; i += 2) {
      const [tableName, tableNameValue] = tablesMeta[i].split(":");
      const [path, pathValue] = tablesMeta[i + 1].split(":");
      tableMetaObject.push({
        [tableName]: tableNameValue.trim(),
        [path]: pathValue.trim(),
      });
    }
    return tableMetaObject;
  }
  private convertToMetaString(databaseMeta: {
    [x: string]: any;
    tables?: any;
  }): string {
    const { tables, ...dbMeta } = databaseMeta;
    const basicMetaString = this.convertToBasicMetaString(dbMeta);
    const tablesMetaString = this.convertToTablesMetaString(tables);
    const metaString= basicMetaString+'\n\n'+tablesMetaString
    return metaString;
  }

  /**
   *  converts the basic meta info object to string
   * @param dbMeta 
   * @returns 
   */
  private convertToBasicMetaString(dbMeta: { [key: string]: string }) {
    const jsonString = JSON.stringify(dbMeta);
    const newString = jsonString.replaceAll(",", "\n");
    let metaString = "";
    const extraSymbols = ["{", "}", `'`, `"`];
    for (let i = 0; i < newString.length; i++) {
      if (extraSymbols.includes(newString[i])) {
        continue;
      }
      metaString += newString[i];
    }
    return metaString;
  }

  /**
   * converts the tables meta object to string
   * @param tables 
   * @returns 
   */
  private convertToTablesMetaString(tables: { [key: string]: string }) {
    const jsonString = JSON.stringify(tables);
    const updateTablesString = jsonString.replaceAll(",", "\n");
    const extraSymbols = ["{", "}", `'`, `"`, "[", "]"];
    let tablesString = "";
    for (let i = 0; i < updateTablesString.length; i++) {
      if (extraSymbols.includes(updateTablesString[i])) {
        continue;
      }
      tablesString += updateTablesString[i];
    }
    return tablesString;
  }
}
