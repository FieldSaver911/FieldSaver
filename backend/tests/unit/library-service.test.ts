/**
 * Unit tests for library-service.ts
 *
 * These tests run against a real PostgreSQL database. All test data is
 * created through the factory helpers in tests/factories.ts and cleaned up in
 * afterEach blocks so each test starts with a known, isolated state.
 *
 * No database mocks — per project testing rules.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '../../src/db';
import * as libraryService from '../../src/services/library-service';
import { makeLibrary, makeLibraryRow, makeUser } from '../factories';

// ─── DB-level helpers ─────────────────────────────────────────────────────────

async function insertUser() {
  const data = makeUser();
  const [row] = await db('users').insert(data).returning('*');
  return row;
}

async function insertLibrary(overrides: Record<string, unknown> = {}) {
  const data = makeLibrary(overrides);
  const [row] = await db('libraries').insert(data).returning('*');
  return row;
}

async function insertLibraryRow(libraryId: string, overrides: Record<string, unknown> = {}) {
  const data = makeLibraryRow(libraryId, overrides);
  const [row] = await db('library_rows').insert(data).returning('*');
  return row;
}

// ─── listLibraries ────────────────────────────────────────────────────────────

describe('libraryService.listLibraries', () => {
  const libraryIds: string[] = [];
  let userId: string;

  beforeEach(async () => {
    const user = await insertUser();
    userId = user.id;
  });

  afterEach(async () => {
    for (const id of libraryIds) {
      await db('library_rows').where({ library_id: id }).del();
      await db('libraries').where({ id }).del();
    }
    libraryIds.length = 0;
    await db('users').where({ id: userId }).del();
  });

  it('should return libraries visible to the user in a paginated envelope', async () => {
    const lib = await insertLibrary({ source: 'custom' });
    libraryIds.push(lib.id);

    const result = await libraryService.listLibraries(userId, { page: 1, limit: 50 });

    expect(result.data).toBeInstanceOf(Array);
    expect(result.meta).toBeDefined();
    expect(result.meta.page).toBe(1);
    expect(result.meta.limit).toBe(50);
    expect(typeof result.meta.total).toBe('number');
    const ids = result.data.map((l) => l.id);
    expect(ids).toContain(lib.id);
  });

  it('should paginate correctly by limiting results', async () => {
    const lib1 = await insertLibrary({ source: 'custom' });
    const lib2 = await insertLibrary({ source: 'custom' });
    const lib3 = await insertLibrary({ source: 'custom' });
    libraryIds.push(lib1.id, lib2.id, lib3.id);

    const result = await libraryService.listLibraries(userId, { page: 1, limit: 2 });

    expect(result.data).toHaveLength(2);
    expect(result.meta.limit).toBe(2);
  });

  it('should return only builtin libraries when source=builtin is supplied', async () => {
    const builtin = await insertLibrary({ source: 'builtin' });
    const custom = await insertLibrary({ source: 'custom' });
    libraryIds.push(builtin.id, custom.id);

    const result = await libraryService.listLibraries(userId, { page: 1, limit: 50, source: 'builtin' });

    const ids = result.data.map((l) => l.id);
    expect(ids).toContain(builtin.id);
    expect(ids).not.toContain(custom.id);
  });

  it('should return only custom libraries when source=custom is supplied', async () => {
    const builtin = await insertLibrary({ source: 'builtin' });
    const custom = await insertLibrary({ source: 'custom' });
    libraryIds.push(builtin.id, custom.id);

    const result = await libraryService.listLibraries(userId, { page: 1, limit: 50, source: 'custom' });

    const ids = result.data.map((l) => l.id);
    expect(ids).toContain(custom.id);
    expect(ids).not.toContain(builtin.id);
  });

  it('should return only monday_board libraries when source=monday_board is supplied', async () => {
    const monday = await insertLibrary({ source: 'monday_board' });
    const custom = await insertLibrary({ source: 'custom' });
    libraryIds.push(monday.id, custom.id);

    const result = await libraryService.listLibraries(userId, { page: 1, limit: 50, source: 'monday_board' });

    const ids = result.data.map((l) => l.id);
    expect(ids).toContain(monday.id);
    expect(ids).not.toContain(custom.id);
  });

  it('should exclude soft-deleted libraries', async () => {
    const lib = await insertLibrary({ source: 'custom' });
    libraryIds.push(lib.id);

    await db('libraries').where({ id: lib.id }).update({ deleted_at: db.fn.now() });

    const result = await libraryService.listLibraries(userId, { page: 1, limit: 50 });

    const ids = result.data.map((l) => l.id);
    expect(ids).not.toContain(lib.id);
  });

  it('should return the correct meta.total count', async () => {
    const lib1 = await insertLibrary({ source: 'custom' });
    const lib2 = await insertLibrary({ source: 'custom' });
    libraryIds.push(lib1.id, lib2.id);

    const result = await libraryService.listLibraries(userId, { page: 1, limit: 50 });

    expect(result.meta.total).toBeGreaterThanOrEqual(2);
  });
});

// ─── getLibraryById ───────────────────────────────────────────────────────────

describe('libraryService.getLibraryById', () => {
  let libraryId: string;

  beforeEach(async () => {
    const lib = await insertLibrary();
    libraryId = lib.id;
  });

  afterEach(async () => {
    await db('library_rows').where({ library_id: libraryId }).del();
    await db('libraries').where({ id: libraryId }).del();
  });

  it('should return the library with rows eager-loaded', async () => {
    const row = await insertLibraryRow(libraryId, { label: 'Eager Row' });

    const result = await libraryService.getLibraryById(libraryId);

    expect(result.id).toBe(libraryId);
    expect(Array.isArray(result.rows)).toBe(true);
    const rowIds = (result.rows ?? []).map((r) => r.id);
    expect(rowIds).toContain(row.id);

    await db('library_rows').where({ id: row.id }).del();
  });

  it('should return an empty rows array when the library has no rows', async () => {
    const result = await libraryService.getLibraryById(libraryId);

    expect(result.id).toBe(libraryId);
    expect(result.rows).toEqual([]);
  });

  it('should not include soft-deleted rows in the eager-loaded result', async () => {
    const row = await insertLibraryRow(libraryId, { label: 'Deleted Row' });
    await db('library_rows').where({ id: row.id }).update({ deleted_at: db.fn.now() });

    const result = await libraryService.getLibraryById(libraryId);

    const rowIds = (result.rows ?? []).map((r) => r.id);
    expect(rowIds).not.toContain(row.id);

    await db('library_rows').where({ id: row.id }).del();
  });

  it('should throw a 404 AppError when the library does not exist', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';

    await expect(libraryService.getLibraryById(fakeId)).rejects.toMatchObject({ statusCode: 404 });
  });

  it('should throw a 404 AppError when the library is soft-deleted', async () => {
    await db('libraries').where({ id: libraryId }).update({ deleted_at: db.fn.now() });

    await expect(libraryService.getLibraryById(libraryId)).rejects.toMatchObject({ statusCode: 404 });
  });
});

// ─── createLibrary ────────────────────────────────────────────────────────────

describe('libraryService.createLibrary', () => {
  const createdIds: string[] = [];
  let userId: string;

  beforeEach(async () => {
    const user = await insertUser();
    userId = user.id;
  });

  afterEach(async () => {
    for (const id of createdIds) {
      await db('library_rows').where({ library_id: id }).del();
      await db('libraries').where({ id }).del();
    }
    createdIds.length = 0;
    await db('users').where({ id: userId }).del();
  });

  it('should create a library and return it with an ID', async () => {
    const result = await libraryService.createLibrary(
      {
        name: 'New Library',
        icon: '📋',
        description: 'A test library',
        color: '#0073EA',
        version: '1.0',
        source: 'custom',
        categories: ['Data Element'],
        subCategories: ['Clinical'],
      },
      userId,
    );

    createdIds.push(result.id);
    expect(result.id).toBeDefined();
    expect(result.name).toBe('New Library');
  });

  it('should persist the library to the database', async () => {
    const result = await libraryService.createLibrary(
      {
        name: 'Persisted Library',
        icon: '📋',
        description: '',
        color: '#0073EA',
        version: '1.0',
        source: 'custom',
        categories: [],
        subCategories: [],
      },
      userId,
    );
    createdIds.push(result.id);

    const dbRow = await db('libraries').where({ id: result.id }).first();
    expect(dbRow).toBeDefined();
  });

  it('should assign default permissions including all roles for canView', async () => {
    const result = await libraryService.createLibrary(
      {
        name: 'Permissions Library',
        icon: '📋',
        description: '',
        color: '#0073EA',
        version: '1.0',
        source: 'custom',
        categories: [],
        subCategories: [],
      },
      userId,
    );
    createdIds.push(result.id);

    const permissions = result.permissions as { canView: string[]; canEdit: string[]; canDelete: string[] };
    expect(permissions.canView).toContain('admin');
    expect(permissions.canView).toContain('editor');
    expect(permissions.canView).toContain('viewer');
  });

  it('should set isSystem to false for user-created libraries', async () => {
    const result = await libraryService.createLibrary(
      {
        name: 'User Library',
        icon: '📋',
        description: '',
        color: '#0073EA',
        version: '1.0',
        source: 'custom',
        categories: [],
        subCategories: [],
      },
      userId,
    );
    createdIds.push(result.id);

    expect(result.isSystem).toBe(false);
  });

  it('should set createdBy to the supplied userId', async () => {
    const result = await libraryService.createLibrary(
      {
        name: 'Owned Library',
        icon: '📋',
        description: '',
        color: '#0073EA',
        version: '1.0',
        source: 'custom',
        categories: [],
        subCategories: [],
      },
      userId,
    );
    createdIds.push(result.id);

    expect(result.createdBy).toBe(userId);
  });
});

// ─── updateLibrary ────────────────────────────────────────────────────────────

describe('libraryService.updateLibrary', () => {
  let libraryId: string;

  beforeEach(async () => {
    const lib = await insertLibrary({ name: 'Original Name', color: '#0073EA' });
    libraryId = lib.id;
  });

  afterEach(async () => {
    await db('library_rows').where({ library_id: libraryId }).del();
    await db('libraries').where({ id: libraryId }).del();
  });

  it('should update the name and return the updated library', async () => {
    const result = await libraryService.updateLibrary(libraryId, { name: 'Updated Name' });

    expect(result.id).toBe(libraryId);
    expect(result.name).toBe('Updated Name');
  });

  it('should update the color without affecting the name', async () => {
    const result = await libraryService.updateLibrary(libraryId, { color: '#FF0000' });

    expect(result.color).toBe('#FF0000');
    expect(result.name).toBe('Original Name');
  });

  it('should persist the patch to the database', async () => {
    await libraryService.updateLibrary(libraryId, { name: 'DB-Persisted Name' });

    const dbRow = await db('libraries').where({ id: libraryId }).first();
    expect(dbRow.name).toBe('DB-Persisted Name');
  });

  it('should not affect existing rows when patching library metadata', async () => {
    const row = await insertLibraryRow(libraryId, { label: 'Surviving Row' });

    await libraryService.updateLibrary(libraryId, { name: 'New Name' });

    const dbRow = await db('library_rows').where({ id: row.id }).first();
    expect(dbRow).toBeDefined();
    expect(dbRow.label).toBe('Surviving Row');

    await db('library_rows').where({ id: row.id }).del();
  });

  it('should throw a 404 AppError when the library does not exist', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';

    await expect(
      libraryService.updateLibrary(fakeId, { name: 'Ghost Library' }),
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});

// ─── addLibraryRow ────────────────────────────────────────────────────────────

describe('libraryService.addLibraryRow', () => {
  let libraryId: string;
  const rowIds: string[] = [];

  beforeEach(async () => {
    const lib = await insertLibrary();
    libraryId = lib.id;
  });

  afterEach(async () => {
    for (const id of rowIds) {
      await db('library_rows').where({ id }).del();
    }
    rowIds.length = 0;
    await db('libraries').where({ id: libraryId }).del();
  });

  it('should create a row and return it with an assigned ID', async () => {
    const result = await libraryService.addLibraryRow(libraryId, {
      label: 'New Row',
      code: 'NR001',
      exportKey: 'eTest.NewRow',
      description: 'Test row description',
      category: 'Data Element',
      subCategory: 'Clinical',
      usage: 'Optional',
      elementId: 'eTest.01',
      sortOrder: 0,
    });

    rowIds.push(result.id);
    expect(result.id).toBeDefined();
    expect(result.label).toBe('New Row');
    expect(result.exportKey).toBe('eTest.NewRow');
  });

  it('should persist the row to the database', async () => {
    const result = await libraryService.addLibraryRow(libraryId, {
      label: 'Persisted Row',
      code: '',
      exportKey: 'eTest.Persisted',
      description: '',
      category: 'Data Element',
      subCategory: '',
      usage: 'Optional',
      elementId: '',
      sortOrder: 0,
    });
    rowIds.push(result.id);

    const dbRow = await db('library_rows').where({ id: result.id }).first();
    expect(dbRow).toBeDefined();
    expect(dbRow.label).toBe('Persisted Row');
  });

  it('should associate the row with the correct libraryId', async () => {
    const result = await libraryService.addLibraryRow(libraryId, {
      label: 'Associated Row',
      code: '',
      exportKey: 'eTest.Associated',
      description: '',
      category: 'Data Element',
      subCategory: '',
      usage: 'Optional',
      elementId: '',
      sortOrder: 0,
    });
    rowIds.push(result.id);

    // libraryId comes back from knex-stringcase as camelCase
    expect(result.libraryId).toBe(libraryId);
  });

  it('should throw a 404 AppError when the library does not exist', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';

    await expect(
      libraryService.addLibraryRow(fakeId, {
        label: 'Orphan Row',
        code: '',
        exportKey: 'eTest.Orphan',
        description: '',
        category: '',
        subCategory: '',
        usage: 'Optional',
        elementId: '',
        sortOrder: 0,
      }),
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});

// ─── updateLibraryRow ─────────────────────────────────────────────────────────

describe('libraryService.updateLibraryRow', () => {
  let libraryId: string;
  let rowId: string;

  beforeEach(async () => {
    const lib = await insertLibrary();
    libraryId = lib.id;
    const row = await insertLibraryRow(libraryId, {
      label: 'Original Label',
      export_key: 'eTest.Original',
      category: 'Data Element',
    });
    rowId = row.id;
  });

  afterEach(async () => {
    await db('library_rows').where({ id: rowId }).del();
    await db('libraries').where({ id: libraryId }).del();
  });

  it('should update the label and return the updated row', async () => {
    const result = await libraryService.updateLibraryRow(libraryId, rowId, {
      label: 'Updated Label',
    });

    expect(result.id).toBe(rowId);
    expect(result.label).toBe('Updated Label');
  });

  it('should update the exportKey without affecting the label', async () => {
    const result = await libraryService.updateLibraryRow(libraryId, rowId, {
      exportKey: 'eTest.Updated',
    });

    expect(result.exportKey).toBe('eTest.Updated');
    expect(result.label).toBe('Original Label');
  });

  it('should update the category without affecting other fields', async () => {
    const result = await libraryService.updateLibraryRow(libraryId, rowId, {
      category: 'NOT Value',
    });

    expect(result.category).toBe('NOT Value');
    expect(result.label).toBe('Original Label');
  });

  it('should persist the patch to the database', async () => {
    await libraryService.updateLibraryRow(libraryId, rowId, { label: 'DB-Updated Label' });

    const dbRow = await db('library_rows').where({ id: rowId }).first();
    expect(dbRow.label).toBe('DB-Updated Label');
  });

  it('should throw a 404 AppError when the row does not exist', async () => {
    const fakeRowId = '00000000-0000-0000-0000-000000000000';

    await expect(
      libraryService.updateLibraryRow(libraryId, fakeRowId, { label: 'Ghost Row' }),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it('should throw a 404 AppError when the row belongs to a different library', async () => {
    const otherLib = await insertLibrary();
    const otherRow = await insertLibraryRow(otherLib.id, { label: 'Other Row' });

    await expect(
      libraryService.updateLibraryRow(libraryId, otherRow.id, { label: 'Cross-Library Update' }),
    ).rejects.toMatchObject({ statusCode: 404 });

    await db('library_rows').where({ id: otherRow.id }).del();
    await db('libraries').where({ id: otherLib.id }).del();
  });
});

// ─── deleteLibraryRow ─────────────────────────────────────────────────────────

describe('libraryService.deleteLibraryRow', () => {
  let libraryId: string;
  let rowId: string;

  beforeEach(async () => {
    const lib = await insertLibrary();
    libraryId = lib.id;
    const row = await insertLibraryRow(libraryId);
    rowId = row.id;
  });

  afterEach(async () => {
    await db('library_rows').where({ id: rowId }).del();
    await db('libraries').where({ id: libraryId }).del();
  });

  it('should soft-delete the row by setting deleted_at', async () => {
    await libraryService.deleteLibraryRow(libraryId, rowId);

    const dbRow = await db('library_rows').where({ id: rowId }).first();
    // knex-stringcase exposes it as deletedAt
    const deletedAt = dbRow.deletedAt ?? dbRow.deleted_at;
    expect(deletedAt).not.toBeNull();
  });

  it('should exclude the soft-deleted row from subsequent fetches', async () => {
    await libraryService.deleteLibraryRow(libraryId, rowId);

    const library = await libraryService.getLibraryById(libraryId);
    const rowIds = (library.rows ?? []).map((r) => r.id);
    expect(rowIds).not.toContain(rowId);
  });

  it('should not physically remove the row from the database', async () => {
    await libraryService.deleteLibraryRow(libraryId, rowId);

    const dbRow = await db('library_rows').where({ id: rowId }).first();
    expect(dbRow).toBeDefined();
  });

  it('should throw a 404 AppError when the row does not exist', async () => {
    const fakeRowId = '00000000-0000-0000-0000-000000000000';

    await expect(
      libraryService.deleteLibraryRow(libraryId, fakeRowId),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it('should throw a 404 AppError when called a second time on an already-deleted row', async () => {
    await libraryService.deleteLibraryRow(libraryId, rowId);

    await expect(
      libraryService.deleteLibraryRow(libraryId, rowId),
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});

// ─── bulkCreateLibraryRows ────────────────────────────────────────────────────

describe('libraryService.bulkCreateLibraryRows', () => {
  let libraryId: string;
  const insertedRowIds: string[] = [];

  beforeEach(async () => {
    const lib = await insertLibrary();
    libraryId = lib.id;
  });

  afterEach(async () => {
    for (const id of insertedRowIds) {
      await db('library_rows').where({ id }).del();
    }
    insertedRowIds.length = 0;
    await db('library_rows').where({ library_id: libraryId }).del();
    await db('libraries').where({ id: libraryId }).del();
  });

  it('should insert multiple rows and return them all with IDs', async () => {
    const rows = [
      { label: 'Row A', code: 'A001', exportKey: 'eTest.A', description: '', category: 'Data Element', subCategory: '', usage: 'Optional', elementId: '', sortOrder: 0 },
      { label: 'Row B', code: 'B001', exportKey: 'eTest.B', description: '', category: 'NOT Value', subCategory: '', usage: 'Optional', elementId: '', sortOrder: 1 },
      { label: 'Row C', code: 'C001', exportKey: 'eTest.C', description: '', category: 'Data Element', subCategory: 'Clinical', usage: 'Required', elementId: 'eTest.03', sortOrder: 2 },
    ];

    const result = await libraryService.bulkCreateLibraryRows(libraryId, rows);

    result.forEach((r) => insertedRowIds.push(r.id));
    expect(result).toHaveLength(3);
    result.forEach((r) => expect(r.id).toBeDefined());
  });

  it('should insert up to 500 rows in a single call', async () => {
    const rows = Array.from({ length: 500 }, (_, i) => ({
      label: `Row ${i}`,
      code: `CODE${i}`,
      exportKey: `eTest.Row${i}`,
      description: '',
      category: 'Data Element',
      subCategory: '',
      usage: 'Optional',
      elementId: '',
      sortOrder: i,
    }));

    const result = await libraryService.bulkCreateLibraryRows(libraryId, rows);

    result.forEach((r) => insertedRowIds.push(r.id));
    expect(result).toHaveLength(500);
  }, 30_000);

  it('should persist all rows to the database', async () => {
    const rows = [
      { label: 'Bulk Row 1', code: '', exportKey: 'eTest.Bulk1', description: '', category: 'Data Element', subCategory: '', usage: 'Optional', elementId: '', sortOrder: 0 },
      { label: 'Bulk Row 2', code: '', exportKey: 'eTest.Bulk2', description: '', category: 'Data Element', subCategory: '', usage: 'Optional', elementId: '', sortOrder: 1 },
    ];

    const result = await libraryService.bulkCreateLibraryRows(libraryId, rows);
    result.forEach((r) => insertedRowIds.push(r.id));

    const count = await db('library_rows')
      .where({ library_id: libraryId })
      .whereNull('deleted_at')
      .count('* as total')
      .first();

    expect(Number(count?.total ?? 0)).toBeGreaterThanOrEqual(2);
  });

  it('should associate every row with the correct libraryId', async () => {
    const rows = [
      { label: 'Assoc Row', code: '', exportKey: 'eTest.Assoc', description: '', category: 'Data Element', subCategory: '', usage: 'Optional', elementId: '', sortOrder: 0 },
    ];

    const result = await libraryService.bulkCreateLibraryRows(libraryId, rows);
    result.forEach((r) => insertedRowIds.push(r.id));

    expect(result[0].libraryId).toBe(libraryId);
  });

  it('should throw a 404 AppError when the library does not exist', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const rows = [
      { label: 'Orphan', code: '', exportKey: 'eTest.Orphan', description: '', category: '', subCategory: '', usage: 'Optional', elementId: '', sortOrder: 0 },
    ];

    await expect(
      libraryService.bulkCreateLibraryRows(fakeId, rows),
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});
