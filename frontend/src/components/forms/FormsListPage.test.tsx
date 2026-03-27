/**
 * Component tests for FormsListPage.
 *
 * The API client (formsApi) is mocked. The Zustand store is not used by this
 * component — it calls formsApi directly. Per project testing rules, frontend
 * tests mock the API client, not the database.
 */
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FormsListPage } from './FormsListPage';
import * as formsApiModule from '../../api/forms';
import { makeForm } from '../../tests/factories';

// ─── Mock the API module ──────────────────────────────────────────────────────

vi.mock('../../api/forms');

const mockFormsApi = vi.mocked(formsApiModule.formsApi);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderPage() {
  return render(<FormsListPage />);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('FormsListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFormsApi.list = vi.fn().mockResolvedValue([]);
    mockFormsApi.create = vi.fn().mockResolvedValue(makeForm());
    mockFormsApi.delete = vi.fn().mockResolvedValue(undefined);
    mockFormsApi.duplicate = vi.fn().mockResolvedValue(makeForm());
  });

  it('should render the "My Forms" heading', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('My Forms')).toBeInTheDocument();
    });
  });

  it('should render the "New Form" button', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /new form/i })).toBeInTheDocument();
    });
  });

  it('should show loading state initially then display empty state when no forms exist', async () => {
    // list returns empty array after a delay
    mockFormsApi.list = vi.fn().mockResolvedValue([]);
    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/no forms yet/i)).toBeInTheDocument();
    });
  });

  it('should display a row for each form returned by the API', async () => {
    const forms = [
      makeForm({ name: 'Alpha Form', status: 'draft' }),
      makeForm({ name: 'Beta Form',  status: 'published' }),
    ];
    mockFormsApi.list = vi.fn().mockResolvedValue(forms);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Alpha Form')).toBeInTheDocument();
      expect(screen.getByText('Beta Form')).toBeInTheDocument();
    });
  });

  it('should show the status for each form', async () => {
    const forms = [makeForm({ name: 'Draft Form', status: 'draft' })];
    mockFormsApi.list = vi.fn().mockResolvedValue(forms);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('draft')).toBeInTheDocument();
    });
  });

  it('should call formsApi.create when "New Form" button is clicked', async () => {
    const newForm = makeForm({ name: 'Untitled Form' });
    mockFormsApi.create = vi.fn().mockResolvedValue(newForm);
    mockFormsApi.list = vi.fn().mockResolvedValue([newForm]);

    renderPage();
    await waitFor(() => screen.getByRole('button', { name: /new form/i }));

    fireEvent.click(screen.getByRole('button', { name: /new form/i }));

    await waitFor(() => {
      expect(mockFormsApi.create).toHaveBeenCalledWith({ name: 'Untitled Form', description: '' });
    });
  });

  it('should remove the form from the list when Delete is clicked', async () => {
    const form = makeForm({ name: 'To Delete', status: 'draft' });
    mockFormsApi.list = vi.fn().mockResolvedValue([form]);
    mockFormsApi.delete = vi.fn().mockResolvedValue(undefined);

    renderPage();

    await waitFor(() => screen.getByText('To Delete'));

    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => {
      expect(mockFormsApi.delete).toHaveBeenCalledWith(form.id);
      expect(screen.queryByText('To Delete')).not.toBeInTheDocument();
    });
  });

  it('should call formsApi.duplicate when Duplicate is clicked', async () => {
    const form = makeForm({ name: 'Original', status: 'draft' });
    const copy = makeForm({ name: 'Original (Copy)', status: 'draft' });
    mockFormsApi.list = vi.fn().mockResolvedValue([form]);
    mockFormsApi.duplicate = vi.fn().mockResolvedValue(copy);

    renderPage();

    await waitFor(() => screen.getByText('Original'));

    fireEvent.click(screen.getByRole('button', { name: /duplicate/i }));

    await waitFor(() => {
      expect(mockFormsApi.duplicate).toHaveBeenCalledWith(form.id);
    });
  });

  it('should prepend the duplicated form to the list', async () => {
    const original = makeForm({ name: 'Original', status: 'draft' });
    const copy = makeForm({ name: 'Original (Copy)', status: 'draft' });
    mockFormsApi.list = vi.fn().mockResolvedValue([original]);
    mockFormsApi.duplicate = vi.fn().mockResolvedValue(copy);

    renderPage();
    await waitFor(() => screen.getByText('Original'));

    fireEvent.click(screen.getByRole('button', { name: /duplicate/i }));

    await waitFor(() => {
      expect(screen.getByText('Original (Copy)')).toBeInTheDocument();
    });
  });

  it('should display an error alert when the list API call fails', async () => {
    mockFormsApi.list = vi.fn().mockRejectedValue(new Error('Network error'));

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('should display an error when deletion fails', async () => {
    const form = makeForm({ name: 'Fail Delete', status: 'draft' });
    mockFormsApi.list = vi.fn().mockResolvedValue([form]);
    mockFormsApi.delete = vi.fn().mockRejectedValue(new Error('Delete failed'));

    renderPage();
    await waitFor(() => screen.getByText('Fail Delete'));

    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('should render the table column headers when forms are present', async () => {
    const forms = [makeForm({ name: 'Some Form' })];
    mockFormsApi.list = vi.fn().mockResolvedValue(forms);

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Updated')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });
  });

  it('should render Delete and Duplicate buttons for each form row', async () => {
    const forms = [makeForm({ name: 'Row Form' })];
    mockFormsApi.list = vi.fn().mockResolvedValue(forms);

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /duplicate/i })).toBeInTheDocument();
    });
  });

  it('should render individual Delete/Duplicate buttons for multiple forms', async () => {
    const forms = [
      makeForm({ name: 'Form A' }),
      makeForm({ name: 'Form B' }),
    ];
    mockFormsApi.list = vi.fn().mockResolvedValue(forms);

    renderPage();

    await waitFor(() => {
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      const duplicateButtons = screen.getAllByRole('button', { name: /duplicate/i });
      expect(deleteButtons).toHaveLength(2);
      expect(duplicateButtons).toHaveLength(2);
    });
  });

  it('should call the correct form ID when deleting one of multiple forms', async () => {
    const formA = makeForm({ name: 'Form A' });
    const formB = makeForm({ name: 'Form B' });
    mockFormsApi.list = vi.fn().mockResolvedValue([formA, formB]);
    mockFormsApi.delete = vi.fn().mockResolvedValue(undefined);

    renderPage();

    await waitFor(() => screen.getByText('Form A'));

    // Click the first Delete button (Form A's row)
    const rows = screen.getAllByRole('row');
    // rows[0] is the header; rows[1] is Form A
    const deleteBtn = within(rows[1]).getByRole('button', { name: /delete/i });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(mockFormsApi.delete).toHaveBeenCalledWith(formA.id);
    });
  });
});
