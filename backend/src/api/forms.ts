import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  CreateFormSchema,
  UpdateFormSchema,
  PatchFormSchema,
  ListFormsQuerySchema,
} from '@fieldsaver/shared';
import * as formService from '../services/form-service';

const router = Router();

// All form endpoints require authentication
router.use(authenticate);

// ─── GET /forms ───────────────────────────────────────────────────────────────
// List all forms for the authenticated user (paginated).
// Supports ?page=, ?limit=, ?status=, ?search=, ?sort=, ?order=
router.get('/', async (req, res, next) => {
  try {
    const query = ListFormsQuerySchema.parse(req.query);
    const result = await formService.listForms(req.user!.userId, query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// ─── POST /forms ──────────────────────────────────────────────────────────────
// Create a new draft form with default empty tree.
router.post('/', async (req, res, next) => {
  try {
    const input = CreateFormSchema.parse(req.body);
    const form = await formService.createForm(input, req.user!.userId);
    res.status(201).json({ data: form });
  } catch (error) {
    next(error);
  }
});

// ─── GET /forms/:id ───────────────────────────────────────────────────────────
// Fetch a single form with its complete JSONB tree.
router.get('/:id', async (req, res, next) => {
  try {
    const form = await formService.getFormById(req.params.id);
    res.status(200).json({ data: form });
  } catch (error) {
    next(error);
  }
});

// ─── PUT /forms/:id ───────────────────────────────────────────────────────────
// Full replacement — replaces name, description, data, settings, and/or status.
router.put('/:id', async (req, res, next) => {
  try {
    const input = UpdateFormSchema.parse(req.body);
    const form = await formService.updateForm(req.params.id, input);
    res.status(200).json({ data: form });
  } catch (error) {
    next(error);
  }
});

// ─── PATCH /forms/:id ─────────────────────────────────────────────────────────
// Partial update — only name, description, and/or settings.
// Use PUT to update the full form tree (data field).
router.patch('/:id', async (req, res, next) => {
  try {
    const input = PatchFormSchema.parse(req.body);
    const form = await formService.patchForm(req.params.id, input);
    res.status(200).json({ data: form });
  } catch (error) {
    next(error);
  }
});

// ─── DELETE /forms/:id ────────────────────────────────────────────────────────
// Soft-delete a form (sets deleted_at).
router.delete('/:id', async (req, res, next) => {
  try {
    await formService.deleteForm(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// ─── POST /forms/:id/publish ──────────────────────────────────────────────────
// Publish a draft form — status → "published", published_at set, version bumped.
router.post('/:id/publish', async (req, res, next) => {
  try {
    const form = await formService.publishForm(req.params.id);
    res.status(200).json({ data: form });
  } catch (error) {
    next(error);
  }
});

// ─── POST /forms/:id/duplicate ────────────────────────────────────────────────
// Clone a form — new UUID, name appended with "(Copy)", status reset to draft.
router.post('/:id/duplicate', async (req, res, next) => {
  try {
    const form = await formService.duplicateForm(req.params.id, req.user!.userId);
    res.status(201).json({ data: form });
  } catch (error) {
    next(error);
  }
});

// ─── GET /forms/:id/export ────────────────────────────────────────────────────
// Return the form JSON alongside a flat { exportKey → field metadata } map
// derived from libraryRows on every field in the form tree.
router.get('/:id/export', async (req, res, next) => {
  try {
    const { form, keyMap } = await formService.exportKeyMap(req.params.id);
    res.status(200).json({ data: { form, keyMap } });
  } catch (error) {
    next(error);
  }
});

export default router;
