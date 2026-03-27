import { z } from 'zod';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').max(100),
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof LoginSchema>;

// ─── Forms ────────────────────────────────────────────────────────────────────

export const CreateFormSchema = z.object({
  name: z.string().min(1).max(200).default('Untitled Form'),
  description: z.string().max(2000).optional().default(''),
});
export type CreateFormInput = z.infer<typeof CreateFormSchema>;

export const UpdateFormSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  data: z.record(z.unknown()).optional(),
  settings: z.record(z.unknown()).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
});
export type UpdateFormInput = z.infer<typeof UpdateFormSchema>;

// PATCH — only metadata fields; data/settings must go through PUT
export const PatchFormSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  settings: z.record(z.unknown()).optional(),
});
export type PatchFormInput = z.infer<typeof PatchFormSchema>;

export const ListFormsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  search: z.string().max(200).optional(),
  sort: z.enum(['created_at', 'updated_at', 'name']).default('updated_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
});
export type ListFormsQuery = z.infer<typeof ListFormsQuerySchema>;

// ─── Libraries ───────────────────────────────────────────────────────────────

export const CreateLibrarySchema = z.object({
  name: z.string().min(1).max(200),
  icon: z.string().max(10).default('📚'),
  description: z.string().max(2000).optional().default(''),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#0073EA'),
  version: z.string().max(20).default('1.0'),
  source: z.enum(['custom', 'monday_board']).default('custom'),
  mondayBoardId: z.string().optional().nullable(),
  categories: z.array(z.string()).default([]),
  subCategories: z.array(z.string()).default([]),
});
export type CreateLibraryInput = z.infer<typeof CreateLibrarySchema>;

export const UpdateLibrarySchema = CreateLibrarySchema.partial();
export type UpdateLibraryInput = z.infer<typeof UpdateLibrarySchema>;

// ─── Library Rows ─────────────────────────────────────────────────────────────

export const CreateLibraryRowSchema = z.object({
  label: z.string().min(1).max(500),
  code: z.string().max(50).default(''),
  exportKey: z.string().min(1).max(500),
  description: z.string().max(2000).default(''),
  category: z.string().max(100).default(''),
  subCategory: z.string().max(100).default(''),
  usage: z.string().max(50).default('Optional'),
  elementId: z.string().max(100).default(''),
  sortOrder: z.number().int().default(0),
});
export type CreateLibraryRowInput = z.infer<typeof CreateLibraryRowSchema>;

export const UpdateLibraryRowSchema = CreateLibraryRowSchema.partial();
export type UpdateLibraryRowInput = z.infer<typeof UpdateLibraryRowSchema>;

export const BulkCreateLibraryRowsSchema = z.object({
  rows: z.array(CreateLibraryRowSchema).min(1).max(500),
});
export type BulkCreateLibraryRowsInput = z.infer<typeof BulkCreateLibraryRowsSchema>;

export const ListLibraryRowsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(500).default(200),
  category: z.string().optional(),
  subCategory: z.string().optional(),
  search: z.string().max(200).optional(),
  sort: z.enum(['label', 'code', 'export_key', 'category', 'sort_order']).default('sort_order'),
  order: z.enum(['asc', 'desc']).default('asc'),
});
export type ListLibraryRowsQuery = z.infer<typeof ListLibraryRowsQuerySchema>;

// ─── Submissions ─────────────────────────────────────────────────────────────

export const CreateSubmissionSchema = z.object({
  data: z.record(z.unknown()),
  notValues: z.record(z.string()).default({}),
  source: z.enum(['web', 'monday_app', 'api']).default('web'),
});
export type CreateSubmissionInput = z.infer<typeof CreateSubmissionSchema>;

// ─── Pagination ──────────────────────────────────────────────────────────────

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
