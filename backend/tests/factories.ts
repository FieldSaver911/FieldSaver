/**
 * Test factories for backend tests.
 * Always use these — never hardcode UUIDs or emails.
 */
import { randomUUID as uuid } from 'crypto';

export function makeUser(overrides: Record<string, unknown> = {}) {
  const id = uuid();
  return {
    id,
    email: `test-${id.slice(0, 8)}@example.com`,
    password_hash: '$2b$10$testhashedpasswordfortestingonly',
    name: 'Test User',
    role: 'editor' as const,
    monday_access_token: null,
    monday_account_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    ...overrides,
  };
}

export function makeForm(userId: string, overrides: Record<string, unknown> = {}) {
  return {
    id: uuid(),
    user_id: userId,
    name: 'Test Form',
    description: '',
    data: JSON.stringify({
      pages: [{
        id: uuid(),
        title: 'Page 1',
        description: '',
        sections: [{
          id: uuid(),
          title: 'Section 1',
          settings: { repeatable: false, repeatLabel: '+ Add Another', maxRepeats: 5 },
          rows: [],
        }],
      }],
      libraries: [],
      narrativeTemplates: [],
    }),
    settings: JSON.stringify({
      submitLabel: 'Submit',
      formLayout: 'progress',
      showProgress: true,
    }),
    status: 'draft' as const,
    published_at: null,
    version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    ...overrides,
  };
}

export function makeLibrary(overrides: Record<string, unknown> = {}) {
  return {
    id: uuid(),
    name: 'Test Library',
    icon: '📋',
    description: '',
    color: '#0073EA',
    version: '1.0',
    source: 'custom' as const,
    monday_board_id: null,
    columns: JSON.stringify([]),
    categories: ['Data Element', 'NOT Value'],
    sub_categories: ['Clinical'],
    permissions: JSON.stringify({
      canView: ['admin', 'editor', 'viewer'],
      canEdit: ['admin', 'editor'],
      canDelete: ['admin'],
    }),
    is_system: false,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    ...overrides,
  };
}

export function makeLibraryRow(libraryId: string, overrides: Record<string, unknown> = {}) {
  return {
    id: uuid(),
    library_id: libraryId,
    label: 'Test Row',
    code: 'TST001',
    export_key: 'test.exportKey',
    description: 'A test row',
    category: 'Data Element',
    sub_category: 'Clinical',
    usage: 'Optional',
    element_id: 'eTest.01',
    sort_order: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    ...overrides,
  };
}
