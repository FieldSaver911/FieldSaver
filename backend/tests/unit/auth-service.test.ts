/**
 * Unit tests for auth-service.ts
 *
 * These tests run against a real PostgreSQL database. All test data is
 * created through factory helpers and cleaned up in afterEach blocks so
 * each test starts with a known, isolated state.
 *
 * No mocks for the database — per project testing rules.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as crypto from 'crypto';
import { db } from '../../src/db';
import * as authService from '../../src/services/auth-service';
import * as queries from '../../src/db/queries/auth-queries';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Creates a fully persisted user row with a real bcrypt hash.
 * The plaintext password is always 'Password1!' unless overridden.
 */
async function createTestUser(overrides: Partial<{
  email: string;
  password: string;
  name: string;
  role: string;
}> = {}): Promise<queries.UserRow & { plainPassword: string }> {
  const bcrypt = await import('bcrypt');
  const plainPassword = overrides.password ?? 'Password1!';
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  const row = await queries.createUser({
    email: overrides.email ?? `auth-svc-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`,
    passwordHash,
    name: overrides.name ?? 'Service Test User',
    role: overrides.role ?? 'editor',
  });

  return { ...row, plainPassword };
}

// ─── register ─────────────────────────────────────────────────────────────────

describe('authService.register', () => {
  const createdEmails: string[] = [];

  afterEach(async () => {
    for (const email of createdEmails) {
      await db('users').where({ email }).del();
    }
    createdEmails.length = 0;
  });

  it('should create a new user and return a safe public user object', async () => {
    const email = `reg-${Date.now()}@example.com`;
    createdEmails.push(email);

    const result = await authService.register({
      email,
      password: 'SecurePass1!',
      name: 'Registration Test',
    });

    expect(result.id).toBeDefined();
    expect(result.email).toBe(email);
    expect(result.name).toBe('Registration Test');
    expect(result.role).toBe('editor');
  });

  it('should not include passwordHash in the returned user object', async () => {
    const email = `reg-nohash-${Date.now()}@example.com`;
    createdEmails.push(email);

    const result = await authService.register({
      email,
      password: 'SecurePass1!',
      name: 'No Hash Test',
    });

    expect((result as Record<string, unknown>).passwordHash).toBeUndefined();
    expect((result as Record<string, unknown>).password_hash).toBeUndefined();
  });

  it('should persist a bcrypt-hashed password to the database', async () => {
    const bcrypt = await import('bcrypt');
    const email = `reg-hash-${Date.now()}@example.com`;
    createdEmails.push(email);
    const plainPassword = 'SecurePass1!';

    await authService.register({ email, password: plainPassword, name: 'Hash Test' });

    const dbRow = await db('users').where({ email }).first();
    expect(dbRow).toBeDefined();
    // knex-stringcase converts snake_case columns to camelCase in JS
    const storedHash = (dbRow.passwordHash ?? dbRow.password_hash) as string;
    expect(storedHash).toBeDefined();
    // The stored hash must verify against the original password
    const match = await bcrypt.compare(plainPassword, storedHash);
    expect(match).toBe(true);
    // And must not be the plaintext value
    expect(storedHash).not.toBe(plainPassword);
  });

  it('should throw a 409 AppError when the email is already registered', async () => {
    const email = `reg-dup-${Date.now()}@example.com`;
    createdEmails.push(email);

    await authService.register({ email, password: 'FirstPass1!', name: 'First' });

    await expect(
      authService.register({ email, password: 'SecondPass1!', name: 'Duplicate' }),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it('should assign the editor role by default', async () => {
    const email = `reg-role-${Date.now()}@example.com`;
    createdEmails.push(email);

    const result = await authService.register({
      email,
      password: 'SecurePass1!',
      name: 'Role Test',
    });

    expect(result.role).toBe('editor');
  });
});

// ─── login ────────────────────────────────────────────────────────────────────

describe('authService.login', () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;

  beforeEach(async () => {
    testUser = await createTestUser();
  });

  afterEach(async () => {
    await db('refresh_tokens').where({ userId: testUser.id }).del();
    await db('users').where({ id: testUser.id }).del();
  });

  it('should return a JWT token, refresh token, and public user on success', async () => {
    const result = await authService.login({
      email: testUser.email,
      password: testUser.plainPassword,
    });

    expect(result.token).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.user.id).toBe(testUser.id);
    expect(result.user.email).toBe(testUser.email);
  });

  it('should return a token with three JWT segments', async () => {
    const { token } = await authService.login({
      email: testUser.email,
      password: testUser.plainPassword,
    });

    expect(token.split('.')).toHaveLength(3);
  });

  it('should persist the hashed refresh token to refresh_tokens table', async () => {
    const { refreshToken } = await authService.login({
      email: testUser.email,
      password: testUser.plainPassword,
    });

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    // knex-stringcase wraps identifiers so the query must use camelCase
    const stored = await db('refresh_tokens').where({ tokenHash }).first();
    expect(stored).toBeDefined();
    // knex-stringcase converts userId from user_id column
    expect(stored.userId ?? stored.user_id).toBe(testUser.id);
  });

  it('should throw a 401 AppError when the password is wrong', async () => {
    await expect(
      authService.login({
        email: testUser.email,
        password: 'WrongPassword99!',
      }),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it('should throw a 401 AppError when the email does not exist', async () => {
    await expect(
      authService.login({
        email: 'nonexistent@example.com',
        password: 'SomePassword1!',
      }),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it('should not expose passwordHash on the returned user', async () => {
    const { user } = await authService.login({
      email: testUser.email,
      password: testUser.plainPassword,
    });

    expect((user as Record<string, unknown>).passwordHash).toBeUndefined();
    expect((user as Record<string, unknown>).password_hash).toBeUndefined();
  });
});

// ─── logout ───────────────────────────────────────────────────────────────────

describe('authService.logout', () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;

  beforeEach(async () => {
    testUser = await createTestUser();
  });

  afterEach(async () => {
    await db('refresh_tokens').where({ userId: testUser.id }).del();
    await db('users').where({ id: testUser.id }).del();
  });

  it('should mark a valid refresh token as revoked in the database', async () => {
    const { refreshToken } = await authService.login({
      email: testUser.email,
      password: testUser.plainPassword,
    });

    await authService.logout(refreshToken);

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    // knex-stringcase wraps identifiers to camelCase
    const stored = await db('refresh_tokens').where({ tokenHash }).first();
    // knex-stringcase converts revoked_at to revokedAt
    expect(stored.revokedAt ?? stored.revoked_at).not.toBeNull();
  });

  it('should succeed silently when given a token that was never stored', async () => {
    const nonExistentToken = crypto.randomBytes(40).toString('hex');
    // Must not throw
    await expect(authService.logout(nonExistentToken)).resolves.toBeUndefined();
  });

  it('should succeed silently when called twice with the same token', async () => {
    const { refreshToken } = await authService.login({
      email: testUser.email,
      password: testUser.plainPassword,
    });

    await authService.logout(refreshToken);
    await expect(authService.logout(refreshToken)).resolves.toBeUndefined();
  });
});

// ─── refresh ──────────────────────────────────────────────────────────────────

describe('authService.refresh', () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;

  beforeEach(async () => {
    testUser = await createTestUser();
  });

  afterEach(async () => {
    await db('refresh_tokens').where({ userId: testUser.id }).del();
    await db('users').where({ id: testUser.id }).del();
  });

  it('should return a new JWT token when given a valid refresh token', async () => {
    const { refreshToken } = await authService.login({
      email: testUser.email,
      password: testUser.plainPassword,
    });

    const result = await authService.refresh(refreshToken);

    expect(result.token).toBeDefined();
    expect(result.token.split('.')).toHaveLength(3);
  });

  it('should throw a 401 AppError when given a revoked refresh token', async () => {
    const { refreshToken } = await authService.login({
      email: testUser.email,
      password: testUser.plainPassword,
    });
    await authService.logout(refreshToken);

    await expect(authService.refresh(refreshToken)).rejects.toMatchObject({ statusCode: 401 });
  });

  it('should throw a 401 AppError when the token does not exist', async () => {
    const fake = crypto.randomBytes(40).toString('hex');
    await expect(authService.refresh(fake)).rejects.toMatchObject({ statusCode: 401 });
  });

  it('should throw a 401 AppError when the refresh token is expired', async () => {
    const { refreshToken } = await authService.login({
      email: testUser.email,
      password: testUser.plainPassword,
    });

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    // Back-date the expiry to the past (knex-stringcase wraps column identifiers to camelCase)
    await db('refresh_tokens')
      .where({ tokenHash })
      .update({ expiresAt: new Date('2000-01-01') });

    await expect(authService.refresh(refreshToken)).rejects.toMatchObject({ statusCode: 401 });
  });
});

// ─── getMe ────────────────────────────────────────────────────────────────────

describe('authService.getMe', () => {
  let testUser: Awaited<ReturnType<typeof createTestUser>>;

  beforeEach(async () => {
    testUser = await createTestUser();
  });

  afterEach(async () => {
    await db('users').where({ id: testUser.id }).del();
  });

  it('should return the public user object for a valid user ID', async () => {
    const result = await authService.getMe(testUser.id);

    expect(result.id).toBe(testUser.id);
    expect(result.email).toBe(testUser.email);
    expect(result.name).toBe(testUser.name);
  });

  it('should not include passwordHash in the returned user', async () => {
    const result = await authService.getMe(testUser.id);

    expect((result as Record<string, unknown>).passwordHash).toBeUndefined();
    expect((result as Record<string, unknown>).password_hash).toBeUndefined();
  });

  it('should throw a 404 AppError when the user ID does not exist', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    await expect(authService.getMe(fakeId)).rejects.toMatchObject({ statusCode: 404 });
  });

  it('should throw a 404 AppError when the user is soft-deleted', async () => {
    await db('users')
      .where({ id: testUser.id })
      .update({ deleted_at: db.fn.now() });

    await expect(authService.getMe(testUser.id)).rejects.toMatchObject({ statusCode: 404 });
  });
});
