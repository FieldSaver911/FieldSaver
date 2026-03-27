import { create } from 'zustand';
import type { Library, LibraryRowDef } from '@fieldsaver/shared';
import { librariesApi } from '../api/libraries';

interface LibraryStore {
  libraries: Library[];
  isLoading: boolean;
  error: string | null;

  loadLibraries: () => Promise<void>;
  updateLibrary: (id: string, patch: Partial<Library>) => void;
  addLibrary: (library: Library) => void;
  removeLibrary: (id: string) => void;

  addRow: (libraryId: string, row: LibraryRowDef) => void;
  updateRow: (libraryId: string, rowId: string, patch: Partial<LibraryRowDef>) => void;
  removeRow: (libraryId: string, rowId: string) => void;
  setRows: (libraryId: string, rows: LibraryRowDef[]) => void;
}

export const useLibraryStore = create<LibraryStore>((set, get) => ({
  libraries: [],
  isLoading: false,
  error: null,

  loadLibraries: async () => {
    set({ isLoading: true, error: null });
    try {
      const libs = await librariesApi.list();
      // Load rows for each library
      const withRows = await Promise.all(
        libs.map(async (lib) => {
          const rows = await librariesApi.listRows(lib.id);
          return { ...lib, rows };
        }),
      );
      set({ libraries: withRows });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  updateLibrary: (id: string, patch: Partial<Library>) => {
    set((state) => ({
      libraries: state.libraries.map((l) => l.id === id ? { ...l, ...patch } : l),
    }));
  },

  addLibrary: (library: Library) => {
    set((state) => ({ libraries: [...state.libraries, library] }));
  },

  removeLibrary: (id: string) => {
    set((state) => ({ libraries: state.libraries.filter((l) => l.id !== id) }));
  },

  addRow: (libraryId: string, row: LibraryRowDef) => {
    set((state) => ({
      libraries: state.libraries.map((l) =>
        l.id !== libraryId ? l : { ...l, rows: [...(l.rows ?? []), row] },
      ),
    }));
  },

  updateRow: (libraryId: string, rowId: string, patch: Partial<LibraryRowDef>) => {
    set((state) => ({
      libraries: state.libraries.map((l) =>
        l.id !== libraryId ? l : {
          ...l,
          rows: (l.rows ?? []).map((r) => r.id === rowId ? { ...r, ...patch } : r),
        },
      ),
    }));
  },

  removeRow: (libraryId: string, rowId: string) => {
    set((state) => ({
      libraries: state.libraries.map((l) =>
        l.id !== libraryId ? l : {
          ...l,
          rows: (l.rows ?? []).filter((r) => r.id !== rowId),
        },
      ),
    }));
  },

  setRows: (libraryId: string, rows: LibraryRowDef[]) => {
    set((state) => ({
      libraries: state.libraries.map((l) => l.id === libraryId ? { ...l, rows } : l),
    }));
  },
}));
