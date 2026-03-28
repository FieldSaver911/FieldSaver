import React from 'react';
import type { Field } from '@fieldsaver/shared';
import { V } from '../../constants/design';
import { FIELD_TYPES } from '../../constants/fieldTypes';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface FieldCardProps {
  field: Field;
  isSelected: boolean;
  onSelect: (fieldId: string) => void;
  onDelete: (fieldId: string) => void;
  /** Index within the cell — used by drag logic */
  index: number;
  /** Cell ID this field belongs to */
  cellId: string;
  /** Drag handler provided by parent row/canvas */
  onDragStart?: (cellId: string, index: number) => void;
  onDragEnter?: (cellId: string, index: number) => void;
  onDrop?: (event: React.DragEvent) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FieldCard({
  field,
  isSelected,
  onSelect,
  onDelete,
  index,
  cellId,
  onDragStart,
  onDragEnter,
  onDrop,
}: FieldCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);

  const typeDef = FIELD_TYPES.find((t) => t.type === field.type);
  const icon = typeDef?.icon ?? '?';
  const typeLabel = typeDef?.label ?? field.type;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(field.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(field.id);
  };

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    try { e.dataTransfer.effectAllowed = 'move'; } catch { /* jsdom may not support this */ }
    onDragStart?.(cellId, index);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    onDragEnter?.(cellId, index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDrop?.(e);
  };

  const borderColor = isSelected ? V.primary : isHovered ? V.border : V.borderLight;
  const bgColor = isSelected ? V.bgSelected : V.bgSurface;

  return (
    <div
      role="button"
      tabIndex={0}
      draggable
      onClick={handleClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(field.id); }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: V.s2,
        padding: `${V.s2} ${V.s3}`,
        border: `1px solid ${borderColor}`,
        borderRadius: V.r3,
        backgroundColor: bgColor,
        cursor: 'grab',
        opacity: isDragging ? 0.4 : 1,
        transition: 'border-color 0.12s, background-color 0.12s, opacity 0.12s',
        minHeight: '40px',
        userSelect: 'none',
        outline: isSelected ? `2px solid ${V.primary}` : 'none',
        outlineOffset: '-1px',
      }}
    >
      {/* Drag handle */}
      <span
        style={{
          fontSize: V.sm,
          color: V.textDisabled,
          cursor: 'grab',
          flexShrink: 0,
          lineHeight: 1,
        }}
        aria-hidden="true"
      >
        ⠿
      </span>

      {/* Type icon */}
      <span
        style={{
          fontSize: V.sm,
          fontWeight: 700,
          color: V.textSecondary,
          fontFamily: 'monospace',
          minWidth: '16px',
          textAlign: 'center',
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        {icon}
      </span>

      {/* Label */}
      <span
        style={{
          flex: 1,
          fontSize: V.md,
          color: field.label ? V.textPrimary : V.textDisabled,
          fontFamily: V.font,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {field.label || `(${typeLabel})`}
      </span>

      {/* Required badge */}
      {field.required && (
        <span
          style={{
            fontSize: V.xs,
            color: V.negative,
            fontWeight: 600,
            flexShrink: 0,
          }}
          title="Required field"
        >
          *
        </span>
      )}

      {/* Hover actions */}
      {(isHovered || isSelected) && (
        <button
          type="button"
          onClick={handleDelete}
          title="Delete field"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '20px',
            height: '20px',
            border: 'none',
            borderRadius: V.r2,
            backgroundColor: 'transparent',
            color: V.textSecondary,
            cursor: 'pointer',
            padding: 0,
            flexShrink: 0,
            fontSize: '14px',
            lineHeight: 1,
            transition: 'background-color 0.1s, color 0.1s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = V.negativeBg;
            (e.currentTarget as HTMLButtonElement).style.color = V.negative;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.color = V.textSecondary;
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}
