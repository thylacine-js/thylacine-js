import BetterSqlite3 from "better-sqlite3";
import BaseSqlMigrator from "./BaseSqlMigrator.mjs";

function splitCompoundSql(sql) {
  return sql
    .split(";")
    .filter((i) => !i.match(/^\s*$/))
    .map((s) => `${s};`);
}

export default class SqliteMigrator extends BaseSqlMigrator {
  constructor(dbPath, migrationTableName) {
    super();
    this.db = new BetterSqlite3(dbPath);
    this.migrationTableName = migrationTableName;
  }

  async executeSql(sql) {
    const sqlStatements = splitCompoundSql(sql);
    for (const sqlStatement of sqlStatements) {
      this.db.prepare(sqlStatement).run();
    }
  }

  async executeSqlForRows(sql) {
    const sqlStatements = splitCompoundSql(sql);
    const lastSqlStatement = sqlStatements.pop();
    for (const sqlStatement of sqlStatements) {
      this.db.prepare(sqlStatement).run();
    }
    return this.db.prepare(lastSqlStatement).all();
  }
}
