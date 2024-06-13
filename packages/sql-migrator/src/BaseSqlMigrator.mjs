import fs from "fs";

export default class BaseSqlMigrator {
  constructor() {
    return this;
  }

  setPath(path) {
    this.path = path;
  }

  setMigrationTableName(name) {
    this.migrationTableName = name;
  }

  setCurrentMigrationId(currentMigrationId) {
    this.currentMigrationId = currentMigrationId;
  }

  async executeSql(sql) {
    throw new Error("not implemented");
  }

  async executeSqlForRows(sql) {
    throw new Error("not implemented");
  }

  async runBeforeAll(migrationIds, direction) {
    // noop
  }

  async runBeforeStep(migrationId, direction) {
    // noop
  }

  async runStep(migrationId, direction) {
    if (this.logger) {
      this.logger.log(`RUNNING ${migrationId}/${direction}.sql`);
    }
    const sql = await this.getMigrationSql(migrationId, direction);
    return this.executeSql(sql);
  }

  async runAfterStep(migrationId, direction) {
    // noop
  }

  async runAfterAll(migrationsIds, direction) {
    if (this.migrationTableName) {
      let lastMigrationId;
      if (direction === "up") {
        if (!migrationsIds.length) {
          return;
        }
        lastMigrationId = migrationsIds.at(-1);
      } else {
        let prevMigrationIds = await this.getMigrationIdsUpto(migrationsIds.at(-1));
        prevMigrationIds.pop();
        lastMigrationId = prevMigrationIds.length ? prevMigrationIds.at(-1) : null;
      }
      const sql = !lastMigrationId
        ? `DROP TABLE IF EXISTS ${this.migrationTableName};`
        : `
        DROP TABLE IF EXISTS ${this.migrationTableName};
        CREATE TABLE ${this.migrationTableName} (migration_id TEXT);
        INSERT INTO ${this.migrationTableName} (migration_id) VALUES ('${lastMigrationId}');
      `;
      this.currentMigrationId = lastMigrationId;
      return this.executeSql(sql);
    }
  }

  async getMigrationSql(id, direction) {
    return fs.promises.readFile(`${this.path}/${id}/${direction}.sql`, "utf-8");
  }

  async getAllMigrationIds() {
    const items = await fs.promises.readdir(this.path, { withFileTypes: true });
    return items
      .filter((i) => i.isDirectory())
      .map((i) => i.name)
      .sort((a, b) => a.localeCompare(b));
  }

  async getMigrationIdsSince(migrationId) {
    const migrationIds = await this.getAllMigrationIds();
    if (!migrationId) {
      return migrationIds;
    }
    return migrationIds.filter((migId) => migId > migrationId);
  }

  async getMigrationIdsUpto(migrationId) {
    const migrationIds = await this.getAllMigrationIds();
    if (!migrationId) {
      return migrationIds;
    }
    return migrationIds.filter((migId) => migId <= migrationId);
  }

  async queryCurrentMigrationId() {
    if (this.migrationTableName) {
      const sql = `CREATE TABLE IF NOT EXISTS ${this.migrationTableName} (migration_id TEXT); SELECT migration_id FROM ${this.migrationTableName};`;
      const rows = await this.executeSqlForRows(sql);
      return rows?.[0]?.migration_id;
    }
    return null;
  }

  async run(steps = Infinity, skipCurrentMigrationIdCheck = false) {
    if (!skipCurrentMigrationIdCheck && this.migrationTableName) {
      this.currentMigrationId = await this.queryCurrentMigrationId();
    }
    const direction = steps >= 0 ? "up" : "down";
    let migrationIds = [];
    if (steps > 0) {
      migrationIds = await this.getMigrationIdsSince(this.currentMigrationId);
      migrationIds = migrationIds.slice(0, steps);
    } else if (steps < 0) {
      migrationIds = await this.getMigrationIdsUpto(this.currentMigrationId);
      migrationIds.reverse();
      migrationIds = migrationIds.slice(0, -1 * steps);
    }
    await this.runBeforeAll(migrationIds, direction);
    for (const migId of migrationIds) {
      await this.runBeforeStep(migId, direction);
      await this.runStep(migId, direction);
      await this.runAfterStep(migId, direction);
    }
    await this.runAfterAll(migrationIds, direction);
    return true;
  }
}
