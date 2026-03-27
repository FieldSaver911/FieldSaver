import { AppError } from '../middleware/error-handler';
import type { Form, FormData, FormSettings, PaginatedResponse, AssignedLibraryRow } from '@fieldsaver/shared';
import type {
  CreateFormInput,
  UpdateFormInput,
  PatchFormInput,
  ListFormsQuery,
} from '@fieldsaver/shared';
import * as queries from '../db/queries/form-queries';

// ─── Default form tree ────────────────────────────────────────────────────────

function defaultFormData(): FormData {
  return {
    pages: [],
    libraries: [],
    narrativeTemplates: [],
  };
}

function defaultFormSettings(): FormSettings {
  return {
    submitLabel: 'Submit',
    successMessage: 'Thank you! Your response has been submitted.',
    redirectUrl: '',
    showProgress: true,
    allowDraft: false,
    formLayout: 'progress',
    brandColor: '',
    showPageNumbers: false,
    mondayBoardId: '',
    mondayGroupId: '',
    webhookUrl: '',
    notifyEmails: '',
    dateFormat: 'MM/DD/YYYY',
    emptyFieldHandling: 'omit',
    retentionDays: 90,
  };
}

// ─── listForms ────────────────────────────────────────────────────────────────

export async function listForms(
  userId: string,
  query: ListFormsQuery,
): Promise<PaginatedResponse<Form>> {
  const { page, limit, status, search, sort, order } = query;
  const offset = (page - 1) * limit;

  const [rows, total] = await Promise.all([
    queries.listForms(userId, { status, search, sort, order, offset, limit }),
    queries.countUserForms(userId, { status, search }),
  ]);

  return {
    data: rows,
    meta: { total, page, limit },
  };
}

// ─── getFormById ──────────────────────────────────────────────────────────────

export async function getFormById(id: string): Promise<Form> {
  const form = await queries.getFormById(id);
  if (!form) throw new AppError('Form not found', 404);
  return form;
}

// ─── createForm ───────────────────────────────────────────────────────────────

export async function createForm(
  input: CreateFormInput,
  userId: string,
): Promise<Form> {
  return queries.createForm({
    userId,
    name: input.name,
    description: input.description ?? '',
    data: defaultFormData(),
    settings: defaultFormSettings(),
    status: 'draft',
    version: 1,
  });
}

// ─── updateForm (full PUT) ────────────────────────────────────────────────────

export async function updateForm(
  id: string,
  input: UpdateFormInput,
): Promise<Form> {
  // Verify exists first
  await getFormById(id);

  return queries.updateForm(id, {
    name: input.name,
    description: input.description,
    data: input.data as object | undefined,
    settings: input.settings as object | undefined,
    status: input.status,
  });
}

// ─── patchForm (partial PATCH) ────────────────────────────────────────────────

export async function patchForm(
  id: string,
  input: PatchFormInput,
): Promise<Form> {
  // Verify exists first
  await getFormById(id);

  // Strip undefined values so Knex doesn't include them in the UPDATE
  const patch: Partial<{
    name: string;
    description: string;
    settings: object;
  }> = {};

  if (input.name !== undefined) patch.name = input.name;
  if (input.description !== undefined) patch.description = input.description;
  if (input.settings !== undefined) patch.settings = input.settings as object;

  return queries.updateForm(id, patch);
}

// ─── deleteForm ───────────────────────────────────────────────────────────────

export async function deleteForm(id: string): Promise<void> {
  // Verify exists before soft-deleting
  await getFormById(id);
  await queries.softDeleteForm(id);
}

// ─── publishForm ──────────────────────────────────────────────────────────────

export async function publishForm(id: string): Promise<Form> {
  const form = await getFormById(id);

  if (form.status === 'archived') {
    throw new AppError('Cannot publish an archived form', 409);
  }

  return queries.updateForm(id, {
    status: 'published',
    publishedAt: new Date().toISOString(),
    version: form.version + 1,
  });
}

// ─── duplicateForm ────────────────────────────────────────────────────────────

export async function duplicateForm(
  id: string,
  userId: string,
): Promise<Form> {
  const source = await getFormById(id);

  return queries.createForm({
    userId,
    name: `${source.name} (Copy)`,
    description: source.description,
    data: source.data as unknown as object,
    settings: source.settings as unknown as object,
    status: 'draft',
    version: 1,
  });
}

// ─── exportKeyMap ─────────────────────────────────────────────────────────────

export interface ExportKeyEntry {
  fieldId: string;
  fieldLabel: string;
  fieldType: string;
  exportKey: string;
  code: string;
  category: string;
  subCategory: string;
  pageTitle: string;
  sectionTitle: string;
}

export async function exportKeyMap(
  id: string,
): Promise<{ form: Form; keyMap: Record<string, ExportKeyEntry> }> {
  const form = await getFormById(id);

  const keyMap: Record<string, ExportKeyEntry> = {};

  for (const page of form.data.pages) {
    for (const section of page.sections) {
      for (const row of section.rows) {
        for (const cell of row.cells) {
          for (const field of cell.fields) {
            for (const lr of field.libraryRows as AssignedLibraryRow[]) {
              keyMap[lr.exportKey] = {
                fieldId: field.id,
                fieldLabel: field.label,
                fieldType: field.type,
                exportKey: lr.exportKey,
                code: lr.code,
                category: lr.category,
                subCategory: lr.subCategory,
                pageTitle: page.title,
                sectionTitle: section.title,
              };
            }
          }
        }
      }
    }
  }

  return { form, keyMap };
}
