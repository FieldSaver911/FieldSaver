import type { Knex } from 'knex';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env from the project root (one level above backend/)
// so DATABASE_URL and JWT_SECRET are available when running tests
// from the backend workspace directory.
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config(); // also allow a local backend/.env to override

const config: Record<string, Knex.Config> = {
  development: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: './src/db/migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './src/db/seeds',
      extension: 'ts',
    },
    pool: { min: 2, max: 10 },
  },

  test: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: './src/db/migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './src/db/seeds',
      extension: 'ts',
    },
    pool: { min: 1, max: 5 },
  },

  production: {
    client: 'postgresql',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    },
    migrations: {
      directory: './src/db/migrations',
      extension: 'ts',
    },
    pool: { min: 2, max: 20 },
  },
};

export default config;
