import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useForm } from './useForm';
import type { Form } from '@fieldsaver/shared';

// ─── Mock useFormStore ────────────────────────────────────────────────────────

const mockLoadForm = vi.fn();
const mockSave = vi.fn();
const mockPatchSection = vi.fn();
const mockPatchPage = vi.fn();
const mockSetForm = vi.fn();
const mockMarkDirty = vi.fn();
const mockAddSection = vi.fn();
const mockDeleteSection = vi.fn();
const mockAddPage = vi.fn();
const mockDeletePage = vi.fn();
const mockRenamePage = vi.fn();
const mockSetActivePage = vi.fn();
const mockSetActiveSection = vi.fn();
const mockSetSelectedField = vi.fn();
const mockSetRows = vi.fn();

function makeForm(overrides: Partial<Form> = {}): Form {
  return {
    id: 'form-abc',
    userId: 'user-1',
    name: 'Test Form',
    description: '',
    data: {
      pages: [
        {
          id: 'page-1',
          title: 'Page 1',
          description: '',
          sections: [
            {
              id: 'sec-1',
              title: 'Section 1',
              settings: { repeatable: false, repeatLabel: '+ Add Another', maxRepeats: 5 },
              rows: [],
            },
          ],
        },
      ],
      libraries: [],
      narrativeTemplates: [],
    },
    settings: {
      submitLabel: 'Submit',
      successMessage: 'Thanks',
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
    },
    status: 'draft',
    publishedAt: null,
    version: 1,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    deletedAt: null,
    ...overrides,
  };
}

const storeState = {
  form: makeForm() as Form | null,
  activePId: 'page-1' as string | null,
  activeSId: 'sec-1' as string | null,
  selFId: null as string | null,
  isDirty: false,
  isSaving: false,
  saveError: null as string | null,
  activePage: makeForm().data.pages[0],
  activeSection: makeForm().data.pages[0].sections[0],
  selectedField: null,
  loadForm: mockLoadForm,
  save: mockSave,
  patchSection: mockPatchSection,
  patchPage: mockPatchPage,
  setForm: mockSetForm,
  markDirty: mockMarkDirty,
  addSection: mockAddSection,
  deleteSection: mockDeleteSection,
  addPage: mockAddPage,
  deletePage: mockDeletePage,
  renamePage: mockRenamePage,
  setActivePage: mockSetActivePage,
  setActiveSection: mockSetActiveSection,
  setSelectedField: mockSetSelectedField,
  setRows: mockSetRows,
};

vi.mock('../stores/useFormStore', () => ({
  useFormStore: vi.fn((selector: ((s: typeof storeState) => unknown) | undefined) => {
    // Zustand hook is always called with a selector in useForm
    if (typeof selector === 'function') return selector(storeState);
    return storeState;
  }),
}));

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoadForm.mockResolvedValue(undefined);
    storeState.form = makeForm();
    storeState.activePId = 'page-1';
    storeState.activeSId = 'sec-1';
    storeState.selFId = null;
    storeState.isDirty = false;
    storeState.activePage = makeForm().data.pages[0];
    storeState.activeSection = makeForm().data.pages[0].sections[0];
  });

  it('should call loadForm on mount with the given formId', async () => {
    renderHook(() => useForm('form-abc'));

    expect(mockLoadForm).toHaveBeenCalledWith('form-abc');
  });

  it('should expose formName and formStatus from store', async () => {
    mockLoadForm.mockResolvedValue(undefined);

    const { result } = renderHook(() => useForm('form-abc'));

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.formName).toBe('Test Form');
    expect(result.current.formStatus).toBe('draft');
  });

  it('should set loadError when loadForm throws', async () => {
    mockLoadForm.mockRejectedValue(new Error('Not found'));

    const { result } = renderHook(() => useForm('bad-id'));

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.loadError).toBe('Not found');
    expect(result.current.isLoading).toBe(false);
  });

  it('should call patchSection when addField is called', async () => {
    mockLoadForm.mockResolvedValue(undefined);

    const { result } = renderHook(() => useForm('form-abc'));

    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      result.current.addField('text');
    });

    expect(mockPatchSection).toHaveBeenCalledWith(
      'page-1',
      'sec-1',
      expect.objectContaining({ rows: expect.any(Array) }),
    );
  });

  it('should call save from store', async () => {
    mockLoadForm.mockResolvedValue(undefined);
    mockSave.mockResolvedValue(undefined);

    const { result } = renderHook(() => useForm('form-abc'));

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await result.current.save();
    });

    expect(mockSave).toHaveBeenCalled();
  });

  it('should expose pages from the form', async () => {
    const { result } = renderHook(() => useForm('form-abc'));

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.pages).toHaveLength(1);
    expect(result.current.pages[0].id).toBe('page-1');
  });

  it('should call addSection from store via addSection', async () => {
    const { result } = renderHook(() => useForm('form-abc'));

    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      result.current.addSection();
    });

    expect(mockAddSection).toHaveBeenCalledWith('page-1');
  });

  it('should call deleteSection from store via deleteSection', async () => {
    const { result } = renderHook(() => useForm('form-abc'));

    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      result.current.deleteSection('sec-1');
    });

    expect(mockDeleteSection).toHaveBeenCalledWith('page-1', 'sec-1');
  });
});
