import { Pool, type PoolClient } from 'pg';
import logger from '@/utils/logger';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  // Parse timestamps as JS Date objects
  types: {
    getTypeParser: (oid, format) => {
      // pg default parsers handle everything we need
      const { builtins } = require('pg').types;
      if (oid === builtins.TIMESTAMPTZ || oid === builtins.TIMESTAMP) {
        return (val: string) => new Date(val);
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
