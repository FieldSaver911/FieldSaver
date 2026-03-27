import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { createApp } from '../../src/app';
import { db } from '../../src/db';
import { makeUser } from '../factories';

const app = createApp();
const request = supertest(app);

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request.get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('Auth — POST /api/v1/auth/register', () => {
  const testEmail = `ci-${Date.now()}@example.com`;

  afterAll(async () => {
    await db('users').where('email', testEmail).delete();
  });

  it('creates a new user and returns a token', async () => {
    const res = await request
      .post('/api/v1/auth/register')
      .send({ email: testEmail, password: 'password123', name: 'CI User' });

    expect(res.status).toBe(201);
    expect(res.body.data.token).toBeTruthy();
    expect(res.body.data.user.email).toBe(testEmail);
    expect(res.body.data.user).not.toHaveProperty('passwordHash');
  });

  it('returns 422 with invalid email', async () => {
    const res = await request
      .post('/api/v1/auth/register')
      .send({ email: 'not-an-email', password: 'password123', name: 'Test' });

    expect(res.status).toBe(422);
    expect(res.body.details).toBeDefined();
  });

  it('returns 409 when email already registered', async () => {
    await request
      .post('/api/v1/auth/register')
      .send({ email: testEmail, password: 'password123', name: 'Duplicate' });

    const res = await request
      .post('/api/v1/auth/register')
      .send({ email: testEmail, password: 'password123', name: 'Duplicate' });

    expect(res.status).toBe(409);
  });
});

describe('Forms — protected routes', () => {
  it('returns 401 without auth token', async () => {
    const res = await request.get('/api/v1/forms');
    expect(res.status).toBe(401);
  });

  it('returns 401 with malformed token', async () => {
    const res = await request
      .get('/api/v1/forms')
      .set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
  });
});
