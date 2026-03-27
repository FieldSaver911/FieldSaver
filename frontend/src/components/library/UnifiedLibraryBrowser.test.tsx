import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LibraryBrowser } from './LibraryBrowser';
import { makeLibrary, makeLibraryRowDef } from '../../tests/factories';

const mockLoadLibraries = vi.fn();

vi.mock('../../stores/useLibraryStore', () => ({
  useLibraryStore: vi.fn((selector: (s: unknown) => unknown) =>
    selector({
      libraries: [
        makeLibrary({
          id: 'lib-1',
          name: 'NEMSIS v3.5',
          rows: [
            makeLibraryRowDef({ id: 'row-1', label: 'Systolic BP', exportKey: 'eVitals.SBP', category: 'Data Element', code: '3796001' }),
            makeLibraryRowDef({ id: 'row-2', label: 'Not Recorded', exportKey: 'notRecorded', category: 'NOT Value', code: '7701003' }),
          ],
        }),
      ],
      isLoading: false,
      error: null,
      loadLibraries: mockLoadLibraries,
      addLibrary: vi.fn(),
      addRow: vi.fn(),
      updateRow: vi.fn(),
      removeRow: vi.fn(),
    }),
  ),
}));

vi.mock('../../api/libraries', () => ({
  librariesApi: {
    list: vi.fn().mockResolvedValue([]),
    listRows: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    createRow: vi.fn(),
    updateRow: vi.fn(),
    deleteRow: vi.fn(),
  },
}));

describe('LibraryBrowser', () => {
  beforeEach(() => {
    mockLoadLibraries.mockClear();
  });

  it('should render the library browser modal', () => {
    render(<LibraryBrowser onClose={vi.fn()} />);
    expect(screen.getByText('Library Browser')).toBeInTheDocument();
  });

  it('should list libraries in the sidebar', () => {
    render(<LibraryBrowser onClose={vi.fn()} />);
    expect(screen.getByText('NEMSIS v3.5')).toBeInTheDocument();
  });

  it('should show Browse and Manage mode buttons', () => {
    render(<LibraryBrowser onClose={vi.fn()} />);
    // Use getAllByRole because "Browse" text may appear in multiple buttons
    const browseButtons = screen.getAllByRole('button', { name: /browse/i });
    expect(browseButtons.length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: /manage/i }).length).toBeGreaterThan(0);
  });

  it('should default to browse mode', () => {
    render(<LibraryBrowser onClose={vi.fn()} />);
    // In browse mode, rows have checkboxes
    expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(0);
  });

  it('should display library row labels in browse mode', () => {
    render(<LibraryBrowser onClose={vi.fn()} />);
    expect(screen.getByText('Systolic BP')).toBeInTheDocument();
    expect(screen.getByText('Not Recorded')).toBeInTheDocument();
  });

  it('should call onClose when Cancel is clicked', () => {
    const onClose = vi.fn();
    render(<LibraryBrowser onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('should call onClose when backdrop is clicked', () => {
    const onClose = vi.fn();
    const { container } = render(<LibraryBrowser onClose={onClose} />);
    // The backdrop is the outermost div
    fireEvent.click(container.firstChild as HTMLElement);
    expect(onClose).toHaveBeenCalled();
  });

  it('should pre-check rows that are already assigned', () => {
    const assigned = [
      {
        libraryId: 'lib-1',
        rowId: 'row-1',
        label: 'Systolic BP',
        exportKey: 'eVitals.SBP',
        code: '3796001',
        category: 'Data Element',
        subCategory: 'Clinical',
      },
    ];
    render(<LibraryBrowser onClose={vi.fn()} assignedRows={assigned} />);
    const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
    const checkedBoxes = checkboxes.filter((cb) => cb.checked);
    expect(checkedBoxes.length).toBeGreaterThan(0);
  });

  it('should call onAssign with selected rows when Assign is clicked', async () => {
    const onAssign = vi.fn();
    const onClose = vi.fn();
    render(<LibraryBrowser onClose={onClose} onAssign={onAssign} />);

    // Toggle a checkbox
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);

    fireEvent.click(screen.getByRole('button', { name: /assign/i }));

    await waitFor(() => {
      expect(onAssign).toHaveBeenCalled();
    });
  });

  it('should switch to manage mode when Manage button is clicked', () => {
    render(<LibraryBrowser onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /manage/i }));
    // In manage mode there should be an "Add Row" button instead of Assign
    expect(screen.getByRole('button', { name: /add row/i })).toBeInTheDocument();
  });

  it('should show row count in footer', () => {
    render(<LibraryBrowser onClose={vi.fn()} />);
    expect(screen.getByText(/2 rows/i)).toBeInTheDocument();
  });

  it('should start with manage mode when initialMode prop is manage', () => {
    render(<LibraryBrowser onClose={vi.fn()} initialMode="manage" />);
    expect(screen.getByRole('button', { name: /add row/i })).toBeInTheDocument();
  });
});
