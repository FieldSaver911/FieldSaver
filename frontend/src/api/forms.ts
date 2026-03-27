import { api } from './client';
import type { Form, PaginatedResponse } from '@fieldsaver/shared';
import type { CreateFormInput, UpdateFormInput, ListFormsQuery } from '@fieldsaver/shared';

export const formsApi = {
  list(query?: Partial<ListFormsQuery>): Promise<PaginatedResponse<Form>['data']> {
    const params = new URLSearchParams(query as Record<string, string>);
    return api.get<Form[]>(`/forms?${params}`);
  },

  getById(id: string): Promise<Form> {
    return api.get<Form>(`/forms/${id}`);
  },

  create(input: CreateFormInput): Promise<Form> {
    return api.post<Form>('/forms', input);
  },

  update(id: string, input: UpdateFormInput): Promise<Form> {
    return api.patch<Form>(`/forms/${id}`, input);
  },

  replace(id: string, input: UpdateFormInput): Promise<Form> {
    return api.put<Form>(`/forms/${id}`, input);
  },

  delete(id: string): Promise<void> {
    return api.delete<void>(`/forms/${id}`);
  },

  publish(id: string): Promise<Form> {
    return api.post<Form>(`/forms/${id}/publish`);
  },

  duplicate(id: string): Promise<Form> {
    return api.post<Form>(`/forms/${id}/duplicate`);
  },

  exportKeyMap(id: string): Promise<Record<string, unknown>> {
    return api.get<Record<string, unknown>>(`/forms/${id}/export`);
  },
};
