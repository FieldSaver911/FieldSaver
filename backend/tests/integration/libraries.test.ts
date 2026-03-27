/**
 * Integration tests for the libraries API routes.
 *
 * All requests go through the real Express app via Supertest. The database
 * is real PostgreSQL. A test-local app instance mounts the libraries router
 * (which is commented out in the main app.ts while in development) so these
 * tests exercise the full request/service/query stack.
 *
 * Each describe block manages its own cleanup so tests are isolated and
 * repeatable.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import supertest from 'supertest';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from '../../src/middleware/error-handler';
import { notFound } from '../../src/middleware/not-found';
import authRouter, { meHandler } from '../../src/api/auth';
import librariesRouter from '../../src/api/libraries';
import { authenticate } from '../../src/middleware/auth';
import { db } from '../../src/db';
import { makeLibrary, makeLibraryRow, makeUser } from '../factories';

// ─── Build a test-local Express app ──────────────────────────────────────────
// Mirrors createApp() but also mounts the libraries router.

function createTestApp() {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/v1/auth', authRouter);
  app.get('/api/v1/me', authenticate, meHandler);
  app.use('/api/v1/libraries', librariesRouter);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

const app = createTestApp();
const request = supertest(app);

// ─── Auth helpers ─────────────────────────────────────────────────────────────

interface TestCredentials {
  userId: string;
  email: string;
  password: string;
  token: string;
  adminToken: string;
  adminUserId: string;
}

/**
 * Registers and logs in an editor user AND an admin user.
 * Returns tokens for both roles.
 */
async function setupAuth(): Promise<TestCredentials> {
  const email = `lib-test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
  const password = 'Password1!';

  // Register editor
  const regRes = await request.post('/api/v1/auth/register').send({ email, password, name: 'Lib Editor' });
  if (regRes.status !== 201) throw new Error(`Register failed: ${JSON.stringify(regRes.body)}`);
  const userId = regRes.body.data.id as string;

  // Log in editor
  const loginRes = await request.post('/api/v1/auth/login').send({ email, password });
  if (loginRes.status !== 200) throw new Error(`Login failed: ${JSON.stringify(loginRes.body)}`);
  const token = loginRes.body.data.token as string;

  // Create an admin user directly in DB so we get an admin token
  const adminData = makeUser({ role: 'admin' });
  const [adminRow] = await db('users').insert(adminData).returning('*');
  const adminEmail = adminRow.email as string;

  // We can't log in via the API without a real bcrypt hash, so update password_hash
  const bcrypt = await import('bcrypt');
  const adminHash = await bcrypt.hash(password, 10);
  await db('users').where({ id: adminRow.id }).update({ password_hash: adminHash });

  const adminLoginRes = await request.post('/api/v1/auth/login').send({ email: adminEmail, password });
  if (adminLoginRes.status !== 200) throw new Error(`Admin login failed: ${JSON.stringify(adminLoginRes.body)}`);
  const adminToken = adminLoginRes.body.data.token as string;

  return {
    userId,
    email,
    password,
    token,
    adminToken,
    adminUserId: adminRow.id as string,
  };
}

// ─── DB helpers ───────────────────────────────────────────────────────────────

async function insertLibrary(overrides: Record<string, unknown> = {}) {
  const data = makeLibrary(overrides);
  const [row] = await db('libraries').insert(data).returning('*');
  return row;
}

async function insertLibraryRow(libraryId: string, overrides: Record<string, unknown> = {}) {
  const data = makeLibraryRow(libraryId, overrides);
  const [row] = await db('library_rows').insert(data).returning('*');
  return row;
}

// ─── GET /api/v1/libraries ────────────────────────────────────────────────────

describe('GET /api/v1/libraries', () => {
  let auth: TestCredentials;
  const libraryIds: string[] = [];

  beforeEach(async () => {
    auth = await setupAuth();
  });

  afterEach(async () => {
    for (const id of libraryIds) {
      await db('library_rows').where({ library_id: id }).del();
      await db('libraries').where({ id }).del();
    }
    libraryIds.length = 0;
    await db('refresh_tokens').where({ userId: auth.userId }).del();
    await db('users').where({ id: auth.userId }).del();
    await db('refresh_tokens').where({ userId: auth.adminUserId }).del();
    await db('users').where({ id: auth.adminUserId }).del();
  });

  it('should return 200 with a paginated list of libraries', async () => {
    const lib = await insertLibrary({ source: 'custom' });
    libraryIds.push(lib.id);

    const res = await request
      .get('/api/v1/libraries')
      .set('Authorization', `Bearer ${auth.token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toBeDefined();
    expect(typeof res.body.meta.total).toBe('number');
  });

  it('should return 401 when no Authorization header is provided', async () => {
    const res = await request.get('/api/v1/libraries');

    expect(res.status).toBe(401);
  });

  it('should support source filter via query parameter', async () => {
    const builtinLib = await insertLibrary({ source: 'builtin' });
    const customLib = await insertLibrary({ source: 'custom' });
    libraryIds.push(builtinLib.id, customLib.id);

    const res = await request
      .get('/api/v1/libraries?source=builtin')
      .set('Authorization', `Bearer ${auth.token}`);

    expect(res.status).toBe(200);
    const ids = (res.body.data as Array<{ id: string }>).map((l) => l.id);
    expect(ids).toContain(builtinLib.id);
    expect(ids).not.toContain(customLib.id);
  });

  it('should return 422 when source query param is not a valid enum value', async () => {
    const res = await request
      .get('/api/v1/libraries?source=invalid_source')
      .set('Authorization', `Bearer ${auth.token}`);

    expect(res.status).toBe(422);
  });

  it('should exclude soft-deleted libraries from the response', async () => {
    const lib = await insertLibrary({ source: 'custom' });
    libraryIds.push(lib.id);
    await db('libraries').where({ id: lib.id }).update({ deleted_at: db.fn.now() });

    const res = await request
      .get('/api/v1/libraries')
      .set('Authorization', `Bearer ${auth.token}`);

    expect(res.status).toBe(200);
    const ids = (res.body.data as Array<{ id: string }>).map((l) => l.id);
    expect(ids).not.toContain(lib.id);
  });
});

