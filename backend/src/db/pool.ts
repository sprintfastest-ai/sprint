import { Pool, type PoolClient } from 'pg';
import logger from '@/utils/logger';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 30_000,
  // Parse timestamps as JS Date objects, and NUMERIC/DECIMAL as JS numbers.
  //
  // node-postgres deliberately returns NUMERIC as a string by default (to
  // avoid silent precision loss on values too large for a float) — but that
  // means every DECIMAL column comes back as e.g. "12.34", not 12.34, while
  // every TS type in the codebase (PersonalBest.timeSeconds: number, etc.)
  // claims it's a number. The mismatch is invisible at compile time and
  // crashes at runtime the moment anything calls a number method on it —
  // this is exactly what caused a real production crash:
  // personal_bests.time_seconds (DECIMAL(6,2)) came back as a string, and
  // `pb.timeSeconds.toFixed(2)` in AthleteDashboardScreen threw
  // "undefined is not a function" ("12.34".toFixed is undefined; only
  // numbers have .toFixed). Sprint times are always well under 1000
  // seconds, nowhere near float precision limits, so parseFloat is safe
  // here — this isn't a case that actually needed the string-precision
  // protection pg's default is guarding against.
  types: {
    getTypeParser: (oid, format) => {
      const { builtins } = require('pg').types;
      if (oid === builtins.TIMESTAMPTZ || oid === builtins.TIMESTAMP) {
        return (val: string) => new Date(val);
      }
      if (oid === builtins.NUMERIC) {
        return (val: string) => parseFloat(val);
      }
      return require('pg').types.getTypeParser(oid, format);
    },
  },
});

pool.on('error', (err: Error) => {
  logger.error('Unexpected PostgreSQL pool error', { message: err.message });
});

pool.on('connect', () => {
  logger.debug('New PostgreSQL client connected');
});

export async function connectDB(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    logger.info('PostgreSQL connection verified');
  } finally {
    client.release();
  }
}

export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export default pool;
