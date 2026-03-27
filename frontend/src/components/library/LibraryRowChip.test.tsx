/**
 * Component tests for LibraryRowChip.
 *
 * LibraryRowChip is a pure presentational component — no store or API
 * dependencies so no mocks are required.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LibraryRowChip } from './LibraryRowChip';
import { makeAssignedLibraryRow } from '../../tests/factories';

// ─── Rendering ────────────────────────────────────────────────────────────────

describe('LibraryRowChip — rendering', () => {
  it('should render the row label', () => {
    const row = makeAssignedLibraryRow({ label: 'Systolic BP' });
    render(<LibraryRowChip row={row} />);
    expect(screen.getByText('Systolic BP')).toBeInTheDocument();
  });

  it('should render the export key', () => {
    const row = makeAssignedLibraryRow({ exportKey: 'eVitals.SBP' });
    render(<LibraryRowChip row={row} />);
    expect(screen.getByText('eVitals.SBP')).toBeInTheDocument();
  });

  it('should include a title attribute with export key and code when code is present', () => {
    const row = makeAssignedLibraryRow({ exportKey: 'eVitals.SBP', code: '9902001' });
    const { container } = render(<LibraryRowChip row={row} />);
    const chip = container.firstChild as HTMLElement;
    expect(chip.title).toContain('eVitals.SBP');
    expect(chip.title).toContain('9902001');
  });

  it('should include only the export key in the title when code is empty', () => {
    const row = makeAssignedLibraryRow({ exportKey: 'eVitals.HR', code: '' });
    const { container } = render(<LibraryRowChip row={row} />);
    const chip = container.firstChild as HTMLElement;
    expect(chip.title).toContain('eVitals.HR');
    expect(chip.title).not.toContain('·');
  });

  it('should render a category dot element', () => {
    const row = makeAssignedLibraryRow({ category: 'Data Element' });
    const { container } = render(<LibraryRowChip row={row} />);
    const dots = container.querySelectorAll('span[style*="border-radius: 50%"]');
    expect(dots.length).toBeGreaterThanOrEqual(1);
  });
});

// ─── Category badge colors ─────────────────────────────────────────────────────
// jsdom normalizes hex values to rgb() when applying inline styles, so we
// compare against the rgb() equivalents of the CAT palette colors.

describe('LibraryRowChip — category badge styling', () => {
  it('should apply the "Data Element" (basic) background color to the outer chip span', () => {
    // CAT.basic bg: #DCEEFF → rgb(220, 238, 255)
    const row = makeAssignedLibraryRow({ category: 'Data Element' });
    const { container } = render(<LibraryRowChip row={row} />);
    const chip = container.firstChild as HTMLElement;
    expect(chip.style.backgroundColor).toBe('rgb(220, 238, 255)');
  });

  it('should apply the "NOT Value" (choice) background color to the outer chip span', () => {
    // CAT.choice bg: #EDE3FF → rgb(237, 227, 255)
    const row = makeAssignedLibraryRow({ category: 'NOT Value' });
    const { container } = render(<LibraryRowChip row={row} />);
    const chip = container.firstChild as HTMLElement;
    expect(chip.style.backgroundColor).toBe('rgb(237, 227, 255)');
  });

  it('should apply the "Pertinent Negative" (layout) background color to the outer chip span', () => {
    // CAT.layout bg: #FDEFD0 → rgb(253, 239, 208)
    const row = makeAssignedLibraryRow({ category: 'Pertinent Negative', label: 'Refused' });
    const { container } = render(<LibraryRowChip row={row} />);
    const chip = container.firstChild as HTMLElement;
    expect(chip.style.backgroundColor).toBe('rgb(253, 239, 208)');
  });

  it('should apply the "Nillable Marker" (advanced) background color to the outer chip span', () => {
    // CAT.advanced bg: #D4F1E4 → rgb(212, 241, 228)
    const row = makeAssignedLibraryRow({ category: 'Nillable Marker' });
    const { container } = render(<LibraryRowChip row={row} />);
    const chip = container.firstChild as HTMLElement;
    expect(chip.style.backgroundColor).toBe('rgb(212, 241, 228)');
  });

  it('should fall back to the "Data Element" (basic) background color for an unknown category', () => {
    // CAT.basic bg: #DCEEFF → rgb(220, 238, 255)
    const row = makeAssignedLibraryRow({ category: 'Unknown Category' });
    const { container } = render(<LibraryRowChip row={row} />);
    const chip = container.firstChild as HTMLElement;
    expect(chip.style.backgroundColor).toBe('rgb(220, 238, 255)');
  });

  it('should always render a truthy background-color style on the outer chip span', () => {
    const row = makeAssignedLibraryRow({ category: 'Pertinent Negative', label: 'Refused' });
    const { container } = render(<LibraryRowChip row={row} />);
    const chip = container.firstChild as HTMLElement;
    expect(chip.style.backgroundColor).toBeTruthy();
  });
});

// ─── Remove button ────────────────────────────────────────────────────────────

describe('LibraryRowChip — remove button', () => {
  it('should show the remove button when onRemove is provided and readOnly is false', () => {
    const row = makeAssignedLibraryRow({ label: 'Removable' });
    render(<LibraryRowChip row={row} onRemove={vi.fn()} />);
    expect(screen.getByRole('button', { name: /remove removable/i })).toBeInTheDocument();
  });

  it('should not show the remove button when readOnly is true', () => {
    const row = makeAssignedLibraryRow({ label: 'Test' });
    render(<LibraryRowChip row={row} onRemove={vi.fn()} readOnly={true} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should not show the remove button when onRemove is not provided', () => {
    const row = makeAssignedLibraryRow({ label: 'Test' });
    render(<LibraryRowChip row={row} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should call onRemove with the rowId when the remove button is clicked', () => {
    const onRemove = vi.fn();
    const row = makeAssignedLibraryRow({ rowId: 'row-42', label: 'Test' });
    render(<LibraryRowChip row={row} onRemove={onRemove} />);
    fireEvent.click(screen.getByRole('button', { name: /remove test/i }));
    expect(onRemove).toHaveBeenCalledWith('row-42');
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('should have an aria-label containing the row label on the remove button', () => {
    const row = makeAssignedLibraryRow({ label: 'Accessible Row' });
    render(<LibraryRowChip row={row} onRemove={vi.fn()} />);
    const btn = screen.getByRole('button');
    expect(btn.getAttribute('aria-label')).toContain('Accessible Row');
  });

  it('should render correctly with only the required row prop', () => {
    const row = makeAssignedLibraryRow();
    const { container } = render(<LibraryRowChip row={row} />);
    expect(container.firstChild).not.toBeNull();
  });
});
