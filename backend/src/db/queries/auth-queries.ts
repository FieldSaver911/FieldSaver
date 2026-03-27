import { db } from '../index';
import type { User } from '@fieldsaver/shared';

// ─── User row type as returned from the DB ────────────────────────────────────
// Includes passwordHash which is never surfaced in the shared User type.
export interface UserRow extends User {
  passwordHash: string;
}

// ─── Refresh token row type ───────────────────────────────────────────────────
export interface RefreshTokenRow {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
}

// ─── User queries ─────────────────────────────────────────────────────────────

export async function createUser(data: {
  email: string;
  passwordHash: string;
  name: string;
  role?: string;
}): Promise<UserRow> {
  const [row] = await db('users')
    .insert(data)
    .returning('*');
  return row;
}

export async function getUserByEmail(email: string): Promise<UserRow | undefined> {
  return db('users')
    .where({ email })
    .whereNull('deletedAt')
    .first();
}

export async function getUserById(id: string): Promise<UserRow | undefined> {
  return db('users')
    .where({ id })
    .whereNull('deletedAt')
    .first();
}

// ─── Refresh token queries ────────────────────────────────────────────────────

export async function createRefreshToken(data: {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}): Promise<RefreshTokenRow> {
  const [row] = await db('refresh_tokens')
    .insert(data)
    .returning('*');
  return row;
}

export async function getRefreshToken(tokenHash: string): Promise<RefreshTokenRow | undefined> {
  return db('refresh_tokens')
    .where({ tokenHash })
    .whereNull('revokedAt')
    .first();
}

export async function revokeRefreshToken(tokenHash: string): Promise<void> {
  await db('refresh_tokens')
    .where({ tokenHash })
    .update({ revokedAt: db.fn.now() });
}
