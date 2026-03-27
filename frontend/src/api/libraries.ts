import { api } from './client';
import type { Library, LibraryRowDef } from '@fieldsaver/shared';
import type {
  CreateLibraryInput, UpdateLibraryInput,
  CreateLibraryRowInput, UpdateLibraryRowInput,
  BulkCreateLibraryRowsInput, ListLibraryRowsQuery,
} from '@fieldsaver/shared';

export const librariesApi = {
  list(): Promise<Library[]> {
    return api.get<Library[]>('/libraries');
  },

  getById(id: string): Promise<Library> {
    return api.get<Library>(`/libraries/${id}`);
  },

  create(input: CreateLibraryInput): Promise<Library> {
    return api.post<Library>('/libraries', input);
  },

  update(id: string, input: UpdateLibraryInput): Promise<Library> {
    return api.put<Library>(`/libraries/${id}`, input);
  },

  delete(id: string): Promise<void> {
    return api.delete<void>(`/libraries/${id}`);
  },

  // Rows
  listRows(libraryId: string, query?: Partial<ListLibraryRowsQuery>): Promise<LibraryRowDef[]> {
    const params = new URLSearchParams(query as Record<string, string>);
    return api.get<LibraryRowDef[]>(`/libraries/${libraryId}/rows?${params}`);
  },

  createRow(libraryId: string, input: CreateLibraryRowInput): Promise<LibraryRowDef> {
    return api.post<LibraryRowDef>(`/libraries/${libraryId}/rows`, input);
  },

  updateRow(libraryId: string, rowId: string, input: UpdateLibraryRowInput): Promise<LibraryRowDef> {
    return api.put<LibraryRowDef>(`/libraries/${libraryId}/rows/${rowId}`, input);
  },

  deleteRow(libraryId: string, rowId: string): Promise<void> {
    return api.delete<void>(`/libraries/${libraryId}/rows/${rowId}`);
  },

  bulkCreateRows(libraryId: string, input: BulkCreateLibraryRowsInput): Promise<LibraryRowDef[]> {
    return api.post<LibraryRowDef[]>(`/libraries/${libraryId}/rows/bulk`, input);
  },
};