// ─── POST /api/v1/libraries ───────────────────────────────────────────────────

describe('POST /api/v1/libraries', () => {
  let auth: TestCredentials;
  const createdIds: string[] = [];

  beforeEach(async () => {
    auth = await setupAuth();
  });

  afterEach(async () => {
    for (const id of createdIds) {
      await db('library_rows').where({ library_id: id }).del();
      await db('libraries').where({ id }).del();
    }
    createdIds.length = 0;
    await db('refresh_tokens').where({ userId: auth.userId }).del();
    await db('users').where({ id: auth.userId }).del();
    await db('refresh_tokens').where({ userId: auth.adminUserId }).del();
    await db('users').where({ id: auth.adminUserId }).del();
  });

  it('should return 201 with the created library on valid input', async () => {
    const res = await request
      .post('/api/v1/libraries')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        name: 'My Custom Library',
        icon: '📋',
        description: 'Test',
        color: '#0073EA',
        version: '1.0',
        source: 'custom',
        categories: ['Data Element'],
        subCategories: ['Clinical'],
      });

    if (res.body.data?.id) createdIds.push(res.body.data.id);
    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.name).toBe('My Custom Library');
  });

  it('should return 422 when name is missing', async () => {
    const res = await request
      .post('/api/v1/libraries')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        icon: '📋',
        color: '#0073EA',
        source: 'custom',
      });

    expect(res.status).toBe(422);
    expect(res.body.details).toBeDefined();
  });

  it('should return 422 when color is not a valid hex string', async () => {
    const res = await request
      .post('/api/v1/libraries')
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        name: 'Bad Color Library',
        color: 'not-a-color',
        source: 'custom',
      });

    expect(res.status).toBe(422);
  });

  it('should return 401 when not authenticated', async () => {
    const res = await request
      .post('/api/v1/libraries')
      .send({ name: 'Unauth Library', source: 'custom' });

    expect(res.status).toBe(401);
  });
});

// ─── GET /api/v1/libraries/:id ────────────────────────────────────────────────

