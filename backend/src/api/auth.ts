import type { Request, Response, NextFunction } from 'express';
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/error-handler';
import { RegisterSchema, LoginSchema } from '@fieldsaver/shared';
import * as authService from '../services/auth-service';

const router = Router();

// ─── POST /auth/register ──────────────────────────────────────────────────────
// Public. Creates a new user account.
// Returns 201 with the new user (no tokens — caller must login separately).
router.post('/register', async (req, res, next) => {
  try {
    const input = RegisterSchema.parse(req.body);
    const user = await authService.register(input);
    res.status(201).json({ data: user });
  } catch (error) {
    next(error);
  }
});

// ─── POST /auth/login ─────────────────────────────────────────────────────────
// Public. Validates credentials and returns a JWT + refresh token.
router.post('/login', async (req, res, next) => {
  try {
    const input = LoginSchema.parse(req.body);
    const result = await authService.login(input);
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
});

// ─── POST /auth/refresh ───────────────────────────────────────────────────────
// Public. Exchanges a valid refresh token for a new short-lived JWT.
// The raw refresh token must be sent in the request body as { refreshToken }.
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body as { refreshToken?: unknown };
    if (typeof refreshToken !== 'string' || !refreshToken) {
      return next(new AppError('refreshToken is required', 400));
    }
    const result = await authService.refresh(refreshToken);
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
});

// ─── POST /auth/logout ────────────────────────────────────────────────────────
// Public (no JWT needed — the point is to revoke the refresh token).
// The raw refresh token must be sent in the request body as { refreshToken }.
router.post('/logout', async (req, res, next) => {
  try {
    const { refreshToken } = req.body as { refreshToken?: unknown };
    if (typeof refreshToken !== 'string' || !refreshToken) {
      return next(new AppError('refreshToken is required', 400));
    }
    await authService.logout(refreshToken);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;

// ─── meHandler ────────────────────────────────────────────────────────────────
// Exported separately so app.ts can mount it at GET /api/v1/me per the API
// convention (which places /me outside the /auth prefix).
// In app.ts: app.get('/api/v1/me', authenticate, meHandler);
export async function meHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await authService.getMe(req.user!.userId);
    res.status(200).json({ data: user });
  } catch (error) {
    next(error);
  }
}
