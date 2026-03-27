import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLibraries } from './useLibraries';
import { makeLibrary, makeLibraryRowDef } from '../tests/factories';

// vi.mock factories are hoisted to the top of the file by Vitest, so we cannot
// reference module-level variables inside them. Use inline literals instead.

const mockLoadLibraries = vi.fn();
const mockStoreAddRow = vi.fn();
const mockStoreUpdateRow = vi.fn();
const mockStoreRemoveRow = vi.fn();

vi.mock('../stores/useLibraryStore', () => ({
  useLibraryStore: vi.fn((selector: (s: unknown) => unknown) =>
    selector({
      libraries: [],          // populated per-test via makeLibrary()
      isLoading: false,
      error: null,
      loadLibraries: vi.fn(),
      addRow: vi.fn(),
      updateRow: vi.fn(),
      removeRow: vi.fn(),
    }),
  ),
}));

vi.mock('../api/libraries', () => ({
  librariesApi: {
    createRow: vi.fn(),
    updateRow: vi.fn(),
    deleteRow: vi.fn().mockResolvedValue(undefined),
  },
}));

// Helpers built after mocks are registered
function buildTestRow() {
  return makeLibraryRowDef({ id: 'row-1', libraryId: 'lib-1' });
}

function buildTestLibrary() {
  return makeLibrary({ id: 'lib-1', rows: [buildTestRow()] });
}

// Re-import api after mocking so we can configure return values
import * as librariesApiModule from '../api/libraries';
import { useLibraryStore } from '../stores/useLibraryStore';

describe('useLibraries', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const testRow = buildTestRow();
    const testLibrary = buildTestLibrary();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useLibraryStore as any).mockImplementation((selector: (s: unknown) => unknown) =>
      selector({
        libraries: [testLibrary],
        isLoading: false,
        error: null,
        loadLibraries: mockLoadLibraries,
        addRow: mockStoreAddRow,
        updateRow: mockStoreUpdateRow,
        removeRow: mockStoreRemoveRow,
      }),
    );

    vi.mocked(librariesApiModule.librariesApi.createRow).mockResolvedValue(testRow);
    vi.mocked(librariesApiModule.librariesApi.updateRow).mockResolvedValue({
      ...testRow,
      label: 'Updated',
    });
  });

  it('should return libraries from the store', () => {
    const { result } = renderHook(() => useLibraries());
    expect(result.current.libraries).toHaveLength(1);
    expect(result.current.libraries[0].id).toBe('lib-1');
  });

  it('should return loading and error state', () => {
    const { result } = renderHook(() => useLibraries());
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should call store addRow and return the created row on addRow()', async () => {
    const testRow = buildTestRow();
    const { result } = renderHook(() => useLibraries());
    let row;
    await act(async () => {
      row = await result.current.addRow('lib-1', {
        label: 'New Row',
        exportKey: 'eTest.01',
        code: '',
        description: '',
        category: 'Data Element',
        subCategory: '',
        usage: 'Optional',
        elementId: '',
        sortOrder: 0,
      });
    });
    expect(mockStoreAddRow).toHaveBeenCalledWith('lib-1', testRow);
    expect(row).toEqual(testRow);
  });

  it('should call store updateRow on updateRow()', async () => {
    const { result } = renderHook(() => useLibraries());
    await act(async () => {
      await result.current.updateRow('lib-1', 'row-1', { label: 'Updated' });
    });
    expect(mockStoreUpdateRow).toHaveBeenCalledWith(
      'lib-1',
      'row-1',
      expect.objectContaining({ label: 'Updated' }),
    );
  });

  it('should call store removeRow on deleteRow()', async () => {
    const { result } = renderHook(() => useLibraries());
    await act(async () => {
      await result.current.deleteRow('lib-1', 'row-1');
    });
    expect(mockStoreRemoveRow).toHaveBeenCalledWith('lib-1', 'row-1');
  });

  it('should expose loadLibraries function', () => {
    const { result } = renderHook(() => useLibraries());
    expect(typeof result.current.loadLibraries).toBe('function');
  });
});
