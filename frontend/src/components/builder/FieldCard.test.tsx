import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FieldCard } from './FieldCard';
import type { Field } from '@fieldsaver/shared';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeField(overrides: Partial<Field> = {}): Field {
  return {
    id: 'field-1',
    type: 'text',
    label: 'Patient Name',
    required: false,
    placeholder: '',
    helpText: '',
    validation: {},
    libraryRows: [],
    dataAttrs: { showCategories: [], isNillable: false },
    behaviour: {
      defaultValue: '',
      memoryField: false,
      geoLocation: false,
      hideQuestion: false,
      enabled: true,
      hintText: '',
      excludeReport: false,
      timeStamp: false,
      hidden: false,
      color: '',
    },
    narrative: { valueText: '', notValueText: '' },
    settings: {},
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('FieldCard', () => {
  it('should render field label', () => {
    render(
      <FieldCard
        field={makeField()}
        isSelected={false}
        onSelect={vi.fn()}
        onDelete={vi.fn()}
        index={0}
        cellId="cell-1"
      />,
    );

    expect(screen.getByText('Patient Name')).toBeInTheDocument();
  });

  it('should show placeholder label when field label is empty', () => {
    render(
      <FieldCard
        field={makeField({ label: '' })}
        isSelected={false}
        onSelect={vi.fn()}
        onDelete={vi.fn()}
        index={0}
        cellId="cell-1"
      />,
    );

    expect(screen.getByText('(Short Text)')).toBeInTheDocument();
  });

  it('should show required asterisk when required is true', () => {
    render(
      <FieldCard
        field={makeField({ required: true })}
        isSelected={false}
        onSelect={vi.fn()}
        onDelete={vi.fn()}
        index={0}
        cellId="cell-1"
      />,
    );

    expect(screen.getByTitle('Required field')).toBeInTheDocument();
  });

  it('should call onSelect when clicked', () => {
    const onSelect = vi.fn();

    render(
      <FieldCard
        field={makeField()}
        isSelected={false}
        onSelect={onSelect}
        onDelete={vi.fn()}
        index={0}
        cellId="cell-1"
      />,
    );

    fireEvent.click(screen.getByRole('button'));

    expect(onSelect).toHaveBeenCalledWith('field-1');
  });

  it('should call onDelete when delete button is clicked', () => {
    const onDelete = vi.fn();

    render(
      <FieldCard
        field={makeField()}
        isSelected={true}
        onSelect={vi.fn()}
        onDelete={onDelete}
        index={0}
        cellId="cell-1"
      />,
    );

    fireEvent.click(screen.getByTitle('Delete field'));

    expect(onDelete).toHaveBeenCalledWith('field-1');
    // onSelect should NOT be called (event.stopPropagation)
  });

  it('should render type icon', () => {
    render(
      <FieldCard
        field={makeField({ type: 'number' })}
        isSelected={false}
        onSelect={vi.fn()}
        onDelete={vi.fn()}
        index={0}
        cellId="cell-1"
      />,
    );

    expect(screen.getByText('#')).toBeInTheDocument();
  });

  it('should call onDragStart with cellId and index when drag starts', () => {
    const onDragStart = vi.fn();

    render(
      <FieldCard
        field={makeField()}
        isSelected={false}
        onSelect={vi.fn()}
        onDelete={vi.fn()}
        index={2}
        cellId="cell-42"
        onDragStart={onDragStart}
      />,
    );

    fireEvent.dragStart(screen.getByRole('button'));

    expect(onDragStart).toHaveBeenCalledWith('cell-42', 2);
  });
});
