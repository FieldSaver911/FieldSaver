import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FormsListPage } from './FormsListPage';
import * as formsApiModule from '../api/forms';
import type { Form } from '@fieldsaver/shared';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeForm(overrides: Partial<Form> = {}): Form {
  return {
    id: 'form-1',
    userId: 'user-1',
    name: 'Test Form',
    description: '',
    data: { pages: [], libraries: [], narrativeTemplates: [] },
    settings: {
      submitLabel: 'Submit',
      successMessage: 'Thank you',
      redirectUrl: '',
      confirmationEmail: false,
      showProgress: true,
      showPageNumbers: false,
      formLayout: 'progress',
      brandColor: '#0073EA',
      companyLogoUrl: '',
      compactMode: false,
      singlePageDefaultExpanded: true,
      singlePageAllowMultiOpen: false,
      allowDraft: false,
      autoSave: false,
      validateOnChange: false,
      preventMultipleSubmissions: false,
      requireAllPages: false,
      allowGoBack: false,
      randomizePageOrder: false,
      randomizeFieldOrder: false,
      closedFormMessage: 'This form is no longer accepting responses.',
      passwordProtected: false,
      allowedDomains: '',
      mondayBoardId: '',
      mondayGroupId: '',
      mondayCreateLabels: false,
      webhookUrl: '',
      webhookAuthHeader: '',
      notifyEmails: '',
      digestEmail: false,
      dateFormat: 'MM/DD/YYYY',
      emptyFieldHandling: 'omit',
      retentionDays: 90,
      includeXmlNil: false,
      includePertinentNegatives: false,
      includeNotValues: false,
    },
    status: 'draft',
    publishedAt: null,
    version: 1,
    createdAt: '2026-03-26T00:00:00Z',
    updatedAt: '2026-03-26T00:00:00Z',
    deletedAt: null,
    ...overrides,
  };
}

// ─── Mock react-router-dom navigate ──────────────────────────────────────────

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('FormsListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading state initially', () => {
    vi.spyOn(formsApiModule.formsApi, 'list').mockReturnValue(new Promise(() => undefined));

    render(
      <MemoryRouter>
        <FormsListPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Loading forms…')).toBeInTheDocument();
  });

  it('should render forms table when forms exist', async () => {
    vi.spyOn(formsApiModule.formsApi, 'list').mockResolvedValue([makeForm()]);

    render(
      <MemoryRouter>
        <FormsListPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Test Form')).toBeInTheDocument();
    });
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('should show empty state when no forms', async () => {
    vi.spyOn(formsApiModule.formsApi, 'list').mockResolvedValue([]);

    render(
      <MemoryRouter>
        <FormsListPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('No forms yet')).toBeInTheDocument();
    });
  });

  it('should show error state and retry button on API failure', async () => {
    vi.spyOn(formsApiModule.formsApi, 'list').mockRejectedValue(new Error('Network error'));

    render(
      <MemoryRouter>
        <FormsListPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('should call create API and navigate to builder on new form', async () => {
    vi.spyOn(formsApiModule.formsApi, 'list').mockResolvedValue([]);
    vi.spyOn(formsApiModule.formsApi, 'create').mockResolvedValue(makeForm({ id: 'new-form' }));

    render(
      <MemoryRouter>
        <FormsListPage />
      </MemoryRouter>,
    );

    await waitFor(() => screen.getByText('No forms yet'));
    fireEvent.click(screen.getAllByText('New Form')[0]);

    await waitFor(() => {
      expect(formsApiModule.formsApi.create).toHaveBeenCalledWith({
        name: 'Untitled Form',
        description: '',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/forms/new-form');
    });
  });

  it('should show published status badge for published forms', async () => {
    vi.spyOn(formsApiModule.formsApi, 'list').mockResolvedValue([
      makeForm({ status: 'published', publishedAt: '2026-03-26T00:00:00Z' }),
    ]);

    render(
      <MemoryRouter>
        <FormsListPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Published')).toBeInTheDocument();
    });
  });

  it('should navigate to builder when clicking Edit', async () => {
    vi.spyOn(formsApiModule.formsApi, 'list').mockResolvedValue([makeForm()]);

    render(
      <MemoryRouter>
        <FormsListPage />
      </MemoryRouter>,
    );

    await waitFor(() => screen.getByText('Edit'));
    fireEvent.click(screen.getByText('Edit'));

    expect(mockNavigate).toHaveBeenCalledWith('/forms/form-1');
  });
});
