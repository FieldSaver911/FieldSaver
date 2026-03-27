/**
 * Integration tests for the auth API routes.
 *
 * All requests go through the real Express app via Supertest. The database
 * is real PostgreSQL. Each test suite manages its own cleanup so tests are
 * isolated and repeatable.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import supertest from 'supertest';
import * as crypto from 'crypto';
import { createApp } from '../../src/app';
import { db } from '../../src/db';

const app = createApp();
const request = supertest(app);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Registers a user directly via the API and returns the full response body.
 * Throws if the registration does not return 201.
 */
async function registerUser(overrides: Partial<{
  email: string;
  password: string;
  name: string;
}> = {}): Promise<{ email: string; password: string; userId: string }> {
  const email = overrides.email ?? `api-test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
  const password = overrides.password ?? 'Password1!';
  const name = overrides.name ?? 'API Test User';

  const res = await request
    .post('/api/v1/auth/register')
    .send({ email, password, name });

  if (res.status !== 201) {
    throw new Error(`Register helper got ${res.status}: ${JSON.stringify(res.body)}`);
  }

  return { email, password, userId: res.body.data.id };
}

/**
 * Registers then immediately logs in, returning the access token and refresh
 * token. Used to set up authenticated test scenarios.
 */
async function loginUser(credentials: { email: string; password: string }): Promise<{
  token: string;
  refreshToken: string;
}> {
  const res = await request
    .post('/api/v1/auth/login')
    .send(credentials);

  if (res.status !== 200) {
    throw new Error(`Login helper got ${res.status}: ${JSON.stringify(res.body)}`);
  }

  return {
    token: res.body.data.token as string,
    refreshToken: res.body.data.refreshToken as string,
  };
}

// ─── POST /api/v1/auth/register ───────────────────────────────────────────────

describe('POST /api/v1/auth/register', () => {
  const createdEmails: string[] = [];

  afterEach(async () => {
    for (const email of createdEmails) {
      await db('users').where({ email }).del();
    }
    createdEmails.length = 0;
  });

  it('should return 201 with the new user object on valid input', async () => {
    const email = `reg-201-${Date.now()}@example.com`;
    createdEmails.push(email);

    const res = await request
      .post('/api/v1/auth/register')
      .send({ email, password: 'Password1!', name: 'New User' });

    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.email).toBe(email);
    expect(res.body.data.name).toBe('New User');
  });

  it('should not include passwordHash in the response', async () => {
    const email = `reg-nohash-${Date.now()}@example.com`;
    createdEmails.push(email);

    const res = await request
      .post('/api/v1/auth/register')
      .send({ email, password: 'Password1!', name: 'Hash Check' });

    expect(res.status).toBe(201);
    expect(res.body.data.passwordHash).toBeUndefined();
    expect(res.body.data.password_hash).toBeUndefined();
  });

  it('should return 422 when email is not a valid email address', async () => {
    const res = await request
      .post('/api/v1/auth/register')
      .send({ email: 'not-an-email', password: 'Password1!', name: 'Invalid' });

    expect(res.status).toBe(422);
    expect(res.body.error).toBeDefined();
    expect(res.body.details).toBeDefined();
  });

  it('should return 422 when password is shorter than 8 characters', async () => {
    const res = await request
      .post('/api/v1/auth/register')
      .send({ email: `short-pw-${Date.now()}@example.com`, password: 'Abc1!', name: 'Short PW' });

    expect(res.status).toBe(422);
    expect(res.body.details).toBeDefined();
  });

  it('should return 422 when name is missing', async () => {
    const res = await request
      .post('/api/v1/auth/register')
      .send({ email: `no-name-${Date.now()}@example.com`, password: 'Password1!' });

    expect(res.status).toBe(422);
  });

  it('should return 409 when a user with the same email already exists', async () => {
    const email = `reg-dup-${Date.now()}@example.com`;
    createdEmails.push(email);

    // First registration — must succeed
    await request
      .post('/api/v1/auth/register')
      .send({ email, password: 'Password1!', name: 'Original' });

    // Second registration with same email
    const res = await request
      .post('/api/v1/auth/register')
      .send({ email, password: 'Password1!', name: 'Duplicate' });

    expect(res.status).toBe(409);
  });
});

// ─── POST /api/v1/auth/login ──────────────────────────────────────────────────

describe('POST /api/v1/auth/login', () => {
  let email: string;
  let password: string;
  let userId: string;

  beforeEach(async () => {
    const user = await registerUser();
    email = user.email;
    password = user.password;
    userId = user.userId;
  });

  afterEach(async () => {
    await db('refresh_tokens').where({ userId }).del();
    await db('users').where({ id: userId }).del();
  });

  it('should return 200 with a JWT token and refresh token on valid credentials', async () => {
    const res = await request
      .post('/api/v1/auth/login')
      .send({ email, password });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    expect(res.body.data.user.email).toBe(email);
  });

  it('should return a token with three JWT segments', async () => {
    const res = await request
      .post('/api/v1/auth/login')
      .send({ email, password });

    expect(res.status).toBe(200);
    expect((res.body.data.token as string).split('.')).toHaveLength(3);
  });

  it('should return 401 when the password is wrong', async () => {
    const res = await request
      .post('/api/v1/auth/login')
      .send({ email, password: 'WrongPassword1!' });

    expect(res.status).toBe(401);
  });

  it('should return 401 when the email does not exist', async () => {
    const res = await request
      .post('/api/v1/auth/login')
      .send({ email: 'ghost@example.com', password: 'Password1!' });

    expect(res.status).toBe(401);
  });

  it('should return 422 when email format is invalid', async () => {
    const res = await request
      .post('/api/v1/auth/login')
      .send({ email: 'bad-email', password: 'Password1!' });

    expect(res.status).toBe(422);
    expect(res.body.details).toBeDefined();
  });

  it('should not expose passwordHash in the login response', async () => {
    const res = await request
      .post('/api/v1/auth/login')
      .send({ email, password });

    expect(res.status).toBe(200);
    expect(res.body.data.user.passwordHash).toBeUndefined();
    expect(res.body.data.user.password_hash).toBeUndefined();
  });
});

// ─── POST /api/v1/auth/refresh ────────────────────────────────────────────────

describe('POST /api/v1/auth/refresh', () => {
  let email: string;
  let password: string;
  let userId: string;
  let refreshToken: string;

  beforeEach(async () => {
    const user = await registerUser();
    email = user.email;
    password = user.password;
    userId = user.userId;
    const tokens = await loginUser({ email, password });
    refreshToken = tokens.refreshToken;
  });

  afterEach(async () => {
    await db('refresh_tokens').where({ userId }).del();
    await db('users').where({ id: userId }).del();
  });

  it('should return 200 with a new JWT when given a valid refresh token', async () => {
    const res = await request
      .post('/api/v1/auth/refresh')
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
    expect((res.body.data.token as string).split('.')).toHaveLength(3);
  });

  it('should return 401 when the refresh token is invalid', async () => {
    const fake = crypto.randomBytes(40).toString('hex');

    const res = await request
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: fake });

    expect(res.status).toBe(401);
  });

  it('should return 401 when the refresh token has been revoked', async () => {
    // Revoke the token first
    await request
      .post('/api/v1/auth/logout')
      .send({ refreshToken });

    const res = await request
      .post('/api/v1/auth/refresh')
      .send({ refreshToken });

    expect(res.status).toBe(401);
  });

  it('should return 400 when refreshToken field is missing from the body', async () => {
    const res = await request
      .post('/api/v1/auth/refresh')
      .send({});

    expect(res.status).toBe(400);
  });
});

// ─── POST /api/v1/auth/logout ─────────────────────────────────────────────────

describe('POST /api/v1/auth/logout', () => {
  let email: string;
  let password: string;
  let userId: string;
  let refreshToken: string;

  beforeEach(async () => {
    const user = await registerUser();
    email = user.email;
    password = user.password;
    userId = user.userId;
    const tokens = await loginUser({ email, password });
    refreshToken = tokens.refreshToken;
  });

  afterEach(async () => {
    await db('refresh_tokens').where({ userId }).del();
    await db('users').where({ id: userId }).del();
  });

  it('should return 204 when given a valid refresh token', async () => {
    const res = await request
      .post('/api/v1/auth/logout')
      .send({ refreshToken });

    expect(res.status).toBe(204);
  });

  it('should revoke the refresh token so it cannot be used again', async () => {
    await request
      .post('/api/v1/auth/logout')
      .send({ refreshToken });

    const refreshRes = await request
      .post('/api/v1/auth/refresh')
      .send({ refreshToken });

    expect(refreshRes.status).toBe(401);
  });

  it('should return 400 when refreshToken is missing from the body', async () => {
    const res = await request
      .post('/api/v1/auth/logout')
      .send({});

    expect(res.status).toBe(400);
  });

  it('should succeed silently when given a token that does not exist', async () => {
    const fake = crypto.randomBytes(40).toString('hex');
    const res = await request
      .post('/api/v1/auth/logout')
      .send({ refreshToken: fake });

    // 204 because the service does not error on unknown tokens
    expect(res.status).toBe(204);
  });
});

// ─── GET /api/v1/me ───────────────────────────────────────────────────────────

describe('GET /api/v1/me', () => {
  let email: string;
  let password: string;
  let userId: string;
  let token: string;
  let refreshToken: string;

  beforeEach(async () => {
    const user = await registerUser();
    email = user.email;
    password = user.password;
    userId = user.userId;
    const tokens = await loginUser({ email, password });
    token = tokens.token;
    refreshToken = tokens.refreshToken;
  });

  afterEach(async () => {
    await db('refresh_tokens').where({ userId }).del();
    await db('users').where({ id: userId }).del();
  });

  it('should return 200 with the current user profile when authenticated', async () => {
    const res = await request
      .get('/api/v1/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(userId);
    expect(res.body.data.email).toBe(email);
  });

  it('should not include passwordHash in the profile response', async () => {
    const res = await request
      .get('/api/v1/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.passwordHash).toBeUndefined();
    expect(res.body.data.password_hash).toBeUndefined();
  });

  it('should return 401 when no Authorization header is provided', async () => {
    const res = await request.get('/api/v1/me');

    expect(res.status).toBe(401);
  });

  it('should return 401 when the token is malformed', async () => {
    const res = await request
      .get('/api/v1/me')
      .set('Authorization', 'Bearer this-is-not-a-jwt');

    expect(res.status).toBe(401);
  });

  it('should return 401 when the token is well-formed but signed with the wrong secret', async () => {
    const jwt = await import('jsonwebtoken');
    const badToken = jwt.default.sign(
      { userId, email, role: 'editor' },
      'wrong-secret',
      { expiresIn: '1h' },
    );

    const res = await request
      .get('/api/v1/me')
      .set('Authorization', `Bearer ${badToken}`);

    expect(res.status).toBe(401);
  });
});
