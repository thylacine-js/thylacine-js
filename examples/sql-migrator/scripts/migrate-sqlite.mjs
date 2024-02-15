import SqliteMigrator from '@thylacine-js/sql-migrator/SqliteMigrator.mjs';

export default async function main({ steps = Infinity, down }) {
  if (down) { steps = steps * -1; }
  const migrator = new SqliteMigrator(':memory:', '__migrations__');
  migrator.logger = console;
  migrator.setPath('./migrations');
  await migrator.run(steps);
}

import cliCalls from '@thylacine-js/common/cliCalls.mjs';
cliCalls(import.meta, main);