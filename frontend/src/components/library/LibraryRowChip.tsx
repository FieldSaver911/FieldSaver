import { V, categoryColor } from '../../constants/design';
import type { AssignedLibraryRow } from '@fieldsaver/shared';

export interface LibraryRowChipProps {
  row: AssignedLibraryRow;
  onRemove?: (rowId: string) => void;
  /** When true the chip is read-only (no X button) */
  readOnly?: boolean;
}

export function LibraryRowChip({ row, onRemove, readOnly = false }: LibraryRowChipProps) {
  const colors = categoryColor(row.category);

  return (
    <span
      title={`${row.exportKey}${row.code ? ` · ${row.code}` : ''}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: V.s1,
        padding: `2px ${V.s1}`,
        borderRadius: V.rFull,
        backgroundColor: colors.bg,
        border: `1px solid ${colors.dot}33`,
        maxWidth: '260px',
      }}
    >
      {/* Category dot */}
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: colors.dot,
          flexShrink: 0,
        }}
      />

      {/* Label */}
      <span
        style={{
          fontSize: V.xs,
          fontWeight: 500,
          color: colors.text,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '140px',
        }}
      >
        {row.label}
      </span>

      {/* Export key */}
      <span
        style={{
          fontSize: V.xs,
          color: colors.text,
          opacity: 0.7,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '80px',
        }}
      >
        {row.exportKey}
      </span>

      {/* Remove button */}
      {!readOnly && onRemove && (
        <button
          type="button"
          onClick={() => onRemove(row.rowId)}
          aria-label={`Remove ${row.label}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '14px',
            height: '14px',
            padding: 0,
            border: 'none',
            borderRadius: '50%',
            backgroundColor: 'transparent',
            color: colors.text,
            cursor: 'pointer',
            fontSize: '10px',
            flexShrink: 0,
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      )}
    </span>
  );
}
