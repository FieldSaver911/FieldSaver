import { db } from '../index';
import type { Library, LibraryRowDef } from '@fieldsaver/shared';

// ─── List options ─────────────────────────────────────────────────────────────

export interface ListLibrariesOptions {
  source?: string;
  offset: number;
  limit: number;
}

export interface ListLibraryRowsOptions {
  category?: string;
  subCategory?: string;
  search?: string;
  sort: string;
  order: 'asc' | 'desc';
  offset: number;
  limit: number;
}

// ─── Library queries ──────────────────────────────────────────────────────────

export async function listLibraries(
  options: ListLibrariesOptions,
): Promise<Library[]> {
  const query = db('libraries')
    .whereNull('deletedAt')
    .offset(options.offset)
    .limit(options.limit)
    .orderBy('createdAt', 'asc');

  if (options.source) {
    query.where({ source: options.source });
  }

  return query;
}

export async function countLibraries(source?: string): Promise<number> {
  const query = db('libraries').whereNull('deletedAt').count('* as total');
  if (source) {
    query.where({ source });
  }
  const [{ total }] = await query;
  return Number(total);
}

export async function getLibraryById(id: string): Promise<Library | undefined> {
  return db('libraries').where({ id }).whereNull('deletedAt').first();
}

export async function createLibrary(data: {
  name: string;
  icon: string;
  description: string;
  color: string;
  version: string;
  source: string;
  mondayBoardId?: string | null;
  columns: object;
  categories: string[];
  subCategories: string[];
  permissions: object;
  isSystem: boolean;
  createdBy: string | null;
}): Promise<Library> {
  const [row] = await db('libraries').insert(data).returning('*');
  return row;
}

export async function updateLibrary(
  id: string,
  patch: Partial<{
    name: string;
    icon: string;
    description: string;
    color: string;
    version: string;
    mondayBoardId: string | null;
    categories: string[];
    subCategories: string[];
  }>,
): Promise<Library> {
  const [row] = await db('libraries')
    .where({ id })
    .update({ ...patch, updatedAt: db.fn.now() })
    .returning('*');
  return row;
}

export async function softDeleteLibrary(id: string): Promise<void> {
  await db('libraries').where({ id }).update({ deletedAt: db.fn.now() });
}

// ─── Library row queries ──────────────────────────────────────────────────────

export async function listLibraryRows(
  libraryId: string,
  options: ListLibraryRowsOptions,
): Promise<LibraryRowDef[]> {
  // Map schema sort values (snake_case from the enum) to actual column names
  // that knex-stringcase will translate. The schema enum uses snake_case strings
  // that match the DB column names directly, so we pass them as-is to .orderBy().
  const sortColumn = options.sort === 'export_key' ? 'exportKey'
    : options.sort === 'sort_order' ? 'sortOrder'
    : options.sort; // label, code, category — camelCase == snake_case here

  const query = db('library_rows')
    .where({ libraryId })
    .whereNull('deletedAt')
    .orderBy(sortColumn, options.order)
    .offset(options.offset)
    .limit(options.limit);

  if (options.category) {
    query.where({ category: options.category });
  }
  if (options.subCategory) {
    query.where({ subCategory: options.subCategory });
  }
  if (options.search) {
    const term = `%${options.search}%`;
    query.where((b) => {
      b.whereLike('label', term)
        .orWhereLike('exportKey', term)
        .orWhereLike('description', term);
    });
  }

  return query;
}

export async function countLibraryRows(
  libraryId: string,
  options: Pick<ListLibraryRowsOptions, 'category' | 'subCategory' | 'search'>,
): Promise<number> {
  const query = db('library_rows')
    .where({ libraryId })
    .whereNull('deletedAt')
    .count('* as total');

  if (options.category) {
    query.where({ category: options.category });
  }
  if (options.subCategory) {
    query.where({ subCategory: options.subCategory });
  }
  if (options.search) {
    const term = `%${options.search}%`;
    query.where((b) => {
      b.whereLike('label', term)
        .orWhereLike('exportKey', term)
        .orWhereLike('description', term);
    });
  }

  const [{ total }] = await query;
  return Number(total);
}

export async function getLibraryRow(
  libraryId: string,
  rowId: string,
): Promise<LibraryRowDef | undefined> {
  return db('library_rows')
    .where({ id: rowId, libraryId })
    .whereNull('deletedAt')
    .first();
}

export async function createLibraryRow(data: {
  libraryId: string;
  label: string;
  code: string;
  exportKey: string;
  description: string;
  category: string;
  subCategory: string;
  usage: string;
  elementId: string;
  sortOrder: number;
}): Promise<LibraryRowDef> {
  const [row] = await db('library_rows').insert(data).returning('*');
  return row;
}

export async function updateLibraryRow(
  libraryId: string,
  rowId: string,
  patch: Partial<{
    label: string;
    code: string;
    exportKey: string;
    description: string;
    category: string;
    subCategory: string;
    usage: string;
    elementId: string;
    sortOrder: number;
  }>,
): Promise<LibraryRowDef> {
  const [row] = await db('library_rows')
    .where({ id: rowId, libraryId })
    .update({ ...patch, updatedAt: db.fn.now() })
    .returning('*');
  return row;
}

export async function softDeleteLibraryRow(
  libraryId: string,
  rowId: string,
): Promise<void> {
  await db('library_rows')
    .where({ id: rowId, libraryId })
    .update({ deletedAt: db.fn.now() });
}

export async function bulkCreateLibraryRows(
  rows: Array<{
    libraryId: string;
    label: string;
    code: string;
    exportKey: string;
    description: string;
    category: string;
    subCategory: string;
    usage: string;
    elementId: string;
    sortOrder: number;
  }>,
): Promise<LibraryRowDef[]> {
  return db('library_rows').insert(rows).returning('*');
}