describe('GET /api/v1/libraries/:id', () => {
  let auth: TestCredentials;
  let libraryId: string;

  beforeEach(async () => {
    auth = await setupAuth();
    const lib = await insertLibrary();
    libraryId = lib.id;
  });

  afterEach(async () => {
    await db('library_rows').where({ library_id: libraryId }).del();
    await db('libraries').where({ id: libraryId }).del();
    await db('refresh_tokens').where({ userId: auth.userId }).del();
    await db('users').where({ id: auth.userId }).del();
    await db('refresh_tokens').where({ userId: auth.adminUserId }).del();
    await db('users').where({ id: auth.adminUserId }).del();
  });

  it('should return 200 with the library including its rows', async () => {
    const row = await insertLibraryRow(libraryId, { label: 'Eager Row' });

    const res = await request
      .get(`/api/v1/libraries/${libraryId}`)
      .set('Authorization', `Bearer ${auth.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(libraryId);
    expect(Array.isArray(res.body.data.rows)).toBe(true);
    const rowIds = (res.body.data.rows as Array<{ id: string }>).map((r) => r.id);
    expect(rowIds).toContain(row.id);

    await db('library_rows').where({ id: row.id }).del();
  });

  it('should return 200 with an empty rows array when the library has no rows', async () => {
    const res = await request
      .get(`/api/v1/libraries/${libraryId}`)
      .set('Authorization', `Bearer ${auth.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.rows).toEqual([]);
  });

  it('should return 404 when the library does not exist', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';

    const res = await request
      .get(`/api/v1/libraries/${fakeId}`)
      .set('Authorization', `Bearer ${auth.token}`);

    expect(res.status).toBe(404);
  });

  it('should return 401 when not authenticated', async () => {
    const res = await request.get(`/api/v1/libraries/${libraryId}`);

    expect(res.status).toBe(401);
  });
});

// ─── PUT /api/v1/libraries/:id ────────────────────────────────────────────────

describe('PUT /api/v1/libraries/:id', () => {
  let auth: TestCredentials;
  let libraryId: string;

  beforeEach(async () => {
    auth = await setupAuth();
    const lib = await insertLibrary({ name: 'Before Update' });
    libraryId = lib.id;
  });

  afterEach(async () => {
    await db('library_rows').where({ library_id: libraryId }).del();
    await db('libraries').where({ id: libraryId }).del();
    await db('refresh_tokens').where({ userId: auth.userId }).del();
    await db('users').where({ id: auth.userId }).del();
    await db('refresh_tokens').where({ userId: auth.adminUserId }).del();
    await db('users').where({ id: auth.adminUserId }).del();
  });

  it('should return 200 with the updated library when patching the name', async () => {
    const res = await request
      .put(`/api/v1/libraries/${libraryId}`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ name: 'After Update' });

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(libraryId);
    expect(res.body.data.name).toBe('After Update');
  });

  it('should return 200 when patching the color', async () => {
    const res = await request
      .put(`/api/v1/libraries/${libraryId}`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ color: '#FF0000' });

    expect(res.status).toBe(200);
    expect(res.body.data.color).toBe('#FF0000');
  });

  it('should return 404 when the library does not exist', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';

    const res = await request
      .put(`/api/v1/libraries/${fakeId}`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ name: 'Ghost Library' });

    expect(res.status).toBe(404);
  });

  it('should return 401 when not authenticated', async () => {
    const res = await request
      .put(`/api/v1/libraries/${libraryId}`)
      .send({ name: 'Unauth Update' });

    expect(res.status).toBe(401);
  });
});

// ─── DELETE /api/v1/libraries/:id ────────────────────────────────────────────

describe('DELETE /api/v1/libraries/:id', () => {
  let auth: TestCredentials;
  let libraryId: string;

  beforeEach(async () => {
    auth = await setupAuth();
    const lib = await insertLibrary();
    libraryId = lib.id;
  });

  afterEach(async () => {
    await db('library_rows').where({ library_id: libraryId }).del();
    await db('libraries').where({ id: libraryId }).del();
    await db('refresh_tokens').where({ userId: auth.userId }).del();
    await db('users').where({ id: auth.userId }).del();
    await db('refresh_tokens').where({ userId: auth.adminUserId }).del();
    await db('users').where({ id: auth.adminUserId }).del();
  });

  it('should return 204 when an admin deletes a library', async () => {
    const res = await request
      .delete(`/api/v1/libraries/${libraryId}`)
      .set('Authorization', `Bearer ${auth.adminToken}`);

    expect(res.status).toBe(204);
  });

  it('should return 403 when an editor attempts to delete a library', async () => {
    const res = await request
      .delete(`/api/v1/libraries/${libraryId}`)
      .set('Authorization', `Bearer ${auth.token}`);

    expect(res.status).toBe(403);
  });

  it('should return 404 on a subsequent GET after deletion', async () => {
    await request
      .delete(`/api/v1/libraries/${libraryId}`)
      .set('Authorization', `Bearer ${auth.adminToken}`);

    const res = await request
      .get(`/api/v1/libraries/${libraryId}`)
      .set('Authorization', `Bearer ${auth.token}`);

    expect(res.status).toBe(404);
  });

  it('should return 401 when not authenticated', async () => {
    const res = await request.delete(`/api/v1/libraries/${libraryId}`);

    expect(res.status).toBe(401);
  });
});

