import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

import pool, { connectDB } from './pool';
import logger from '@/utils/logger';

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

async function runMigrations(): Promise<void> {
  await connectDB();

  // Migration tracking table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version    VARCHAR PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const { rows: applied } = await pool.query<{ version: string }>(
    'SELECT version FROM schema_migrations ORDER BY version',
  );
  const appliedSet = new Set(applied.map((r) => r.version));

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  let count = 0;
  for (const file of files) {
    const version = path.basename(file, '.sql');
    if (appliedSet.has(version)) {
      logger.debug('Migration already applied, skipping', { version });
      continue;
    }

    logger.info('Applying migration', { version });
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');

    await pool.query(sql);
    await pool.query(
      'INSERT INTO schema_migrations (version) VALUES ($1)',
      [version],
    );

    logger.info('Migration applied', { version });
    count++;
  }

  if (count === 0) {
    logger.info('All migrations already up to date');
  } else {
    logger.info('Migrations complete', { applied: count });
  }

  await pool.end();
}

// Optionally seed dev data
const shouldSeed = process.argv.includes('--seed');

runMigrations()
  .then(async () => {
    if (shouldSeed) {
      logger.info('Running dev seed…');
      await pool.query('SELECT seed_dev_data()');
      logger.info('Dev seed complete');
    }
  })
  .catch((err) => {
    logger.error('Migration failed', { error: (err as Error).message });
    process.exit(1);
  });
