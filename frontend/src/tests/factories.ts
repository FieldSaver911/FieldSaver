/**
 * Test factories for frontend tests.
 * Always use these instead of hardcoding test data.
 */
import type {
  Form, Page, Section, Row, Cell, Field, Library, LibraryRowDef,
  AssignedLibraryRow, FormSettings,
} from '@fieldsaver/shared';

let counter = 0;
function uid(): string { return `test-${++counter}`; }

export function makeFormSettings(overrides: Partial<FormSettings> = {}): FormSettings {
  return {
    submitLabel: 'Submit',
    successMessage: 'Thank you!',
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
    ...overrides,
  };
}

export function makeField(overrides: Partial<Field> = {}): Field {
  return {
    id: uid(),
    type: 'text',
    label: 'Test Field',
    required: false,
    placeholder: '',
    helpText: '',
    validation: {},
    libraryRows: [],
    dataAttrs: { showCategories: [], isNillable: false },
    behaviour: {
      defaultValue: '', memoryField: false, geoLocation: false,
      hideQuestion: false, enabled: true, hintText: '',
      excludeReport: false, timeStamp: false, hidden: false, color: '',
    },
    narrative: { valueText: '', notValueText: '' },
    options: undefined,
    settings: {},
    ...overrides,
  };
}

export function makeCell(overrides: Partial<Cell> = {}): Cell {
  return { id: uid(), fields: [], ...overrides };
}

export function makeRow(overrides: Partial<Row> = {}): Row {
  return {
    id: uid(),
    preset: { label: 'Full', hint: '12 cols', cols: [12] },
    cells: [makeCell()],
    ...overrides,
  };
}

export function makeSection(overrides: Partial<Section> = {}): Section {
  return {
    id: uid(),
    title: 'Test Section',
    settings: { repeatable: false, repeatLabel: '+ Add Another', maxRepeats: 5 },
    rows: [],
    ...overrides,
  };
}

export function makePage(overrides: Partial<Page> = {}): Page {
  return {
    id: uid(),
    title: 'Test Page',
    description: '',
    sections: [makeSection()],
    ...overrides,
  };
}

export function makeForm(overrides: Partial<Form> = {}): Form {
  const page = makePage();
  return {
    id: uid(),
    userId: uid(),
    name: 'Test Form',
    description: '',
    data: { pages: [page], libraries: [], narrativeTemplates: [] },
    settings: makeFormSettings(),
    status: 'draft',
    publishedAt: null,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    ...overrides,
  };
}

export function makeLibraryRowDef(overrides: Partial<LibraryRowDef> = {}): LibraryRowDef {
  return {
    id: uid(),
    libraryId: uid(),
    label: 'Test Row',
    code: 'TST001',
    exportKey: 'test.exportKey',
    description: 'A test library row',
    category: 'Data Element',
    subCategory: 'Clinical',
    usage: 'Optional',
    elementId: 'eTest.01',
    sortOrder: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    ...overrides,
  };
}

export function makeLibrary(overrides: Partial<Library> = {}): Library {
  return {
    id: uid(),
    name: 'Test Library',
    icon: '📋',
    description: '',
    color: '#0073EA',
    version: '1.0',
    source: 'custom',
    mondayBoardId: null,
    columns: [],
    categories: ['Data Element', 'NOT Value'],
    subCategories: ['Clinical'],
    permissions: {
      canView: ['admin', 'editor', 'viewer'],
      canEdit: ['admin', 'editor'],
      canDelete: ['admin'],
    },
    isSystem: false,
    createdBy: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    rows: [],
    ...overrides,
  };
}

export function makeAssignedLibraryRow(overrides: Partial<AssignedLibraryRow> = {}): AssignedLibraryRow {
  return {
    libraryId: uid(),
    rowId: uid(),
    label: 'Test Row',
    exportKey: 'test.exportKey',
    code: 'TST001',
    category: 'Data Element',
    subCategory: 'Clinical',
    ...overrides,
  };
}
