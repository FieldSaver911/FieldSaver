import { useEffect, useCallback } from 'react';
import { useLibraryStore } from '../stores/useLibraryStore';
import { librariesApi } from '../api/libraries';
import type { Library, LibraryRowDef } from '@fieldsaver/shared';
import type { CreateLibraryRowInput, UpdateLibraryRowInput } from '@fieldsaver/shared';

export interface UseLibrariesReturn {
  libraries: Library[];
  loading: boolean;
  error: string | null;
  loadLibraries: () => Promise<void>;
  addRow: (libraryId: string, input: CreateLibraryRowInput) => Promise<LibraryRowDef>;
  updateRow: (libraryId: string, rowId: string, input: UpdateLibraryRowInput) => Promise<LibraryRowDef>;
  deleteRow: (libraryId: string, rowId: string) => Promise<void>;
}

export function useLibraries(): UseLibrariesReturn {
  const libraries = useLibraryStore((state) => state.libraries);
  const loading = useLibraryStore((state) => state.isLoading);
  const error = useLibraryStore((state) => state.error);
  const storeLoadLibraries = useLibraryStore((state) => state.loadLibraries);
  const storeAddRow = useLibraryStore((state) => state.addRow);
  const storeUpdateRow = useLibraryStore((state) => state.updateRow);
  const storeRemoveRow = useLibraryStore((state) => state.removeRow);

  const loadLibraries = useCallback(async () => {
    await storeLoadLibraries();
  }, [storeLoadLibraries]);

  useEffect(() => {
    if (libraries.length === 0 && !loading) {
      loadLibraries();
    }
  }, [libraries.length, loading, loadLibraries]);

  const addRow = useCallback(
    async (libraryId: string, input: CreateLibraryRowInput): Promise<LibraryRowDef> => {
      const row = await librariesApi.createRow(libraryId, input);
      storeAddRow(libraryId, row);
      return row;
    },
    [storeAddRow],
  );

  const updateRow = useCallback(
    async (libraryId: string, rowId: string, input: UpdateLibraryRowInput): Promise<LibraryRowDef> => {
      const row = await librariesApi.updateRow(libraryId, rowId, input);
      storeUpdateRow(libraryId, rowId, row);
      return row;
    },
    [storeUpdateRow],
  );

  const deleteRow = useCallback(
    async (libraryId: string, rowId: string): Promise<void> => {
      await librariesApi.deleteRow(libraryId, rowId);
      storeRemoveRow(libraryId, rowId);
    },
    [storeRemoveRow],
  );

  return {
    libraries,
    loading,
    error,
    loadLibraries,
    addRow,
    updateRow,
    deleteRow,
  };
}
