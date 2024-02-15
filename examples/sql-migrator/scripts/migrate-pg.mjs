import PgMigrator from '@thylacine-js/sql-migrator/PgMigrator.mjs';

import pg from 'pg';

export default async function main({ steps = Infinity, down } = {}) {
  if (down) { steps = steps * -1; }
  const client = new pg.Client();
  await client.connect();
  const migrator = new PgMigrator(client, '__migrations__');
  migrator.logger = console;
  migrator.setPath('./migrations');
  await migrator.run(steps);
  await client.end();
}

import cliCalls from '@thylacine-js/common/cliCalls.mjs';
cliCalls(import.meta, main);