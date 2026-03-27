import React from 'react';
import type { Field, LibraryRowDef } from '@fieldsaver/shared';
import { V } from '../../constants/design';
import { UnifiedLibraryBrowser } from './UnifiedLibraryBrowser';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FieldKeysPanelProps {
  field: Field;
  onUpdateField: (field: Partial<Field>) => void;
}

// ─── FieldKeysPanel ───────────────────────────────────────────────────────────

export function FieldKeysPanel({ field, onUpdateField }: FieldKeysPanelProps) {
  const [showBrowser, setShowBrowser] = React.useState(false);

  const assignedRows = field.libraryRows ?? [];

  const handleAssignKeys = (selectedRows: LibraryRowDef[]) => {
    const newRows = [
      ...assignedRows,
      ...selectedRows.map((row) => ({
        libraryId: row.libraryId,
        rowId: row.id,
        label: row.label,
        exportKey: row.exportKey,
        code: row.code,
        category: row.category,
        subCategory: row.subCategory,
      })),
    ];

    // Deduplicate by exportKey
    const seen = new Set<string>();
    const deduped = newRows.filter((r) => {
      if (seen.has(r.exportKey)) return false;
      seen.add(r.exportKey);
      return true;
    });

    onUpdateField({ libraryRows: deduped });
    setShowBrowser(false);
  };

  const handleRemoveRow = (exportKey: string) => {
    const updated = assignedRows.filter((r) => r.exportKey !== exportKey);
    onUpdateField({ libraryRows: updated });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: V.s3 }}>
      {assignedRows.length === 0 ? (
        <div
          style={{
            padding: V.s4,
            border: `2px dashed ${V.border}`,
            borderRadius: V.r4,
            textAlign: 'center',
            backgroundColor: V.bgApp,
          }}
        >
          <div style={{ color: V.textSecondary, fontSize: V.sm, fontFamily: V.font, marginBottom: V.s3 }}>
            No export keys assigned. Browse libraries to assign keys.
          </div>
          <button
            type="button"
            onClick={() => setShowBrowser(true)}
            style={{
              padding: `${V.s2} ${V.s4}`,
              border: 'none',
              borderRadius: V.r3,
              backgroundColor: V.primary,
              color: V.bgSurface,
              cursor: 'pointer',
              fontSize: V.sm,
              fontWeight: 600,
              fontFamily: V.font,
            }}
          >
            🔑 Browse & Assign Keys
          </button>
        </div>
      ) : (
        <>
          {/* Assigned rows list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: V.s2 }}>
            {assignedRows.map((row) => (
              <div
                key={row.exportKey}
                style={{
                  padding: V.s3,
                  border: `1px solid ${V.border}`,
                  borderRadius: V.r3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: V.s2,
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: V.s2,
                      marginBottom: V.s1,
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        padding: `${V.s1} ${V.s2}`,
                        borderRadius: V.r2,
                        backgroundColor: V.bgApp,
                        fontSize: V.xs,
                        fontWeight: 600,
                        color: V.textSecondary,
                        fontFamily: V.font,
                      }}
                    >
                      {row.category}
                    </span>
                    <span style={{ fontSize: V.sm, fontWeight: 600, color: V.textPrimary, fontFamily: V.font }}>
                      {row.label}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: V.xs,
                      color: V.textSecondary,
                      fontFamily: V.font,
                    }}
                  >
                    {row.exportKey}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveRow(row.exportKey)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: V.textSecondary,
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: 0,
                    lineHeight: 1,
                  }}
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Show to Respondent toggles by category */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: V.s2 }}>
            <div
              style={{
                fontSize: V.sm,
                fontWeight: 600,
                color: V.textPrimary,
                fontFamily: V.font,
              }}
            >
              Show to Respondent
            </div>
            {['NOT Value', 'Pertinent Negative', 'Nillable Marker'].map((category) => {
              const hasCategory = assignedRows.some((r) => r.category === category);
              if (!hasCategory) return null;

              return (
                <label
                  key={category}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: V.s2,
                    fontSize: V.sm,
                    color: V.textSecondary,
                    fontFamily: V.font,
                    cursor: 'pointer',
                  }}
                >
                  <input type="checkbox" disabled style={{ opacity: 0.5 }} />
                  {category}
                </label>
              );
            })}
          </div>

          {/* Is Nillable toggle */}
          <div>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: V.s2,
                fontSize: V.sm,
                color: V.textSecondary,
                fontFamily: V.font,
                cursor: 'pointer',
              }}
            >
              <input type="checkbox" disabled style={{ opacity: 0.5 }} />
              Is Nillable
            </label>
          </div>

          {/* Browse & Assign Keys button */}
          <button
            type="button"
            onClick={() => setShowBrowser(true)}
            style={{
              padding: `${V.s2} ${V.s4}`,
              border: `1px solid ${V.border}`,
              borderRadius: V.r3,
              backgroundColor: V.bgSurface,
              color: V.primary,
              cursor: 'pointer',
              fontSize: V.sm,
              fontWeight: 600,
              fontFamily: V.font,
            }}
          >
            + Browse & Assign More Keys
          </button>
        </>
      )}

      {/* Library browser modal */}
      {showBrowser && (
        <UnifiedLibraryBrowser
          mode="browse"
          onClose={() => setShowBrowser(false)}
          onAssignKeys={handleAssignKeys}
        />
      )}
    </div>
  );
}
