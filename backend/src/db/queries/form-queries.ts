import { db } from '../index';
import type { Form } from '@fieldsaver/shared';

// ─── List options ─────────────────────────────────────────────────────────────

export interface ListFormsOptions {
  status?: string;
  search?: string;
  sort: string;
  order: 'asc' | 'desc';
  offset: number;
  limit: number;
}

// ─── listForms ────────────────────────────────────────────────────────────────

export async function listForms(
  userId: string,
  options: ListFormsOptions,
): Promise<Form[]> {
  // Map schema sort enum values (snake_case) to camelCase column names
  const sortColumn = options.sort === 'created_at' ? 'createdAt'
    : options.sort === 'updated_at' ? 'updatedAt'
    : options.sort; // 'name' stays as-is

  const query = db('forms')
    .where({ userId })
    .whereNull('deletedAt')
    .orderBy(sortColumn, options.order)
    .offset(options.offset)
    .limit(options.limit);

  if (options.status) {
    query.where({ status: options.status });
  }

  if (options.search) {
    const term = `%${options.search}%`;
    query.where((b) => {
      b.whereLike('name', term).orWhereLike('description', term);
    });
  }

  return query;
}

// ─── countUserForms ───────────────────────────────────────────────────────────

export async function countUserForms(
  userId: string,
  options: Pick<ListFormsOptions, 'status' | 'search'>,
): Promise<number> {
  const query = db('forms')
    .where({ userId })
    .whereNull('deletedAt')
    .count('* as total');

  if (options.status) {
    query.where({ status: options.status });
  }

  if (options.search) {
    const term = `%${options.search}%`;
    query.where((b) => {
      b.whereLike('name', term).orWhereLike('description', term);
    });
  }

  const [{ total }] = await query;
  return Number(total);
}

// ─── getFormById ──────────────────────────────────────────────────────────────

export async function getFormById(id: string): Promise<Form | undefined> {
  return db('forms').where({ id }).whereNull('deletedAt').first();
}

// ─── createForm ───────────────────────────────────────────────────────────────

export async function createForm(data: {
  userId: string;
  name: string;
  description: string;
  data: object;
  settings: object;
  status: string;
  version: number;
}): Promise<Form> {
  const [row] = await db('forms').insert(data).returning('*');
  return row;
}

// ─── updateForm ───────────────────────────────────────────────────────────────

export async function updateForm(
  id: string,
  patch: Partial<{
    name: string;
    description: string;
    data: object;
    settings: object;
    status: string;
    publishedAt: string | null;
    version: number;
  }>,
): Promise<Form> {
  const [row] = await db('forms')
    .where({ id })
    .update({ ...patch, updatedAt: db.fn.now() })
    .returning('*');
  return row;
}

// ─── softDeleteForm ───────────────────────────────────────────────────────────

export async function softDeleteForm(id: string): Promise<void> {
  await db('forms').where({ id }).update({ deletedAt: db.fn.now() });
}
