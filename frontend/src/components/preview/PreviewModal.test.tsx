import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PreviewModal } from './PreviewModal';
import { makeForm, makeFormSettings } from '../../tests/factories';

describe('PreviewModal', () => {
  it('should render progress layout when formLayout is progress', () => {
    const form = makeForm({
      settings: makeFormSettings({ formLayout: 'progress', showPageNumbers: true }),
    });

    const onClose = vi.fn();
    render(<PreviewModal form={form} onClose={onClose} />);

    // PreviewProgress should be rendered, which shows page counter
    expect(screen.getByText(/Page 1 of 1/)).toBeInTheDocument();
  });

  it('should render single-page layout when formLayout is single-page', () => {
    const form = makeForm({
      settings: makeFormSettings({ formLayout: 'single-page' }),
    });

    const onClose = vi.fn();
    render(<PreviewModal form={form} onClose={onClose} />);

    // PreviewSinglePage should render with branded header containing form name
    expect(screen.getByText(form.name)).toBeInTheDocument();
  });

  it('should render side-nav layout when formLayout is side-nav', () => {
    const form = makeForm({
      settings: makeFormSettings({ formLayout: 'side-nav' }),
    });

    const onClose = vi.fn();
    render(<PreviewModal form={form} onClose={onClose} />);

    // PreviewSideNav should render with form name visible
    expect(screen.getByText(form.name)).toBeInTheDocument();
  });

  it('should display layout type in header', () => {
    const form = makeForm({
      settings: makeFormSettings({ formLayout: 'progress' }),
    });

    render(<PreviewModal form={form} onClose={() => {}} />);

    expect(screen.getByText(/Layout: Progress Form/)).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const form = makeForm();
    const onClose = vi.fn();

    render(<PreviewModal form={form} onClose={onClose} />);

    const closeBtn = screen.getByTitle('Close');
    fireEvent.click(closeBtn);

    expect(onClose).toHaveBeenCalled();
  });

  it('should display device selector buttons', () => {
    const form = makeForm();

    render(<PreviewModal form={form} onClose={() => {}} />);

    expect(screen.getByRole('button', { name: /web/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tablet/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /mobile/ })).toBeInTheDocument();
  });

  it('should default to progress layout when formLayout is not set', () => {
    const form = makeForm({
      settings: makeFormSettings({
        formLayout: undefined as any,
        showPageNumbers: true,
      }),
    });

    render(<PreviewModal form={form} onClose={() => {}} />);

    // Should render PreviewProgress
    expect(screen.getByText(/Page 1 of 1/)).toBeInTheDocument();
  });
});
