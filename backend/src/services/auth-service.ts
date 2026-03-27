import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppError } from '../middleware/error-handler';
import type { JwtPayload } from '../middleware/auth';
import type { User } from '@fieldsaver/shared';
import type { RegisterInput, LoginInput } from '@fieldsaver/shared';
import * as queries from '../db/queries/auth-queries';

const BCRYPT_ROUNDS = 12;
const JWT_EXPIRY = '8h';
const REFRESH_TOKEN_DAYS = 30;

// ─── Public return shapes ─────────────────────────────────────────────────────

/** Safe user object — never includes passwordHash */
export type PublicUser = Omit<User, 'deletedAt'>;

export interface AuthTokens {
  token: string;
  refreshToken: string;
}

export interface LoginResult {
  token: string;
  refreshToken: string;
  user: PublicUser;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new AppError('JWT_SECRET is not configured', 500);
  return secret;
}

function signJwt(payload: JwtPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRY });
}

function toPublicUser(row: queries.UserRow): PublicUser {
  const { passwordHash: _pw, deletedAt: _del, ...safe } = row as queries.UserRow & { deletedAt: string | null };
  return safe as PublicUser;
}

// ─── register ─────────────────────────────────────────────────────────────────

export async function register(input: RegisterInput): Promise<PublicUser> {
  const existing = await queries.getUserByEmail(input.email);
  if (existing) {
    throw new AppError('An account with that email already exists', 409);
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  const userRow = await queries.createUser({
    email: input.email,
    passwordHash,
    name: input.name,
    role: 'editor',
  });

  return toPublicUser(userRow);
}

// ─── login ────────────────────────────────────────────────────────────────────

export async function login(input: LoginInput): Promise<LoginResult> {
  const userRow = await queries.getUserByEmail(input.email);

  // Use a constant-time compare to avoid user enumeration timing attacks.
  // When the user doesn't exist we still run bcrypt.compare against a dummy
  // hash so the response time is indistinguishable.
  const DUMMY_HASH = '$2b$12$invalidhashplaceholderXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
  const hashToCompare = userRow?.passwordHash ?? DUMMY_HASH;
  const match = await bcrypt.compare(input.password, hashToCompare);

  if (!userRow || !match) {
    throw new AppError('Invalid email or password', 401);
  }

  const payload: JwtPayload = {
    userId: userRow.id,
    email: userRow.email,
    role: userRow.role,
  };

  const token = signJwt(payload);
  const rawToken = crypto.randomBytes(40).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_DAYS);

  await queries.createRefreshToken({
    userId: userRow.id,
    tokenHash,
    expiresAt,
  });

  return {
    token,
    refreshToken: rawToken,
    user: toPublicUser(userRow),
  };
}

// ─── refresh ──────────────────────────────────────────────────────────────────

export async function refresh(rawRefreshToken: string): Promise<{ token: string }> {
  const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
  const storedToken = await queries.getRefreshToken(tokenHash);

  if (!storedToken) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  if (new Date(storedToken.expiresAt) < new Date()) {
    throw new AppError('Refresh token has expired', 401);
  }

  const userRow = await queries.getUserById(storedToken.userId);
  if (!userRow) {
    throw new AppError('User not found', 401);
  }

  const payload: JwtPayload = {
    userId: userRow.id,
    email: userRow.email,
    role: userRow.role,
  };

  const token = signJwt(payload);
  return { token };
}

// ─── logout ───────────────────────────────────────────────────────────────────

export async function logout(rawRefreshToken: string): Promise<void> {
  const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
  // Silently succeeds even if the token was already revoked or never existed —
  // the client's intent (logged out) is already satisfied.
  await queries.revokeRefreshToken(tokenHash);
}

// ─── getMe ────────────────────────────────────────────────────────────────────

export async function getMe(userId: string): Promise<PublicUser> {
  const userRow = await queries.getUserById(userId);
  if (!userRow) {
    throw new AppError('User not found', 404);
  }
  return toPublicUser(userRow);
}
