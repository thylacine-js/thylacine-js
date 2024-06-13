import BaseSqlMigrator from "./BaseSqlMigrator.mjs";

export default class PgMigrator extends BaseSqlMigrator {
  constructor(pgClient, migrationTableName, pgSchema = null) {
    super();
    this.client = pgClient;
    this.migrationTableName = migrationTableName;
    this.pgSchema = pgSchema;
  }

  async setupPgSchema() {
    if (this.pgSchema) {
      this.client.query(`CREATE SCHEMA IF NOT EXISTS ${pgSchema}`);
    }
  }

  wrapSql(sql) {
    if (this.pgSchema) {
      return `SET search_path = ${pgSchema}; ${sql}`;
    }
    return sql;
  }

  async executeSql(sql) {
    return this.client.query(this.wrapSql(sql));
  }

  async executeSqlForRows(sql) {
    const r = await this.client.query(this.wrapSql(sql));
    return r.at(-1).rows;
  }
}
