// Core domain types for FieldSaver
// Used by both backend and frontend — no Node.js or browser-specific imports

// ─── Primitives ──────────────────────────────────────────────────────────────

export type FormStatus = 'draft' | 'published' | 'archived';
export type UserRole = 'admin' | 'editor' | 'viewer';
export type FormLayout = 'progress' | 'single-page' | 'side-nav';
export type LibrarySource = 'builtin' | 'monday_board' | 'custom';
export type FieldType =
  | 'text' | 'long_text' | 'number' | 'email' | 'phone' | 'url'
  | 'date' | 'time' | 'dropdown' | 'multi_select' | 'radio' | 'checkbox'
  | 'rating' | 'scale' | 'file' | 'signature'
  | 'description' | 'divider';

// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  mondayAccountId: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Library ─────────────────────────────────────────────────────────────────

export interface LibraryPermissions {
  canView: UserRole[];
  canEdit: UserRole[];
  canDelete: UserRole[];
}

export interface LibraryColumnDef {
  id: string;
  label: string;
  key: string;
  type: 'text' | 'number' | 'boolean';
  required: boolean;
}

export interface Library {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  version: string;
  source: LibrarySource;
  mondayBoardId: string | null;
  columns: LibraryColumnDef[];
  categories: string[];
  subCategories: string[];
  permissions: LibraryPermissions;
  isSystem: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  // Populated on fetch
  rows?: LibraryRowDef[];
}

export interface LibraryRowDef {
  id: string;
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
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// ─── Field ───────────────────────────────────────────────────────────────────

/** A library row assigned to a field — carries the export key */
export interface AssignedLibraryRow {
  libraryId: string;
  rowId: string;
  label: string;
  exportKey: string;
  code: string;
  category: string;
  subCategory: string;
}

export interface FieldBehaviour {
  defaultValue: string;
  memoryField: boolean;
  geoLocation: boolean;
  hideQuestion: boolean;
  enabled: boolean;
  hintText: string;
  excludeReport: boolean;
  timeStamp: boolean;
  hidden: boolean;
  color: string;
}

export interface FieldDataAttrs {
  showCategories: string[];   // which library categories surface as chips
  isNillable: boolean;        // auto-submit nil marker on blank
}

export interface FieldNarrative {
  valueText: string;          // narrative template for filled value
  notValueText: string;       // narrative template for NOT value
}

export interface FieldOption {
  id: string;
  label: string;
}

export interface FieldSettings {
  // text
  maxLength?: string | number;
  // long_text
  rows?: number;
  // number
  min?: string | number;
  max?: string | number;
  prefix?: string;
  suffix?: string;
  // file
  maxSize?: number;
  accept?: string;
  multiple?: boolean;
  // rating
  // (uses max)
  // scale
  minLabel?: string;
  maxLabel?: string;
  // description
  content?: string;
}

export interface Field {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  placeholder: string;
  helpText: string;
  validation: { pattern?: string; message?: string };
  libraryRows: AssignedLibraryRow[];
  dataAttrs: FieldDataAttrs;
  behaviour: FieldBehaviour;
  narrative: FieldNarrative;
  options?: FieldOption[];
  settings: FieldSettings;
}

// ─── Form Tree ───────────────────────────────────────────────────────────────

export interface Cell {
  id: string;
  fields: Field[];
}

export interface ColPreset {
  label: string;
  hint: string;
  cols: number[];  // must sum to 12
}

export interface Row {
  id: string;
  preset: ColPreset;
  cells: Cell[];
}

export interface SectionSettings {
  repeatable: boolean;
  repeatLabel: string;
  maxRepeats: number;
}

export interface Section {
  id: string;
  title: string;
  settings: SectionSettings;
  rows: Row[];
}

export interface Page {
  id: string;
  title: string;
  description: string;
  sections: Section[];
}

// ─── Narrative Templates ─────────────────────────────────────────────────────

export interface NarrativeTemplate {
  id: string;
  name: string;
  content: string;   // "Patient presented with {{fieldId|label}}"
}

// ─── Form Settings ───────────────────────────────────────────────────────────

export interface FormSettings {
  // Submission
  submitLabel: string;
  successMessage: string;
  redirectUrl: string;
  confirmationEmail: boolean;

  // Display & Theme
  showProgress: boolean;
  showPageNumbers: boolean;
  formLayout: FormLayout;
  brandColor: string;
  companyLogoUrl: string;
  compactMode: boolean;
  singlePageDefaultExpanded: boolean;   // expand first page accordion by default
  singlePageAllowMultiOpen: boolean;    // allow multiple accordion pages open at once

  // Behavior
  allowDraft: boolean;
  autoSave: boolean;
  validateOnChange: boolean;
  preventMultipleSubmissions: boolean;
  requireAllPages: boolean;
  allowGoBack: boolean;
  randomizePageOrder: boolean;
  randomizeFieldOrder: boolean;

  // Access & Sharing
  closedFormMessage: string;
  passwordProtected: boolean;
  allowedDomains: string;

  // Integrations
  mondayBoardId: string;
  mondayGroupId: string;
  mondayCreateLabels: boolean;
  webhookUrl: string;
  webhookAuthHeader: string;

  // Notifications
  notifyEmails: string;
  digestEmail: boolean;

  // Data & Export
  dateFormat: string;
  emptyFieldHandling: 'omit' | 'null' | 'empty-string';
  retentionDays: number;
  includeXmlNil: boolean;
  includePertinentNegatives: boolean;
  includeNotValues: boolean;
}

// ─── Form ────────────────────────────────────────────────────────────────────

export interface FormData {
  pages: Page[];
  libraries: Library[];
  narrativeTemplates: NarrativeTemplate[];
}

export interface Form {
  id: string;
  userId: string;
  name: string;
  description: string;
  data: FormData;
  settings: FormSettings;
  status: FormStatus;
  publishedAt: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// ─── Submission ──────────────────────────────────────────────────────────────

export interface Submission {
  id: string;
  formId: string;
  formVersion: number;
  data: Record<string, unknown>;         // { fieldId: value }
  exportData: Record<string, unknown>;   // { exportKey: value }
  notValues: Record<string, string>;     // { fieldId: exportKey }
  submittedBy: string | null;
  submittedAt: string;
  source: 'web' | 'monday_app' | 'api';
  mondayItemId: string | null;
}

// ─── API Wrappers ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface ApiError {
  error: string;
  details?: Array<{ path: string[]; message: string }>;
}
