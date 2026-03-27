import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from './Sidebar';
import type { Page } from '@fieldsaver/shared';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makePage(overrides: Partial<Page> = {}): Page {
  return {
    id: 'page-1',
    title: 'Page 1',
    description: '',
    sections: [
      {
        id: 'sec-1',
        title: 'Section 1',
        settings: { repeatable: false, repeatLabel: '+ Add Another', maxRepeats: 5 },
        rows: [],
      },
    ],
    ...overrides,
  };
}

const defaultProps = {
  pages: [makePage()],
  activePId: 'page-1',
  activeSId: 'sec-1',
  onSelectPage: vi.fn(),
  onSelectSection: vi.fn(),
  onAddPage: vi.fn(),
  onDeletePage: vi.fn(),
  onRenamePage: vi.fn(),
  onAddSection: vi.fn(),
  onDeleteSection: vi.fn(),
  onUpdateSection: vi.fn(),
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render page titles', () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByText('Page 1')).toBeInTheDocument();
  });

  it('should render section when page is expanded', () => {
    render(<Sidebar {...defaultProps} />);
    // Active page auto-expands
    expect(screen.getByText('Section 1')).toBeInTheDocument();
  });

  it('should call onSelectSection when section is clicked', () => {
    const onSelectSection = vi.fn();

    render(<Sidebar {...defaultProps} onSelectSection={onSelectSection} />);
    fireEvent.click(screen.getByText('Section 1'));

    expect(onSelectSection).toHaveBeenCalledWith('sec-1');
  });

  it('should call onAddPage when plus button is clicked', () => {
    const onAddPage = vi.fn();

    render(<Sidebar {...defaultProps} onAddPage={onAddPage} />);
    fireEvent.click(screen.getByTitle('Add page'));

    expect(onAddPage).toHaveBeenCalled();
  });

  it('should call onAddSection when Add Section is clicked', () => {
    const onAddSection = vi.fn();

    render(<Sidebar {...defaultProps} onAddSection={onAddSection} />);
    fireEvent.click(screen.getByText('+ Add Section'));

    expect(onAddSection).toHaveBeenCalledWith('page-1');
  });

  it('should not show delete button for page when it is the only page', () => {
    render(<Sidebar {...defaultProps} />);

    // Hover the page row to check no delete button appears
    fireEvent.mouseEnter(screen.getByText('Page 1').closest('div')!);

    // Delete button should not be present because it's the only page
    const deleteButtons = screen.queryAllByTitle('Delete page');
    expect(deleteButtons).toHaveLength(0);
  });

  it('should show delete page button when multiple pages exist', () => {
    const pages = [makePage(), makePage({ id: 'page-2', title: 'Page 2', sections: [] })];

    render(<Sidebar {...defaultProps} pages={pages} />);

    // Hover the page row
    fireEvent.mouseEnter(screen.getByText('Page 1').closest('div')!);
    // Delete button for Page 1 should appear
    expect(screen.getByTitle('Delete page')).toBeInTheDocument();
  });

  it('should call onRenamePage after double-clicking and committing edit', () => {
    const onRenamePage = vi.fn();

    render(<Sidebar {...defaultProps} onRenamePage={onRenamePage} />);

    fireEvent.dblClick(screen.getByText('Page 1'));
    const input = screen.getByDisplayValue('Page 1');
    fireEvent.change(input, { target: { value: 'Incident Info' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onRenamePage).toHaveBeenCalledWith('page-1', 'Incident Info');
  });
});
