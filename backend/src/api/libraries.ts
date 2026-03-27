import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import {
  CreateLibrarySchema,
  UpdateLibrarySchema,
  CreateLibraryRowSchema,
  UpdateLibraryRowSchema,
  BulkCreateLibraryRowsSchema,
  ListLibraryRowsQuerySchema,
  PaginationQuerySchema,
} from '@fieldsaver/shared';
import { z } from 'zod';
import * as libraryService from '../services/library-service';

const router = Router();

// All library endpoints require authentication
router.use(authenticate);

// ─── List libraries query schema ──────────────────────────────────────────────

const ListLibrariesQuerySchema = PaginationQuerySchema.extend({
  source: z.enum(['builtin', 'monday_board', 'custom']).optional(),
});

// ─── GET /libraries ───────────────────────────────────────────────────────────
// List all libraries visible to the authenticated user.
// Supports ?page=, ?limit=, ?source=
router.get('/', async (req, res, next) => {
  try {
    const query = ListLibrariesQuerySchema.parse(req.query);
    const result = await libraryService.listLibraries(req.user!.userId, {
      page: query.page,
      limit: query.limit,
      source: query.source,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// ─── POST /libraries ──────────────────────────────────────────────────────────
// Create a new library. Admin and editor roles only.
router.post('/', requireRole('admin', 'editor'), async (req, res, next) => {
  try {
    const input = CreateLibrarySchema.parse(req.body);
    const library = await libraryService.createLibrary(input, req.user!.userId);
    res.status(201).json({ data: library });
  } catch (error) {
    next(error);
  }
});

// ─── GET /libraries/:id ───────────────────────────────────────────────────────
// Get a single library with all of its rows eager-loaded.
router.get('/:id', async (req, res, next) => {
  try {
    const library = await libraryService.getLibraryById(req.params.id);
    res.status(200).json({ data: library });
  } catch (error) {
    next(error);
  }
});

// ─── PUT /libraries/:id ───────────────────────────────────────────────────────
// Full replacement of library metadata (rows are managed separately).
// Admin and editor roles only.
router.put('/:id', requireRole('admin', 'editor'), async (req, res, next) => {
  try {
    const input = UpdateLibrarySchema.parse(req.body);
    const library = await libraryService.updateLibrary(req.params.id, input);
    res.status(200).json({ data: library });
  } catch (error) {
    next(error);
  }
});

// ─── DELETE /libraries/:id ────────────────────────────────────────────────────
// Soft-delete a library. Admin only.
router.delete('/:id', requireRole('admin'), async (req, res, next) => {
  try {
    await libraryService.deleteLibrary(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// ─── POST /libraries/:id/rows/bulk ────────────────────────────────────────────
// Bulk-create up to 500 rows in a single request. Must be registered BEFORE
// the /:id/rows/:rowId route so Express doesn't treat "bulk" as a rowId.
router.post(
  '/:id/rows/bulk',
  requireRole('admin', 'editor'),
  async (req, res, next) => {
    try {
      const input = BulkCreateLibraryRowsSchema.parse(req.body);
      const rows = await libraryService.bulkCreateLibraryRows(
        req.params.id,
        input.rows,
      );
      res.status(201).json({ data: rows });
    } catch (error) {
      next(error);
    }
  },
);

// ─── GET /libraries/:id/rows ──────────────────────────────────────────────────
// List rows for a library. Supports ?category=, ?subCategory=, ?search=,
// ?sort=, ?order=, ?page=, ?limit=
router.get('/:id/rows', async (req, res, next) => {
  try {
    const query = ListLibraryRowsQuerySchema.parse(req.query);
    const result = await libraryService.listLibraryRows(req.params.id, query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// ─── POST /libraries/:id/rows ─────────────────────────────────────────────────
// Create a single row. Admin and editor roles only.
router.post(
  '/:id/rows',
  requireRole('admin', 'editor'),
  async (req, res, next) => {
    try {
      const input = CreateLibraryRowSchema.parse(req.body);
      const row = await libraryService.addLibraryRow(req.params.id, input);
      res.status(201).json({ data: row });
    } catch (error) {
      next(error);
    }
  },
);

// ─── PUT /libraries/:id/rows/:rowId ──────────────────────────────────────────
// Update a single row. Admin and editor roles only.
router.put(
  '/:id/rows/:rowId',
  requireRole('admin', 'editor'),
  async (req, res, next) => {
    try {
      const input = UpdateLibraryRowSchema.parse(req.body);
      const row = await libraryService.updateLibraryRow(
        req.params.id,
        req.params.rowId,
        input,
      );
      res.status(200).json({ data: row });
    } catch (error) {
      next(error);
    }
  },
);

// ─── DELETE /libraries/:id/rows/:rowId ───────────────────────────────────────
// Soft-delete a single row. Admin only.
router.delete(
  '/:id/rows/:rowId',
  requireRole('admin'),
  async (req, res, next) => {
    try {
      await libraryService.deleteLibraryRow(req.params.id, req.params.rowId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
);

export default router;
