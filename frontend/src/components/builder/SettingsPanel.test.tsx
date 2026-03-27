import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsPanel } from './SettingsPanel';
import type { Field, Page } from '@fieldsaver/shared';

// ─── Mock useFormStore ────────────────────────────────────────────────────────

const mockStore = {
  form: null as unknown,
  setForm: vi.fn(),
  markDirty: vi.fn(),
  patchPage: vi.fn(),
};

vi.mock('../../stores/useFormStore', () => ({
  useFormStore: vi.fn((selector: ((s: typeof mockStore) => unknown) | undefined) => {
    if (typeof selector === 'function') return selector(mockStore);
    return mockStore;
  }),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeField(overrides: Partial<Field> = {}): Field {
  return {
    id: 'field-1',
    type: 'text',
    label: 'Patient Name',
    required: false,
    placeholder: 'Enter name',
    helpText: '',
    validation: {},
    libraryRows: [],
    dataAttrs: { showCategories: [], isNillable: false },
    behaviour: {
      defaultValue: '',
      memoryField: false,
      geoLocation: false,
      hideQuestion: false,
      enabled: true,
      hintText: '',
      excludeReport: false,
      timeStamp: false,
      hidden: false,
      color: '',
    },
    narrative: { valueText: '', notValueText: '' },
    settings: {},
    ...overrides,
  };
}

function makePage(overrides: Partial<Page> = {}): Page {
  return {
    id: 'page-1',
    title: 'Page 1',
    description: '',
    sections: [],
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('SettingsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render three tabs', () => {
    render(
      <SettingsPanel
        selectedField={null}
        activePage={null}
        activeSection={null}
        onUpdateField={vi.fn()}
        onUpdatePage={vi.fn()}
        onUpdateSection={vi.fn()}
      />,
    );

    expect(screen.getByText('Field')).toBeInTheDocument();
    expect(screen.getByText('Page')).toBeInTheDocument();
    expect(screen.getByText('Form')).toBeInTheDocument();
  });

  it('should show empty state when no field is selected', () => {
    render(
      <SettingsPanel
        selectedField={null}
        activePage={null}
        activeSection={null}
        onUpdateField={vi.fn()}
        onUpdatePage={vi.fn()}
        onUpdateSection={vi.fn()}
      />,
    );

    expect(screen.getByText('Select a field to edit its settings')).toBeInTheDocument();
  });

  it('should render field label input when field is selected', () => {
    render(
      <SettingsPanel
        selectedField={makeField()}
        activePage={null}
        activeSection={null}
        onUpdateField={vi.fn()}
        onUpdatePage={vi.fn()}
        onUpdateSection={vi.fn()}
      />,
    );

    expect(screen.getByDisplayValue('Patient Name')).toBeInTheDocument();
  });

  it('should call onUpdateField when label changes', () => {
    const onUpdateField = vi.fn();

    render(
      <SettingsPanel
        selectedField={makeField()}
        activePage={null}
        activeSection={null}
        onUpdateField={onUpdateField}
        onUpdatePage={vi.fn()}
        onUpdateSection={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByDisplayValue('Patient Name'), {
      target: { value: 'Full Name' },
    });

    expect(onUpdateField).toHaveBeenCalledWith(expect.objectContaining({ label: 'Full Name' }));
  });

  it('should switch to Page tab and show page title input', () => {
    render(
      <SettingsPanel
        selectedField={null}
        activePage={makePage({ title: 'Incident Details' })}
        activeSection={null}
        onUpdateField={vi.fn()}
        onUpdatePage={vi.fn()}
        onUpdateSection={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText('Page'));

    expect(screen.getByDisplayValue('Incident Details')).toBeInTheDocument();
  });

  it('should call onUpdatePage when page title changes', () => {
    const onUpdatePage = vi.fn();

    render(
      <SettingsPanel
        selectedField={null}
        activePage={makePage({ title: 'Page 1' })}
        activeSection={null}
        onUpdateField={vi.fn()}
        onUpdatePage={onUpdatePage}
        onUpdateSection={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText('Page'));
    fireEvent.change(screen.getByDisplayValue('Page 1'), {
      target: { value: 'Incident Info' },
    });

    expect(onUpdatePage).toHaveBeenCalledWith(expect.objectContaining({ title: 'Incident Info' }));
  });

  it('should auto-switch to Field tab when selectedField changes', () => {
    const { rerender } = render(
      <SettingsPanel
        selectedField={null}
        activePage={makePage()}
        activeSection={null}
        onUpdateField={vi.fn()}
        onUpdatePage={vi.fn()}
        onUpdateSection={vi.fn()}
      />,
    );

    // Switch to Page tab
    fireEvent.click(screen.getByText('Page'));

    // Now a field gets selected
    rerender(
      <SettingsPanel
        selectedField={makeField()}
        activePage={makePage()}
        activeSection={null}
        onUpdateField={vi.fn()}
        onUpdatePage={vi.fn()}
        onUpdateSection={vi.fn()}
      />,
    );

    // Should show field content
    expect(screen.getByDisplayValue('Patient Name')).toBeInTheDocument();
  });

  it('should toggle required when toggle is clicked', () => {
    const onUpdateField = vi.fn();

    render(
      <SettingsPanel
        selectedField={makeField({ required: false })}
        activePage={null}
        activeSection={null}
        onUpdateField={onUpdateField}
        onUpdatePage={vi.fn()}
        onUpdateSection={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('switch', { name: /required/i }));

    expect(onUpdateField).toHaveBeenCalledWith(expect.objectContaining({ required: true }));
  });
});
