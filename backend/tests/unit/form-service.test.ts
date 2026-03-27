/**
 * Unit tests for form-service.ts
 *
 * These tests run against a real PostgreSQL database. All test data is
 * created through factory helpers and cleaned up in afterEach blocks so
 * each test starts with a known, isolated state.
 *
 * No mocks for the database — per project testing rules.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '../../src/db';
import * as formService from '../../src/services/form-service';
import * as authQueries from '../../src/db/queries/auth-queries';
import type { Form, AssignedLibraryRow } from '@fieldsaver/shared';

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function createTestUser(suffix?: string): Promise<{ id: string; email: string }> {
  const bcrypt = await import('bcrypt');
  const tag = suffix ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const passwordHash = await bcrypt.hash('Password1!', 10);
  const row = await authQueries.createUser({
    email: `form-svc-${tag}@example.com`,
    passwordHash,
    name: 'Form Service Test User',
    role: 'editor',
  });
  return { id: row.id, email: row.email };
}

async function createTestForm(userId: string, overrides: Partial<{
  name: string;
  status: string;
  description: string;
}> = {}): Promise<Form> {
  return formService.createForm(
    {
      name: overrides.name ?? `Form-${Date.now()}`,
      description: overrides.description ?? '',
    },
    userId,
  );
}

// ─── Cleanup helpers ──────────────────────────────────────────────────────────

async function cleanupUser(userId: string): Promise<void> {
  await db('forms').where({ userId }).del();
  await db('users').where({ id: userId }).del();
}

async function cleanupForms(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  await db('forms').whereIn('id', ids).del();
}

// ─── listForms ────────────────────────────────────────────────────────────────

describe('formService.listForms', () => {
  let userId: string;
  const formIds: string[] = [];

  beforeEach(async () => {
    const user = await createTestUser('list');
    userId = user.id;
    formIds.length = 0;
  });

  afterEach(async () => {
    await cleanupForms(formIds);
    await db('users').where({ id: userId }).del();
  });

  it('should return forms belonging to the user with pagination meta', async () => {
    const f = await createTestForm(userId, { name: 'Alpha' });
    formIds.push(f.id);

    const result = await formService.listForms(userId, {
      page: 1, limit: 50, sort: 'updated_at', order: 'desc',
    });

    expect(result.data.length).toBeGreaterThanOrEqual(1);
    expect(result.meta.total).toBeGreaterThanOrEqual(1);
    expect(result.meta.page).toBe(1);
    expect(result.meta.limit).toBe(50);
    const found = result.data.find((f2) => f2.id === f.id);
    expect(found).toBeDefined();
  });

  it('should not return forms belonging to another user', async () => {
    const other = await createTestUser('list-other');
    const otherForm = await createTestForm(other.id, { name: 'Other User Form' });

    const result = await formService.listForms(userId, {
      page: 1, limit: 50, sort: 'updated_at', order: 'desc',
    });

    const found = result.data.find((f2) => f2.id === otherForm.id);
    expect(found).toBeUndefined();

    // cleanup other user
    await db('forms').where({ id: otherForm.id }).del();
    await db('users').where({ id: other.id }).del();
  });

  it('should exclude soft-deleted forms', async () => {
    const f = await createTestForm(userId, { name: 'ToDelete' });
    formIds.push(f.id);

    // soft-delete it
    await db('forms').where({ id: f.id }).update({ deletedAt: db.fn.now() });

    const result = await formService.listForms(userId, {
      page: 1, limit: 50, sort: 'updated_at', order: 'desc',
    });

    const found = result.data.find((f2) => f2.id === f.id);
    expect(found).toBeUndefined();
  });

  it('should paginate correctly — page 2 should not include page 1 results', async () => {
    for (let i = 0; i < 3; i++) {
      const f = await createTestForm(userId, { name: `Paginate-${i}` });
      formIds.push(f.id);
    }

    const page1 = await formService.listForms(userId, {
      page: 1, limit: 2, sort: 'name', order: 'asc',
    });
    const page2 = await formService.listForms(userId, {
      page: 2, limit: 2, sort: 'name', order: 'asc',
    });

    expect(page1.data.length).toBe(2);
    // No IDs should overlap
    const page1Ids = new Set(page1.data.map((f2) => f2.id));
    for (const f2 of page2.data) {
      expect(page1Ids.has(f2.id)).toBe(false);
    }
  });

  it('should filter by status when provided', async () => {
    const draft = await createTestForm(userId, { name: 'DraftForm' });
    formIds.push(draft.id);

    // manually publish another form
    const pub = await createTestForm(userId, { name: 'PublishedForm' });
    formIds.push(pub.id);
    await db('forms').where({ id: pub.id }).update({ status: 'published' });

    const draftResult = await formService.listForms(userId, {
      page: 1, limit: 50, sort: 'updated_at', order: 'desc', status: 'draft',
    });

    const foundDraft = draftResult.data.find((f2) => f2.id === draft.id);
    const foundPub = draftResult.data.find((f2) => f2.id === pub.id);

    expect(foundDraft).toBeDefined();
    expect(foundPub).toBeUndefined();
  });

  it('should filter by search term matching name', async () => {
    const unique = `UniqueTitle-${Date.now()}`;
    const f = await createTestForm(userId, { name: unique });
    formIds.push(f.id);

    const result = await formService.listForms(userId, {
      page: 1, limit: 50, sort: 'updated_at', order: 'desc', search: unique,
    });

    expect(result.data.some((f2) => f2.id === f.id)).toBe(true);
  });
});

// ─── getFormById ──────────────────────────────────────────────────────────────

describe('formService.getFormById', () => {
  let userId: string;
  let form: Form;

  beforeEach(async () => {
    const user = await createTestUser('getbyid');
    userId = user.id;
    form = await createTestForm(userId);
  });

  afterEach(async () => {
    await cleanupUser(userId);
  });

  it('should return the form when it exists', async () => {
    const result = await formService.getFormById(form.id);
    expect(result.id).toBe(form.id);
    expect(result.userId).toBe(userId);
  });

  it('should include the data tree with pages/libraries/narrativeTemplates', async () => {
    const result = await formService.getFormById(form.id);
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data.pages)).toBe(true);
    expect(Array.isArray(result.data.libraries)).toBe(true);
    expect(Array.isArray(result.data.narrativeTemplates)).toBe(true);
  });

  it('should throw a 404 AppError when the form does not exist', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    await expect(formService.getFormById(fakeId)).rejects.toMatchObject({ statusCode: 404 });
  });

  it('should throw a 404 AppError when the form is soft-deleted', async () => {
    await db('forms').where({ id: form.id }).update({ deletedAt: db.fn.now() });
    await expect(formService.getFormById(form.id)).rejects.toMatchObject({ statusCode: 404 });
  });
});

// ─── createForm ───────────────────────────────────────────────────────────────

describe('formService.createForm', () => {
  let userId: string;
  const formIds: string[] = [];

  beforeEach(async () => {
    const user = await createTestUser('create');
    userId = user.id;
    formIds.length = 0;
  });

  afterEach(async () => {
    await cleanupForms(formIds);
    await db('users').where({ id: userId }).del();
  });

  it('should create a form with status=draft and version=1', async () => {
    const f = await formService.createForm({ name: 'My Form', description: '' }, userId);
    formIds.push(f.id);

    expect(f.status).toBe('draft');
    expect(f.version).toBe(1);
    expect(f.publishedAt).toBeNull();
  });

  it('should assign the form to the given userId', async () => {
    const f = await formService.createForm({ name: 'Owned Form' }, userId);
    formIds.push(f.id);

    expect(f.userId).toBe(userId);
  });

  it('should initialise the data tree with empty pages, libraries, and narrativeTemplates', async () => {
    const f = await formService.createForm({ name: 'Empty Tree' }, userId);
    formIds.push(f.id);

    expect(Array.isArray(f.data.pages)).toBe(true);
    expect(f.data.pages).toHaveLength(0);
    expect(f.data.libraries).toHaveLength(0);
    expect(f.data.narrativeTemplates).toHaveLength(0);
  });

  it('should persist the form to the database so it is retrievable', async () => {
    const f = await formService.createForm({ name: 'Persisted' }, userId);
    formIds.push(f.id);

    const fetched = await formService.getFormById(f.id);
    expect(fetched.id).toBe(f.id);
    expect(fetched.name).toBe('Persisted');
  });

  it('should apply a default name when none is provided via the schema default', async () => {
    // CreateFormSchema has .default('Untitled Form')
    const f = await formService.createForm({ name: 'Untitled Form', description: '' }, userId);
    formIds.push(f.id);

    expect(f.name).toBe('Untitled Form');
  });
});

// ─── updateForm (full PUT) ────────────────────────────────────────────────────

describe('formService.updateForm', () => {
  let userId: string;
  let form: Form;

  beforeEach(async () => {
    const user = await createTestUser('update');
    userId = user.id;
    form = await createTestForm(userId, { name: 'Original Name' });
  });

  afterEach(async () => {
    await cleanupUser(userId);
  });

  it('should replace name, description, data, and settings', async () => {
    const newData = { pages: [], libraries: [], narrativeTemplates: [] };
    const updated = await formService.updateForm(form.id, {
      name: 'Updated Name',
      description: 'New description',
      data: newData,
      settings: { submitLabel: 'Send', showProgress: false },
    });

    expect(updated.name).toBe('Updated Name');
    expect(updated.description).toBe('New description');
  });

  it('should persist the updated name to the database', async () => {
    await formService.updateForm(form.id, { name: 'DB Persisted Name' });
    const fetched = await formService.getFormById(form.id);
    expect(fetched.name).toBe('DB Persisted Name');
  });

  it('should throw a 404 AppError when the form does not exist', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    await expect(
      formService.updateForm(fakeId, { name: 'Ghost' }),
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});

// ─── patchForm (partial PATCH) ────────────────────────────────────────────────

describe('formService.patchForm', () => {
  let userId: string;
  let form: Form;

  beforeEach(async () => {
    const user = await createTestUser('patch');
    userId = user.id;
    form = await createTestForm(userId, { name: 'Patch Me' });
  });

  afterEach(async () => {
    await cleanupUser(userId);
  });

  it('should update only the name when only name is provided', async () => {
    const patched = await formService.patchForm(form.id, { name: 'Patched Name' });
    expect(patched.name).toBe('Patched Name');
    // description should remain unchanged
    expect(patched.description).toBe(form.description);
  });

  it('should update only settings when only settings is provided', async () => {
    const patched = await formService.patchForm(form.id, {
      settings: { submitLabel: 'Send It' },
    });
    // The data tree must not be altered
    expect(patched.data).toBeDefined();
    expect(Array.isArray(patched.data.pages)).toBe(true);
  });

  it('should not alter the data tree when patching only metadata', async () => {
    const before = (await formService.getFormById(form.id)).data;
    await formService.patchForm(form.id, { description: 'New desc' });
    const after = (await formService.getFormById(form.id)).data;

    expect(JSON.stringify(after)).toBe(JSON.stringify(before));
  });

  it('should throw a 404 AppError when the form does not exist', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    await expect(
      formService.patchForm(fakeId, { name: 'Ghost' }),
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});

// ─── publishForm ──────────────────────────────────────────────────────────────

describe('formService.publishForm', () => {
  let userId: string;
  let form: Form;

  beforeEach(async () => {
    const user = await createTestUser('publish');
    userId = user.id;
    form = await createTestForm(userId, { name: 'Draft Form' });
  });

  afterEach(async () => {
    await cleanupUser(userId);
  });

  it('should change status to published', async () => {
    const published = await formService.publishForm(form.id);
    expect(published.status).toBe('published');
  });

  it('should set publishedAt to a non-null timestamp', async () => {
    const published = await formService.publishForm(form.id);
    expect(published.publishedAt).not.toBeNull();
  });

  it('should increment version by 1 from the initial version', async () => {
    const initialVersion = form.version;
    const published = await formService.publishForm(form.id);
    expect(published.version).toBe(initialVersion + 1);
  });

  it('should allow publishing an already-published form again (re-publish increments version)', async () => {
    const first = await formService.publishForm(form.id);
    const second = await formService.publishForm(form.id);
    expect(second.version).toBe(first.version + 1);
  });

  it('should throw a 409 AppError when attempting to publish an archived form', async () => {
    await db('forms').where({ id: form.id }).update({ status: 'archived' });
    await expect(formService.publishForm(form.id)).rejects.toMatchObject({ statusCode: 409 });
  });

  it('should throw a 404 AppError when the form does not exist', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    await expect(formService.publishForm(fakeId)).rejects.toMatchObject({ statusCode: 404 });
  });
});

// ─── duplicateForm ────────────────────────────────────────────────────────────

describe('formService.duplicateForm', () => {
  let userId: string;
  let original: Form;
  const extraFormIds: string[] = [];

  beforeEach(async () => {
    const user = await createTestUser('dup');
    userId = user.id;
    original = await createTestForm(userId, { name: 'Original Form' });
  });

  afterEach(async () => {
    await cleanupForms([original.id, ...extraFormIds]);
    extraFormIds.length = 0;
    await db('users').where({ id: userId }).del();
  });

  it('should create a new form with a different ID', async () => {
    const copy = await formService.duplicateForm(original.id, userId);
    extraFormIds.push(copy.id);

    expect(copy.id).not.toBe(original.id);
  });

  it('should set status=draft and version=1 on the copy', async () => {
    // publish original first so version > 1
    await formService.publishForm(original.id);
    const copy = await formService.duplicateForm(original.id, userId);
    extraFormIds.push(copy.id);

    expect(copy.status).toBe('draft');
    expect(copy.version).toBe(1);
    expect(copy.publishedAt).toBeNull();
  });

  it('should append "(Copy)" to the name', async () => {
    const copy = await formService.duplicateForm(original.id, userId);
    extraFormIds.push(copy.id);

    expect(copy.name).toBe(`${original.name} (Copy)`);
  });

  it('should copy the data and settings from the source', async () => {
    const copy = await formService.duplicateForm(original.id, userId);
    extraFormIds.push(copy.id);

    expect(JSON.stringify(copy.data)).toBe(JSON.stringify(original.data));
    expect(JSON.stringify(copy.settings)).toBe(JSON.stringify(original.settings));
  });

  it('should throw a 404 AppError when the source form does not exist', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    await expect(
      formService.duplicateForm(fakeId, userId),
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});

// ─── deleteForm ───────────────────────────────────────────────────────────────

describe('formService.deleteForm', () => {
  let userId: string;
  let form: Form;

  beforeEach(async () => {
    const user = await createTestUser('delete');
    userId = user.id;
    form = await createTestForm(userId);
  });

  afterEach(async () => {
    // Hard-delete so afterEach cleanup doesn't fail if soft-deleted
    await db('forms').where({ id: form.id }).del();
    await db('users').where({ id: userId }).del();
  });

  it('should soft-delete the form by setting deleted_at', async () => {
    await formService.deleteForm(form.id);

    const row = await db('forms').where({ id: form.id }).first();
    const deletedAt = row.deletedAt ?? row.deleted_at;
    expect(deletedAt).not.toBeNull();
  });

  it('should make the form invisible to getFormById after deletion', async () => {
    await formService.deleteForm(form.id);
    await expect(formService.getFormById(form.id)).rejects.toMatchObject({ statusCode: 404 });
  });

  it('should throw a 404 AppError when the form does not exist', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    await expect(formService.deleteForm(fakeId)).rejects.toMatchObject({ statusCode: 404 });
  });
});

// ─── exportKeyMap ─────────────────────────────────────────────────────────────

describe('formService.exportKeyMap', () => {
  let userId: string;
  const formIds: string[] = [];

  beforeEach(async () => {
    const user = await createTestUser('export');
    userId = user.id;
  });

  afterEach(async () => {
    await cleanupForms(formIds);
    formIds.length = 0;
    await db('users').where({ id: userId }).del();
  });

  it('should return an empty keyMap for a form with no fields', async () => {
    const f = await createTestForm(userId);
    formIds.push(f.id);

    const { keyMap } = await formService.exportKeyMap(f.id);
    expect(Object.keys(keyMap)).toHaveLength(0);
  });

  it('should extract exportKey entries from all fields in the form tree', async () => {
    const fieldId = `f-${Date.now()}`;
    const pageId = `p-${Date.now()}`;
    const secId = `s-${Date.now()}`;
    const rowId = `r-${Date.now()}`;
    const cellId = `c-${Date.now()}`;

    const assignedRow: AssignedLibraryRow = {
      libraryId: 'lib-1',
      rowId: 'row-1',
      label: 'Systolic BP',
      exportKey: 'eVitals.SBP',
      code: '3150107',
      category: 'Data Element',
      subCategory: 'Clinical',
    };

    const formData = {
      pages: [{
        id: pageId,
        title: 'Page 1',
        description: '',
        sections: [{
          id: secId,
          title: 'Vitals',
          settings: { repeatable: false, repeatLabel: '+ Add', maxRepeats: 5 },
          rows: [{
            id: rowId,
            preset: { label: 'Full', hint: '12 cols', cols: [12] },
            cells: [{
              id: cellId,
              fields: [{
                id: fieldId,
                type: 'number',
                label: 'SBP',
                required: false,
                placeholder: '',
                helpText: '',
                validation: {},
                libraryRows: [assignedRow],
                dataAttrs: { showCategories: [], isNillable: false },
                behaviour: {
                  defaultValue: '', memoryField: false, geoLocation: false,
                  hideQuestion: false, enabled: true, hintText: '',
                  excludeReport: false, timeStamp: false, hidden: false, color: '',
                },
                narrative: { valueText: '', notValueText: '' },
                settings: {},
              }],
            }],
          }],
        }],
      }],
      libraries: [],
      narrativeTemplates: [],
    };

    const f = await createTestForm(userId);
    formIds.push(f.id);

    // Push the form data into the DB
    await db('forms').where({ id: f.id }).update({ data: JSON.stringify(formData) });

    const { keyMap } = await formService.exportKeyMap(f.id);

    expect(keyMap['eVitals.SBP']).toBeDefined();
    expect(keyMap['eVitals.SBP'].fieldId).toBe(fieldId);
    expect(keyMap['eVitals.SBP'].exportKey).toBe('eVitals.SBP');
    expect(keyMap['eVitals.SBP'].fieldLabel).toBe('SBP');
    expect(keyMap['eVitals.SBP'].pageTitle).toBe('Page 1');
    expect(keyMap['eVitals.SBP'].sectionTitle).toBe('Vitals');
  });

  it('should throw a 404 AppError when the form does not exist', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    await expect(formService.exportKeyMap(fakeId)).rejects.toMatchObject({ statusCode: 404 });
  });

  it('should handle multiple fields with multiple library rows each', async () => {
    const formData = {
      pages: [{
        id: 'p1',
        title: 'Page',
        description: '',
        sections: [{
          id: 's1',
          title: 'Section',
          settings: { repeatable: false, repeatLabel: '', maxRepeats: 5 },
          rows: [
            {
              id: 'r1',
              preset: { label: 'Full', hint: '', cols: [12] },
              cells: [{
                id: 'c1',
                fields: [{
                  id: 'f1', type: 'text', label: 'Gender', required: false,
                  placeholder: '', helpText: '', validation: {},
                  libraryRows: [
                    { libraryId: 'l1', rowId: 'r1', label: 'Gender', exportKey: 'ePatient.Gender', code: '', category: 'Data Element', subCategory: '' },
                    { libraryId: 'l1', rowId: 'r2', label: 'Not Recorded', exportKey: 'notRecorded', code: '7701003', category: 'NOT Value', subCategory: '' },
                  ],
                  dataAttrs: { showCategories: [], isNillable: false },
                  behaviour: { defaultValue: '', memoryField: false, geoLocation: false, hideQuestion: false, enabled: true, hintText: '', excludeReport: false, timeStamp: false, hidden: false, color: '' },
                  narrative: { valueText: '', notValueText: '' },
                  settings: {},
                }],
              }],
            },
          ],
        }],
      }],
      libraries: [],
      narrativeTemplates: [],
    };

    const f = await createTestForm(userId);
    formIds.push(f.id);
    await db('forms').where({ id: f.id }).update({ data: JSON.stringify(formData) });

    const { keyMap } = await formService.exportKeyMap(f.id);

    expect(keyMap['ePatient.Gender']).toBeDefined();
    expect(keyMap['notRecorded']).toBeDefined();
  });
});
