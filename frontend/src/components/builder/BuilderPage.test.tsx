/**
 * Component tests for BuilderPage.
 *
 * The useForm hook (and by extension useFormStore + formsApi) is mocked so
 * no real network calls are made. Tests verify that the BuilderPage renders
 * loading / error / canvas states correctly.
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BuilderPage } from './BuilderPage';
import * as useFormModule from '../../hooks/useForm';
import { makeForm, makeSection } from '../../tests/factories';
import type { UseFormReturn } from '../../hooks/useForm';

// ─── Mock useForm ─────────────────────────────────────────────────────────────

vi.mock('../../hooks/useForm');

const mockedUseForm = vi.mocked(useFormModule.useForm);

// ─── Factory for UseFormReturn ────────────────────────────────────────────────

function makeUseFormReturn(overrides: Partial<UseFormReturn> = {}): UseFormReturn {
  const form = makeForm();
  const section = form.data.pages[0].sections[0];
  return {
    isLoading: false,
    loadError: null,
    formId: form.id,
    formName: form.name,
    formStatus: 'draft',
    isDirty: false,
    isSaving: false,
    saveError: null,
    activePId: form.data.pages[0].id,
    activeSId: section.id,
    selectedFieldId: null,
    pages: form.data.pages,
    activePage: form.data.pages[0],
    activeSection: section,
    selectedField: null,
    addField: vi.fn(),
    updateField: vi.fn(),
    deleteField: vi.fn(),
    moveField: vi.fn(),
    addRow: vi.fn(),
    deleteRow: vi.fn(),
    setRows: vi.fn(),
    addSection: vi.fn(),
    deleteSection: vi.fn(),
    updateSection: vi.fn(),
    addPage: vi.fn(),
    deletePage: vi.fn(),
    renamePage: vi.fn(),
    updatePage: vi.fn(),
    setActivePage: vi.fn(),
    setActiveSection: vi.fn(),
    setSelectedField: vi.fn(),
    save: vi.fn(),
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('BuilderPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading state when isLoading is true', () => {
    mockedUseForm.mockReturnValue(makeUseFormReturn({ isLoading: true }));

    render(<BuilderPage formId="form-1" />);

    expect(screen.getByText(/loading form/i)).toBeInTheDocument();
  });

  it('should show error message when loadError is set', () => {
    mockedUseForm.mockReturnValue(makeUseFormReturn({ loadError: 'Form not found', isLoading: false }));

    render(<BuilderPage formId="form-1" />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Form not found')).toBeInTheDocument();
  });

  it('should render the canvas when form is loaded', () => {
    mockedUseForm.mockReturnValue(makeUseFormReturn());

    render(<BuilderPage formId="form-1" />);

    expect(screen.getByRole('region', { name: /form canvas/i })).toBeInTheDocument();
  });

  it('should pass useForm with the given formId', () => {
    mockedUseForm.mockReturnValue(makeUseFormReturn());

    render(<BuilderPage formId="abc-123" />);

    expect(mockedUseForm).toHaveBeenCalledWith('abc-123');
  });

  it('should render SettingsPanel alongside the canvas', () => {
    mockedUseForm.mockReturnValue(makeUseFormReturn());

    render(<BuilderPage formId="form-1" />);

    // SettingsPanel renders three tabs
    expect(screen.getByRole('button', { name: /^field$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^page$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^form$/i })).toBeInTheDocument();
  });

  it('should show "Select a field" placeholder when no field is selected', () => {
    mockedUseForm.mockReturnValue(makeUseFormReturn({ selectedField: null }));

    render(<BuilderPage formId="form-1" />);

    expect(screen.getByText(/select a field/i)).toBeInTheDocument();
  });

  it('should display the canvas with "drop fields here" placeholder when section has no rows', () => {
    const sectionWithNoRows = makeSection({ rows: [] });
    mockedUseForm.mockReturnValue(makeUseFormReturn({
      activeSection: sectionWithNoRows,
    }));

    render(<BuilderPage formId="form-1" />);

    expect(screen.getByText(/drop fields here/i)).toBeInTheDocument();
  });
});
