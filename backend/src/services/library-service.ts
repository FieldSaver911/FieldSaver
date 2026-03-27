import { AppError } from '../middleware/error-handler';
import type { Library, LibraryRowDef, PaginatedResponse } from '@fieldsaver/shared';
import type {
  CreateLibraryInput,
  UpdateLibraryInput,
  CreateLibraryRowInput,
  UpdateLibraryRowInput,
  ListLibraryRowsQuery,
} from '@fieldsaver/shared';
import * as queries from '../db/queries/library-queries';

// ─── Default permissions ──────────────────────────────────────────────────────

const DEFAULT_PERMISSIONS = {
  canView: ['admin', 'editor', 'viewer'] as const,
  canEdit: ['admin', 'editor'] as const,
  canDelete: ['admin'] as const,
};

// ─── listLibraries ────────────────────────────────────────────────────────────

export async function listLibraries(
  _userId: string,
  options: { page: number; limit: number; source?: string },
): Promise<PaginatedResponse<Library>> {
  const { page, limit, source } = options;
  const offset = (page - 1) * limit;

  const [rows, total] = await Promise.all([
    queries.listLibraries({ source, offset, limit }),
    queries.countLibraries(source),
  ]);

  return {
    data: rows,
    meta: { total, page, limit },
  };
}

// ─── getLibraryById ───────────────────────────────────────────────────────────

export async function getLibraryById(id: string): Promise<Library> {
  const library = await queries.getLibraryById(id);
  if (!library) throw new AppError('Library not found', 404);

  // Eager-load rows (no pagination — this is the detail view)
  const rows = await queries.listLibraryRows(id, {
    sort: 'sortOrder',
    order: 'asc',
    offset: 0,
    limit: 10000,
  });

  return { ...library, rows };
}

// ─── createLibrary ────────────────────────────────────────────────────────────

export async function createLibrary(
  input: CreateLibraryInput,
  userId: string,
): Promise<Library> {
  const library = await queries.createLibrary({
    name: input.name,
    icon: input.icon,
    description: input.description ?? '',
    color: input.color,
    version: input.version,
    source: input.source,
    mondayBoardId: input.mondayBoardId ?? null,
    columns: [],
    categories: input.categories,
    subCategories: input.subCategories,
    permissions: DEFAULT_PERMISSIONS,
    isSystem: false,
    createdBy: userId,
  });

  return library;
}

// ─── updateLibrary ────────────────────────────────────────────────────────────

export async function updateLibrary(
  id: string,
  patch: UpdateLibraryInput,
): Promise<Library> {
  // Verify exists before attempting update
  await getLibraryById(id);

  const library = await queries.updateLibrary(id, {
    name: patch.name,
    icon: patch.icon,
    description: patch.description,
    color: patch.color,
    version: patch.version,
    mondayBoardId: patch.mondayBoardId,
    categories: patch.categories,
    subCategories: patch.subCategories,
  });

  return library;
}

// ─── deleteLibrary ────────────────────────────────────────────────────────────

export async function deleteLibrary(id: string): Promise<void> {
  // Verify exists before soft-deleting
  await getLibraryById(id);
  await queries.softDeleteLibrary(id);
}

// ─── listLibraryRows ──────────────────────────────────────────────────────────

export async function listLibraryRows(
  libraryId: string,
  query: ListLibraryRowsQuery,
): Promise<PaginatedResponse<LibraryRowDef>> {
  // Verify library exists
  const library = await queries.getLibraryById(libraryId);
  if (!library) throw new AppError('Library not found', 404);

  const { page, limit, category, subCategory, search, sort, order } = query;
  const offset = (page - 1) * limit;

  const [rows, total] = await Promise.all([
    queries.listLibraryRows(libraryId, {
      category,
      subCategory,
      search,
      sort,
      order,
      offset,
      limit,
    }),
    queries.countLibraryRows(libraryId, { category, subCategory, search }),
  ]);

  return {
    data: rows,
    meta: { total, page, limit },
  };
}

// ─── addLibraryRow ────────────────────────────────────────────────────────────

export async function addLibraryRow(
  libraryId: string,
  input: CreateLibraryRowInput,
): Promise<LibraryRowDef> {
  const library = await queries.getLibraryById(libraryId);
  if (!library) throw new AppError('Library not found', 404);

  return queries.createLibraryRow({
    libraryId,
    label: input.label,
    code: input.code,
    exportKey: input.exportKey,
    description: input.description,
    category: input.category,
    subCategory: input.subCategory,
    usage: input.usage,
    elementId: input.elementId,
    sortOrder: input.sortOrder,
  });
}

// ─── updateLibraryRow ─────────────────────────────────────────────────────────

export async function updateLibraryRow(
  libraryId: string,
  rowId: string,
  patch: UpdateLibraryRowInput,
): Promise<LibraryRowDef> {
  const existing = await queries.getLibraryRow(libraryId, rowId);
  if (!existing) throw new AppError('Library row not found', 404);

  return queries.updateLibraryRow(libraryId, rowId, {
    label: patch.label,
    code: patch.code,
    exportKey: patch.exportKey,
    description: patch.description,
    category: patch.category,
    subCategory: patch.subCategory,
    usage: patch.usage,
    elementId: patch.elementId,
    sortOrder: patch.sortOrder,
  });
}

// ─── deleteLibraryRow ─────────────────────────────────────────────────────────

export async function deleteLibraryRow(
  libraryId: string,
  rowId: string,
): Promise<void> {
  const existing = await queries.getLibraryRow(libraryId, rowId);
  if (!existing) throw new AppError('Library row not found', 404);

  await queries.softDeleteLibraryRow(libraryId, rowId);
}

// ─── bulkCreateLibraryRows ────────────────────────────────────────────────────

export async function bulkCreateLibraryRows(
  libraryId: string,
  rows: CreateLibraryRowInput[],
): Promise<LibraryRowDef[]> {
  const library = await queries.getLibraryById(libraryId);
  if (!library) throw new AppError('Library not found', 404);

  const insertData = rows.map((row) => ({
    libraryId,
    label: row.label,
    code: row.code,
    exportKey: row.exportKey,
    description: row.description,
    category: row.category,
    subCategory: row.subCategory,
    usage: row.usage,
    elementId: row.elementId,
    sortOrder: row.sortOrder,
  }));

  return queries.bulkCreateLibraryRows(insertData);
}
