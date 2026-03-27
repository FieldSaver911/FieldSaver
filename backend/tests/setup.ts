import { beforeAll, afterAll } from 'vitest';
import { db } from '../src/db';

// Ensure test database is clean before suite
beforeAll(async () => {
  // Verify we're connected to the test DB (not production)
  const result = await db.raw('SELECT current_database()');
  const dbName = result.rows[0].current_database as string;
  if (!dbName.includes('test') && process.env.NODE_ENV !== 'test') {
    throw new Error(`Tests must run against a test database. Current: ${dbName}`);
  }
});

afterAll(async () => {
  await db.destroy();
});
