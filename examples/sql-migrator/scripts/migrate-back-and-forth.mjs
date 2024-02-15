import SqliteMigrator from '@thylacine-js/sql-migrator/SqliteMigrator.mjs';

export default async function main() {
  const migrator = new SqliteMigrator(':memory:', '__migrations__');
  migrator.logger = console;
  migrator.setPath('./migrations');

  await migrator.run(2);
  await migrator.run(-1);
  await migrator.run(1);
  await migrator.run(-2);
  await migrator.run();
}

import cliCalls from '@thylacine-js/common/cliCalls.mjs';
cliCalls(import.meta, main);