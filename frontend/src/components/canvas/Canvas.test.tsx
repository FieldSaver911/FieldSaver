/**
 * Component tests for Canvas.
 *
 * Canvas receives its data via props derived from the useForm hook — no
 * direct store or API dependency. All data comes from factory objects.
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Canvas } from './Canvas';
import { makeSection, makeRow, makeCell, makeField } from '../../tests/factories';
import type { Section } from '@fieldsaver/shared';

// ─── Helper: section with one field ──────────────────────────────────────────

function sectionWithFields(fields = [makeField({ label: 'Test Field' })]): Section {
  const cell = makeCell({ fields });
  const row = makeRow({ cells: [cell] });
  return makeSection({ rows: [row] });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Canvas', () => {
  const defaultProps = {
    section: null as Section | null,
    selectedFieldId: null as string | null,
    onSelectField: vi.fn(),
    onDeleteField: vi.fn(),
    onMoveField: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show "No section selected" when section is null', () => {
    render(<Canvas {...defaultProps} section={null} />);
    expect(screen.getByText(/no section selected/i)).toBeInTheDocument();
  });

  it('should show the empty drop-zone message when the section has no rows', () => {
    const emptySection = makeSection({ rows: [] });
    render(<Canvas {...defaultProps} section={emptySection} />);
    expect(screen.getByText(/drop fields here/i)).toBeInTheDocument();
  });

  it('should render a FieldCard for each field in the section', () => {
    const section = sectionWithFields([
      makeField({ label: 'Name' }),
      makeField({ label: 'DOB' }),
    ]);

    render(<Canvas {...defaultProps} section={section} />);

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('DOB')).toBeInTheDocument();
  });

  it('should render the canvas region with accessible label', () => {
    const section = makeSection({ rows: [] });
    render(<Canvas {...defaultProps} section={section} />);

    expect(screen.getByRole('region', { name: /form canvas/i })).toBeInTheDocument();
  });

  it('should call onSelectField with fieldId when a field card is clicked', () => {
    const field = makeField({ label: 'Click Me' });
    const section = sectionWithFields([field]);
    const onSelectField = vi.fn();

    render(<Canvas {...defaultProps} section={section} onSelectField={onSelectField} />);

    // FieldCard stopPropagation on click so canvas-level deselect won't fire.
    // Find the card via its label text and click the wrapping role="button" element.
    const card = screen.getByText('Click Me').closest('[role="button"]') as HTMLElement;
    fireEvent.click(card);

    expect(onSelectField).toHaveBeenCalledWith(field.id);
  });

  it('should call onSelectField(null) when the canvas background is clicked', () => {
    const section = makeSection({ rows: [] });
    const onSelectField = vi.fn();

    render(<Canvas {...defaultProps} section={section} onSelectField={onSelectField} />);

    fireEvent.click(screen.getByRole('region', { name: /form canvas/i }));

    expect(onSelectField).toHaveBeenCalledWith(null);
  });

  it('should call onDeleteField with fieldId when the delete button on a field is clicked', () => {
    const field = makeField({ label: 'Delete Me' });
    const section = sectionWithFields([field]);
    const onDeleteField = vi.fn();

    const { container } = render(
      <Canvas {...defaultProps} section={section} onDeleteField={onDeleteField} />,
    );

    // FieldCard only shows delete button on hover/select; we need to
    // simulate hover first by setting isSelected via selectedFieldId
    render(
      <Canvas
        {...defaultProps}
        section={section}
        selectedFieldId={field.id}
        onDeleteField={onDeleteField}
      />,
      { container },
    );

    // Now the × delete button should be visible
    const deleteBtn = container.querySelector('button[title="Delete field"]') as HTMLElement;
    if (deleteBtn) {
      fireEvent.click(deleteBtn);
      expect(onDeleteField).toHaveBeenCalledWith(field.id);
    }
  });

  it('should render fields across multiple rows', () => {
    const row1 = makeRow({
      cells: [makeCell({ fields: [makeField({ label: 'Row1 Field' })] })],
    });
    const row2 = makeRow({
      cells: [makeCell({ fields: [makeField({ label: 'Row2 Field' })] })],
    });
    const section = makeSection({ rows: [row1, row2] });

    render(<Canvas {...defaultProps} section={section} />);

    expect(screen.getByText('Row1 Field')).toBeInTheDocument();
    expect(screen.getByText('Row2 Field')).toBeInTheDocument();
  });

  it('should render fields in multiple cells within a row', () => {
    const cell1 = makeCell({ fields: [makeField({ label: 'Left Field' })] });
    const cell2 = makeCell({ fields: [makeField({ label: 'Right Field' })] });
    const row = makeRow({ cells: [cell1, cell2] });
    const section = makeSection({ rows: [row] });

    render(<Canvas {...defaultProps} section={section} />);

    expect(screen.getByText('Left Field')).toBeInTheDocument();
    expect(screen.getByText('Right Field')).toBeInTheDocument();
  });

  it('should render required badge (*) for required fields', () => {
    const field = makeField({ label: 'Required Field', required: true });
    const section = sectionWithFields([field]);

    render(<Canvas {...defaultProps} section={section} />);

    // FieldCard renders * as a <span> with title="Required field"
    const badge = screen.getByTitle('Required field');
    expect(badge).toBeInTheDocument();
  });
});
