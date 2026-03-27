/**
 * Component tests for LibraryBrowser.
 *
 * The Zustand store and the API client are mocked so tests run without a
 * real backend. The useLibraries hook is mocked to control what the component
 * sees as library state.
 *
 * vi.mock factories must not reference module-level variables because they are
 * hoisted to the top of the file before any variable declarations run.
 * All mock functions are declared inline with vi.fn() inside the factory.
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { LibraryBrowser } from './LibraryBrowser';
import { makeLibrary, makeLibraryRowDef, makeAssignedLibraryRow } from '../../tests/factories';
import type { Library, LibraryRowDef } from '@fieldsaver/shared';

// ─── Mock the libraries API ───────────────────────────────────────────────────
// All functions are vi.fn() inline — no module-level references allowed here.

vi.mock('../../api/libraries', () => ({
  librariesApi: {
    list: vi.fn().mockResolvedValue([]),
    getById: vi.fn(),
    create: vi.fn().mockResolvedValue({}),
    update: vi.fn(),
    delete: vi.fn(),
    listRows: vi.fn().mockResolvedValue([]),
    createRow: vi.fn(),
    updateRow: vi.fn(),
    deleteRow: vi.fn(),
    bulkCreateRows: vi.fn(),
  },
}));

// ─── Mock the Zustand store ────────────────────────────────────────────────────
// Similarly, all functions are vi.fn() inline.

vi.mock('../../stores/useLibraryStore', () => ({
  useLibraryStore: (selector: (s: unknown) => unknown) =>
    selector({
      libraries: [],
      isLoading: false,
      error: null,
      loadLibraries: vi.fn(),
      addLibrary: vi.fn(),
      updateLibrary: vi.fn(),
      removeLibrary: vi.fn(),
      addRow: vi.fn(),
      updateRow: vi.fn(),
      removeRow: vi.fn(),
      setRows: vi.fn(),
    }),
}));

// ─── Module-level state for the useLibraries mock ─────────────────────────────
// These are declared at module level and read by the mock factory via closure.
// Because vi.mock for useLibraries uses an inline factory that accesses these
// through a getter, it is safe to declare them here.

let mockLibraries: Library[] = [];
let mockLoading = false;
let mockError: string | null = null;
const mockLoadLibraries = vi.fn().mockResolvedValue(undefined);
const mockAddRow = vi.fn();
const mockUpdateRow = vi.fn();
const mockDeleteRow = vi.fn();

vi.mock('../../hooks/useLibraries', () => ({
  useLibraries: () => ({
    get libraries() { return mockLibraries; },
    get loading() { return mockLoading; },
    get error() { return mockError; },
    loadLibraries: mockLoadLibraries,
    addRow: mockAddRow,
    updateRow: mockUpdateRow,
    deleteRow: mockDeleteRow,
  }),
}));

// ─── Render helper ────────────────────────────────────────────────────────────

function renderBrowser(overrides: Partial<React.ComponentProps<typeof LibraryBrowser>> = {}) {
  const onClose = vi.fn();
  const onAssign = vi.fn();

  const utils = render(
    <LibraryBrowser
      onClose={onClose}
      onAssign={onAssign}
      assignedRows={[]}
      initialMode="browse"
      {...overrides}
    />,
  );

  return { ...utils, onClose, onAssign };
}

// ─── Library list rendering ───────────────────────────────────────────────────

describe('LibraryBrowser — library list', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLibraries = [];
    mockLoading = false;
    mockError = null;
  });

  it('should render the "Library Browser" heading', () => {
    renderBrowser();
    expect(screen.getByText('Library Browser')).toBeInTheDocument();
  });

  it('should render a sidebar item for each library', () => {
    mockLibraries = [
      makeLibrary({ name: 'NEMSIS v3.5', rows: [] }),
      makeLibrary({ name: 'Custom Vitals', rows: [] }),
    ];

    renderBrowser();

    expect(screen.getByText('NEMSIS v3.5')).toBeInTheDocument();
    expect(screen.getByText('Custom Vitals')).toBeInTheDocument();
  });

  it('should display the row count for each library in the sidebar', () => {
    const rows = [makeLibraryRowDef(), makeLibraryRowDef(), makeLibraryRowDef()];
    mockLibraries = [makeLibrary({ name: 'With Rows', rows })];

    renderBrowser();

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should select the first library automatically when libraries load', () => {
    const lib1 = makeLibrary({ name: 'First Library', rows: [] });
    const lib2 = makeLibrary({ name: 'Second Library', rows: [] });
    mockLibraries = [lib1, lib2];

    renderBrowser();

    expect(screen.getByText('First Library')).toBeInTheDocument();
  });

  it('should switch the active library and display its rows when a sidebar item is clicked', () => {
    const rowForLib2 = makeLibraryRowDef({ label: 'Lib 2 Row', libraryId: 'lib2' });
    const lib1 = makeLibrary({ id: 'lib1', name: 'Library One', rows: [] });
    const lib2 = makeLibrary({ id: 'lib2', name: 'Library Two', rows: [rowForLib2] });
    mockLibraries = [lib1, lib2];

    renderBrowser();

    fireEvent.click(screen.getByText('Library Two'));

    expect(screen.getByText('Lib 2 Row')).toBeInTheDocument();
  });
});

// ─── Rows table rendering ─────────────────────────────────────────────────────

describe('LibraryBrowser — rows table', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoading = false;
    mockError = null;
  });

  it('should render a row for each entry in the active library', () => {
    const rows: LibraryRowDef[] = [
      makeLibraryRowDef({ label: 'Systolic BP', exportKey: 'eVitals.SBP' }),
      makeLibraryRowDef({ label: 'Heart Rate', exportKey: 'eVitals.HR' }),
    ];
    mockLibraries = [makeLibrary({ rows })];

    renderBrowser();

    expect(screen.getByText('Systolic BP')).toBeInTheDocument();
    expect(screen.getByText('Heart Rate')).toBeInTheDocument();
  });

  it('should display the export key for each row', () => {
    const rows: LibraryRowDef[] = [
      makeLibraryRowDef({ label: 'Gender', exportKey: 'ePatient.Gender' }),
    ];
    mockLibraries = [makeLibrary({ rows })];

    renderBrowser();

    expect(screen.getByText('ePatient.Gender')).toBeInTheDocument();
  });

  it('should display the row code when present', () => {
    const rows: LibraryRowDef[] = [
      makeLibraryRowDef({ label: 'Bradycardia', code: '8801013' }),
    ];
    mockLibraries = [makeLibrary({ rows })];

    renderBrowser();

    expect(screen.getByText('8801013')).toBeInTheDocument();
  });
});

// ─── Category filtering ───────────────────────────────────────────────────────

describe('LibraryBrowser — category filtering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoading = false;
    mockError = null;
  });

  it('should show all rows when no category filter is active', () => {
    const rows: LibraryRowDef[] = [
      makeLibraryRowDef({ label: 'DE Row', category: 'Data Element' }),
      makeLibraryRowDef({ label: 'NV Row', category: 'NOT Value' }),
    ];
    mockLibraries = [makeLibrary({ rows })];

    renderBrowser();

    expect(screen.getByText('DE Row')).toBeInTheDocument();
    expect(screen.getByText('NV Row')).toBeInTheDocument();
  });

  it('should filter rows to match the selected category when a category is applied', async () => {
    const rows: LibraryRowDef[] = [
      makeLibraryRowDef({ label: 'DE Row', category: 'Data Element' }),
      makeLibraryRowDef({ label: 'PN Row', category: 'Pertinent Negative' }),
    ];
    mockLibraries = [makeLibrary({ rows })];

    renderBrowser();

    fireEvent.click(screen.getByText('All Categories'));

    const deCheckbox = screen.getByRole('checkbox', { name: 'Data Element' });
    fireEvent.click(deCheckbox);

    await waitFor(() => {
      expect(screen.getByText('DE Row')).toBeInTheDocument();
      expect(screen.queryByText('PN Row')).not.toBeInTheDocument();
    });
  });

  it('should restore all rows after clearing the category filter', async () => {
    const rows: LibraryRowDef[] = [
      makeLibraryRowDef({ label: 'Alpha', category: 'Data Element' }),
      makeLibraryRowDef({ label: 'Beta', category: 'NOT Value' }),
    ];
    mockLibraries = [makeLibrary({ rows })];

    renderBrowser();

    fireEvent.click(screen.getByText('All Categories'));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Data Element' }));

    await waitFor(() => {
      expect(screen.queryByText('Beta')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Clear filters'));

    await waitFor(() => {
      expect(screen.getByText('Alpha')).toBeInTheDocument();
      expect(screen.getByText('Beta')).toBeInTheDocument();
    });
  });

  it('should filter rows matching the search term', async () => {
    const rows: LibraryRowDef[] = [
      makeLibraryRowDef({ label: 'Systolic Blood Pressure', code: 'SBP001' }),
      makeLibraryRowDef({ label: 'Heart Rate', code: 'HR001' }),
    ];
    mockLibraries = [makeLibrary({ rows })];

    renderBrowser();

    const searchInput = screen.getByPlaceholderText('Search label or code…');
    fireEvent.change(searchInput, { target: { value: 'systolic' } });

    await waitFor(() => {
      expect(screen.getByText('Systolic Blood Pressure')).toBeInTheDocument();
      expect(screen.queryByText('Heart Rate')).not.toBeInTheDocument();
    });
  });
});

// ─── Browse mode ──────────────────────────────────────────────────────────────

describe('LibraryBrowser — browse mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoading = false;
    mockError = null;
  });

  it('should render a checkbox for each row in browse mode', () => {
    const rows: LibraryRowDef[] = [
      makeLibraryRowDef({ label: 'Row A' }),
      makeLibraryRowDef({ label: 'Row B' }),
    ];
    mockLibraries = [makeLibrary({ rows })];

    renderBrowser({ initialMode: 'browse' });

    // Each browse row has an inline checkbox
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThanOrEqual(2);
  });

  it('should pre-check rows that are already in assignedRows', () => {
    const row = makeLibraryRowDef({ label: 'Pre-assigned Row' });
    const assignedRow = makeAssignedLibraryRow({ rowId: row.id, label: row.label });
    mockLibraries = [makeLibrary({ rows: [row] })];

    renderBrowser({ assignedRows: [assignedRow], initialMode: 'browse' });

    // The row is visible in the table
    expect(screen.getByText('Pre-assigned Row')).toBeInTheDocument();
    // The checkbox for that row should be checked
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  it('should call onAssign with the selected rows when the confirm button is clicked', async () => {
    const row = makeLibraryRowDef({ label: 'Confirm Row', exportKey: 'eTest.Confirm' });
    mockLibraries = [makeLibrary({ rows: [row] })];

    const onAssign = vi.fn();
    const onClose = vi.fn();
    render(
      <LibraryBrowser
        onClose={onClose}
        onAssign={onAssign}
        assignedRows={[]}
        initialMode="browse"
      />,
    );

    // Toggle the row via its table row click
    const rowEl = screen.getByText('Confirm Row').closest('tr');
    if (rowEl) fireEvent.click(rowEl);

    const confirmBtn = screen.getByRole('button', { name: /confirm|assign/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(onAssign).toHaveBeenCalledTimes(1);
    });
  });

  it('should call onClose when the close button is clicked', () => {
    mockLibraries = [];
    const { onClose } = renderBrowser({ initialMode: 'browse' });

    const closeBtn = screen.getByRole('button', { name: /close|✕|×/i });
    fireEvent.click(closeBtn);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

// ─── Manage mode ──────────────────────────────────────────────────────────────

describe('LibraryBrowser — manage mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoading = false;
    mockError = null;
  });

  it('should render edit and delete action buttons in manage mode', () => {
    const rows: LibraryRowDef[] = [makeLibraryRowDef({ label: 'Editable Row' })];
    mockLibraries = [makeLibrary({ rows })];

    renderBrowser({ initialMode: 'manage' });

    expect(screen.getByRole('button', { name: /edit row/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete row/i })).toBeInTheDocument();
  });

  it('should show an inline edit form when the edit button is clicked', async () => {
    const rows: LibraryRowDef[] = [makeLibraryRowDef({ label: 'Inline Edit Row' })];
    mockLibraries = [makeLibrary({ rows })];

    renderBrowser({ initialMode: 'manage' });

    fireEvent.click(screen.getByRole('button', { name: /edit row/i }));

    await waitFor(() => {
      const inputs = screen.getAllByRole('textbox');
      const values = inputs.map((i) => (i as HTMLInputElement).value);
      expect(values).toContain('Inline Edit Row');
    });
  });

  it('should call updateRow and exit the edit form when Save is clicked', async () => {
    const row = makeLibraryRowDef({ label: 'Pre-save Row' });
    mockLibraries = [makeLibrary({ rows: [row] })];
    mockUpdateRow.mockResolvedValue({ ...row, label: 'Post-save Row' });

    renderBrowser({ initialMode: 'manage' });

    fireEvent.click(screen.getByRole('button', { name: /edit row/i }));

    await waitFor(() => {
      expect(screen.getAllByRole('textbox').length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));

    await waitFor(() => {
      expect(mockUpdateRow).toHaveBeenCalledTimes(1);
    });
  });

  it('should call deleteRow when the delete button is clicked', async () => {
    const row = makeLibraryRowDef({ label: 'Delete Me Row' });
    mockLibraries = [makeLibrary({ rows: [row] })];
    mockDeleteRow.mockResolvedValue(undefined);

    renderBrowser({ initialMode: 'manage' });

    fireEvent.click(screen.getByRole('button', { name: /delete row/i }));

    await waitFor(() => {
      expect(mockDeleteRow).toHaveBeenCalledTimes(1);
    });
  });

  it('should render an Add Row button in manage mode', () => {
    mockLibraries = [makeLibrary({ rows: [] })];

    renderBrowser({ initialMode: 'manage' });

    expect(screen.getByText('+ Add Row')).toBeInTheDocument();
  });

  it('should show the new-row form with label and export key inputs when Add Row is clicked', () => {
    mockLibraries = [makeLibrary({ rows: [] })];

    renderBrowser({ initialMode: 'manage' });

    fireEvent.click(screen.getByText('+ Add Row'));

    expect(screen.getByPlaceholderText('Label *')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Export Key *')).toBeInTheDocument();
  });

  it('should switch to manage mode when the Manage tab is clicked', () => {
    const rows: LibraryRowDef[] = [makeLibraryRowDef({ label: 'Mode Switch Row' })];
    mockLibraries = [makeLibrary({ rows })];

    renderBrowser({ initialMode: 'browse' });

    fireEvent.click(screen.getByRole('button', { name: /manage/i }));

    expect(screen.getByRole('button', { name: /edit row/i })).toBeInTheDocument();
  });
});

// ─── Loading and error states ─────────────────────────────────────────────────

describe('LibraryBrowser — loading and error states', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show a loading indicator when libraries are loading', () => {
    mockLibraries = [];
    mockLoading = true;
    mockError = null;

    renderBrowser();

    // A loading state indicator must be present (text or spinner element)
    const loadingIndicator =
      screen.queryByText(/loading/i) ??
      document.querySelector('[aria-busy="true"]') ??
      screen.queryByText('…');
    expect(loadingIndicator).toBeTruthy();
  });

  it('should show an error message when the store reports an error', () => {
    mockLibraries = [];
    mockLoading = false;
    mockError = 'Failed to load libraries';

    renderBrowser();

    expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
  });
});