// ─── GET /api/v1/libraries/:id/rows ──────────────────────────────────────────

describe('GET /api/v1/libraries/:id/rows', () => {
  let auth: TestCredentials;
  let libraryId: string;

  beforeEach(async () => {
    auth = await setupAuth();
    const lib = await insertLibrary();
    libraryId = lib.id;
  });

  afterEach(async () => {
    await db('library_rows').where({ library_id: libraryId }).del();
    await db('libraries').where({ id: libraryId }).del();
    await db('refresh_tokens').where({ userId: auth.userId }).del();
    await db('users').where({ id: auth.userId }).del();
    await db('refresh_tokens').where({ userId: auth.adminUserId }).del();
    await db('users').where({ id: auth.adminUserId }).del();
  });

  it('should return 200 with the rows array and pagination meta', async () => {
    await insertLibraryRow(libraryId, { label: 'Row 1', category: 'Data Element' });
    await insertLibraryRow(libraryId, { label: 'Row 2', category: 'NOT Value' });

    const res = await request
      .get(`/api/v1/libraries/${libraryId}/rows`)
      .set('Authorization', `Bearer ${auth.token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    expect(res.body.meta).toBeDefined();
    expect(typeof res.body.meta.total).toBe('number');
  });

  it('should filter rows by category', async () => {
    await insertLibraryRow(libraryId, { label: 'DE Row', category: 'Data Element' });
    await insertLibraryRow(libraryId, { label: 'NV Row', category: 'NOT Value' });

    const res = await request
      .get(`/api/v1/libraries/${libraryId}/rows?category=Data+Element`)
      .set('Authorization', `Bearer ${auth.token}`);

    expect(res.status).toBe(200);
    const categories = (res.body.data as Array<{ category: string }>).map((r) => r.category);
    categories.forEach((c) => expect(c).toBe('Data Element'));
  });

  it('should exclude soft-deleted rows', async () => {
    const row = await insertLibraryRow(libraryId, { label: 'Deleted Row' });
    await db('library_rows').where({ id: row.id }).update({ deleted_at: db.fn.now() });

    const res = await request
      .get(`/api/v1/libraries/${libraryId}/rows`)
      .set('Authorization', `Bearer ${auth.token}`);

    expect(res.status).toBe(200);
    const ids = (res.body.data as Array<{ id: string }>).map((r) => r.id);
    expect(ids).not.toContain(row.id);
  });

  it('should return 404 when the library does not exist', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';

    const res = await request
      .get(`/api/v1/libraries/${fakeId}/rows`)
      .set('Authorization', `Bearer ${auth.token}`);

    expect(res.status).toBe(404);
  });

  it('should return 401 when not authenticated', async () => {
    const res = await request.get(`/api/v1/libraries/${libraryId}/rows`);

    expect(res.status).toBe(401);
  });
});

// ─── POST /api/v1/libraries/:id/rows ─────────────────────────────────────────

describe('POST /api/v1/libraries/:id/rows', () => {
  let auth: TestCredentials;
  let libraryId: string;
  const rowIds: string[] = [];

  beforeEach(async () => {
    auth = await setupAuth();
    const lib = await insertLibrary();
    libraryId = lib.id;
  });

  afterEach(async () => {
    for (const id of rowIds) {
      await db('library_rows').where({ id }).del();
    }
    rowIds.length = 0;
    await db('library_rows').where({ library_id: libraryId }).del();
    await db('libraries').where({ id: libraryId }).del();
    await db('refresh_tokens').where({ userId: auth.userId }).del();
    await db('users').where({ id: auth.userId }).del();
    await db('refresh_tokens').where({ userId: auth.adminUserId }).del();
    await db('users').where({ id: auth.adminUserId }).del();
  });

  it('should return 201 with the created row', async () => {
    const res = await request
      .post(`/api/v1/libraries/${libraryId}/rows`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        label: 'New API Row',
        code: 'NAR001',
        exportKey: 'eTest.NewApiRow',
        description: '',
        category: 'Data Element',
        subCategory: 'Clinical',
        usage: 'Optional',
        elementId: 'eTest.01',
        sortOrder: 0,
      });

    if (res.body.data?.id) rowIds.push(res.body.data.id);
    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.label).toBe('New API Row');
    expect(res.body.data.exportKey).toBe('eTest.NewApiRow');
  });

  it('should return 422 when label is missing', async () => {
    const res = await request
      .post(`/api/v1/libraries/${libraryId}/rows`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        code: '',
        exportKey: 'eTest.NoLabel',
      });

    expect(res.status).toBe(422);
  });

  it('should return 422 when exportKey is missing', async () => {
    const res = await request
      .post(`/api/v1/libraries/${libraryId}/rows`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ label: 'No Export Key Row' });

    expect(res.status).toBe(422);
  });

  it('should return 401 when not authenticated', async () => {
    const res = await request
      .post(`/api/v1/libraries/${libraryId}/rows`)
      .send({ label: 'Unauth Row', exportKey: 'eTest.Unauth' });

    expect(res.status).toBe(401);
  });
});

// ─── PUT /api/v1/libraries/:id/rows/:rowId ───────────────────────────────────

describe('PUT /api/v1/libraries/:id/rows/:rowId', () => {
  let auth: TestCredentials;
  let libraryId: string;
  let rowId: string;

  beforeEach(async () => {
    auth = await setupAuth();
    const lib = await insertLibrary();
    libraryId = lib.id;
    const row = await insertLibraryRow(libraryId, { label: 'Before Row Update' });
    rowId = row.id;
  });

  afterEach(async () => {
    await db('library_rows').where({ id: rowId }).del();
    await db('libraries').where({ id: libraryId }).del();
    await db('refresh_tokens').where({ userId: auth.userId }).del();
    await db('users').where({ id: auth.userId }).del();
    await db('refresh_tokens').where({ userId: auth.adminUserId }).del();
    await db('users').where({ id: auth.adminUserId }).del();
  });

  it('should return 200 with the updated row when patching the label', async () => {
    const res = await request
      .put(`/api/v1/libraries/${libraryId}/rows/${rowId}`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ label: 'After Row Update' });

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(rowId);
    expect(res.body.data.label).toBe('After Row Update');
  });

  it('should return 200 when patching the exportKey', async () => {
    const res = await request
      .put(`/api/v1/libraries/${libraryId}/rows/${rowId}`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ exportKey: 'eTest.Updated' });

    expect(res.status).toBe(200);
    expect(res.body.data.exportKey).toBe('eTest.Updated');
  });

  it('should return 404 when the row does not exist', async () => {
    const fakeRowId = '00000000-0000-0000-0000-000000000000';

    const res = await request
      .put(`/api/v1/libraries/${libraryId}/rows/${fakeRowId}`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ label: 'Ghost Row' });

    expect(res.status).toBe(404);
  });

  it('should return 401 when not authenticated', async () => {
    const res = await request
      .put(`/api/v1/libraries/${libraryId}/rows/${rowId}`)
      .send({ label: 'Unauth Update' });

    expect(res.status).toBe(401);
  });
});

// ─── DELETE /api/v1/libraries/:id/rows/:rowId ────────────────────────────────

describe('DELETE /api/v1/libraries/:id/rows/:rowId', () => {
  let auth: TestCredentials;
  let libraryId: string;
  let rowId: string;

  beforeEach(async () => {
    auth = await setupAuth();
    const lib = await insertLibrary();
    libraryId = lib.id;
    const row = await insertLibraryRow(libraryId);
    rowId = row.id;
  });

  afterEach(async () => {
    await db('library_rows').where({ id: rowId }).del();
    await db('libraries').where({ id: libraryId }).del();
    await db('refresh_tokens').where({ userId: auth.userId }).del();
    await db('users').where({ id: auth.userId }).del();
    await db('refresh_tokens').where({ userId: auth.adminUserId }).del();
    await db('users').where({ id: auth.adminUserId }).del();
  });

  it('should return 204 when an admin deletes a row', async () => {
    const res = await request
      .delete(`/api/v1/libraries/${libraryId}/rows/${rowId}`)
      .set('Authorization', `Bearer ${auth.adminToken}`);

    expect(res.status).toBe(204);
  });

  it('should return 403 when an editor attempts to delete a row', async () => {
    const res = await request
      .delete(`/api/v1/libraries/${libraryId}/rows/${rowId}`)
      .set('Authorization', `Bearer ${auth.token}`);

    expect(res.status).toBe(403);
  });

  it('should soft-delete: row no longer appears in subsequent GET rows', async () => {
    await request
      .delete(`/api/v1/libraries/${libraryId}/rows/${rowId}`)
      .set('Authorization', `Bearer ${auth.adminToken}`);

    const res = await request
      .get(`/api/v1/libraries/${libraryId}/rows`)
      .set('Authorization', `Bearer ${auth.token}`);

    expect(res.status).toBe(200);
    const ids = (res.body.data as Array<{ id: string }>).map((r) => r.id);
    expect(ids).not.toContain(rowId);
  });

  it('should return 401 when not authenticated', async () => {
    const res = await request.delete(`/api/v1/libraries/${libraryId}/rows/${rowId}`);

    expect(res.status).toBe(401);
  });
});

// ─── POST /api/v1/libraries/:id/rows/bulk ────────────────────────────────────

describe('POST /api/v1/libraries/:id/rows/bulk', () => {
  let auth: TestCredentials;
  let libraryId: string;

  beforeEach(async () => {
    auth = await setupAuth();
    const lib = await insertLibrary();
    libraryId = lib.id;
  });

  afterEach(async () => {
    await db('library_rows').where({ library_id: libraryId }).del();
    await db('libraries').where({ id: libraryId }).del();
    await db('refresh_tokens').where({ userId: auth.userId }).del();
    await db('users').where({ id: auth.userId }).del();
    await db('refresh_tokens').where({ userId: auth.adminUserId }).del();
    await db('users').where({ id: auth.adminUserId }).del();
  });

  it('should return 201 with the created rows when given a small batch', async () => {
    const rows = [
      { label: 'Bulk A', code: 'A001', exportKey: 'eTest.BulkA', description: '', category: 'Data Element', subCategory: '', usage: 'Optional', elementId: '', sortOrder: 0 },
      { label: 'Bulk B', code: 'B001', exportKey: 'eTest.BulkB', description: '', category: 'NOT Value', subCategory: '', usage: 'Optional', elementId: '', sortOrder: 1 },
    ];

    const res = await request
      .post(`/api/v1/libraries/${libraryId}/rows/bulk`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ rows });

    expect(res.status).toBe(201);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(2);
    (res.body.data as Array<{ id: string }>).forEach((r) => expect(r.id).toBeDefined());
  });

  it('should return 201 with all 500 rows when given the maximum batch size', async () => {
    const rows = Array.from({ length: 500 }, (_, i) => ({
      label: `Bulk Row ${i}`,
      code: `CODE${i}`,
      exportKey: `eTest.Bulk${i}`,
      description: '',
      category: 'Data Element',
      subCategory: '',
      usage: 'Optional',
      elementId: '',
      sortOrder: i,
    }));

    const res = await request
      .post(`/api/v1/libraries/${libraryId}/rows/bulk`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ rows });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveLength(500);
  }, 60_000);

  it('should return 422 when rows array exceeds 500 entries', async () => {
    const rows = Array.from({ length: 501 }, (_, i) => ({
      label: `Over Row ${i}`,
      code: '',
      exportKey: `eTest.Over${i}`,
      description: '',
      category: 'Data Element',
      subCategory: '',
      usage: 'Optional',
      elementId: '',
      sortOrder: i,
    }));

    const res = await request
      .post(`/api/v1/libraries/${libraryId}/rows/bulk`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ rows });

    expect(res.status).toBe(422);
  });

  it('should return 422 when rows array is empty', async () => {
    const res = await request
      .post(`/api/v1/libraries/${libraryId}/rows/bulk`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({ rows: [] });

    expect(res.status).toBe(422);
  });

  it('should return 404 when the library does not exist', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';

    const res = await request
      .post(`/api/v1/libraries/${fakeId}/rows/bulk`)
      .set('Authorization', `Bearer ${auth.token}`)
      .send({
        rows: [
          { label: 'Orphan', code: '', exportKey: 'eTest.Orphan', description: '', category: '', subCategory: '', usage: 'Optional', elementId: '', sortOrder: 0 },
        ],
      });

    expect(res.status).toBe(404);
  });

  it('should return 401 when not authenticated', async () => {
    const res = await request
      .post(`/api/v1/libraries/${libraryId}/rows/bulk`)
      .send({
        rows: [
          { label: 'Unauth', code: '', exportKey: 'eTest.Unauth', description: '', category: '', subCategory: '', usage: 'Optional', elementId: '', sortOrder: 0 },
        ],
      });

    expect(res.status).toBe(401);
  });
});
