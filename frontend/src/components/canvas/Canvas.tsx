import React from 'react';
import type { Section, Row, Field } from '@fieldsaver/shared';
import { V } from '../../constants/design';
import { FieldCard } from '../builder/FieldCard';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface CanvasProps {
  section: Section | null;
  selectedFieldId: string | null;
  onSelectField: (fieldId: string | null) => void;
  onDeleteField: (fieldId: string) => void;
  onMoveField: (fromCellId: string, fromIdx: number, toCellId: string, toIdx: number) => void;
}

// ─── DragState tracked locally ────────────────────────────────────────────────

interface DragRef {
  cellId: string;
  index: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Canvas({
  section,
  selectedFieldId,
  onSelectField,
  onDeleteField,
  onMoveField,
}: CanvasProps) {
  const dragRef = React.useRef<DragRef | null>(null);
  const [dragOver, setDragOver] = React.useState<DragRef | null>(null);

  const handleDragStart = React.useCallback((cellId: string, index: number) => {
    dragRef.current = { cellId, index };
  }, []);

  const handleDragEnter = React.useCallback((cellId: string, index: number) => {
    setDragOver({ cellId, index });
  }, []);

  const handleDrop = React.useCallback(() => {
    const from = dragRef.current;
    const to = dragOver;
    if (!from || !to) return;
    if (from.cellId === to.cellId && from.index === to.index) return;
    onMoveField(from.cellId, from.index, to.cellId, to.index);
    dragRef.current = null;
    setDragOver(null);
  }, [dragOver, onMoveField]);

  const handleCanvasClick = React.useCallback(() => {
    onSelectField(null);
  }, [onSelectField]);

  if (!section) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: V.textDisabled,
          fontSize: V.md,
          fontFamily: V.font,
        }}
      >
        No section selected
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="Form canvas"
      onClick={handleCanvasClick}
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: V.s5,
        backgroundColor: V.bgApp,
      }}
    >
      {section.rows.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            color: V.textDisabled,
            padding: `${V.s6} ${V.s4}`,
            fontSize: V.md,
            fontFamily: V.font,
            border: `2px dashed ${V.borderLight}`,
            borderRadius: V.r3,
          }}
        >
          Drop fields here to start building
        </div>
      ) : (
        section.rows.map((row: Row) => (
          <div
            key={row.id}
            style={{
              display: 'flex',
              gap: V.s3,
              marginBottom: V.s3,
            }}
          >
            {row.cells.map((cell) => (
              <div
                key={cell.id}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: V.s2,
                  minHeight: '48px',
                  padding: V.s2,
                  borderRadius: V.r3,
                  backgroundColor: V.bgSurface,
                  border: `1px solid ${V.borderLight}`,
                }}
              >
                {cell.fields.map((field: Field, idx: number) => (
                  <FieldCard
                    key={field.id}
                    field={field}
                    isSelected={field.id === selectedFieldId}
                    onSelect={onSelectField}
                    onDelete={onDeleteField}
                    index={idx}
                    cellId={cell.id}
                    onDragStart={handleDragStart}
                    onDragEnter={handleDragEnter}
                    onDrop={handleDrop}
                  />
                ))}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
