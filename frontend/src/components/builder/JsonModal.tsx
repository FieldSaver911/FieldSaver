import { useMemo, useState } from 'react';
import type { Form } from '@fieldsaver/shared';
import { V } from '../../constants/design';

// ─── Types ────────────────────────────────────────────────────────────────────

interface JsonModalProps {
  form: Form;
  onClose: () => void;
}

interface KeyMapEntry {
  exportKey: string;
  fieldId: string;
  fieldLabel: string;
  fieldType: string;
  libraryId?: string;
  category?: string;
}

// ─── JsonModal ─────────────────────────────────────────────────────────────────

export function JsonModal({ form, onClose }: JsonModalProps) {
  const [activeTab, setActiveTab] = useState<'schema' | 'keymap'>('schema');

  // Build key map from all fields
  const keyMap = useMemo<KeyMapEntry[]>(() => {
    const entries: KeyMapEntry[] = [];
    const pages = form.data?.pages || [];

    pages.forEach((page) => {
      page.sections?.forEach((section) => {
        section.rows?.forEach((row) => {
          row.cells?.forEach((cell) => {
            cell.fields?.forEach((field) => {
              const libraryRows = field.libraryRows || [];
              if (libraryRows.length > 0) {
                libraryRows.forEach((libRow) => {
                  entries.push({
                    exportKey: libRow.exportKey,
                    fieldId: field.id,
                    fieldLabel: field.label,
                    fieldType: field.type,
                    libraryId: libRow.libraryId,
                    category: libRow.category,
                  });
                });
              } else {
                // For fields without library rows, still create an entry
                entries.push({
                  exportKey: `field.${field.id}`,
                  fieldId: field.id,
                  fieldLabel: field.label,
                  fieldType: field.type,
                });
              }
            });
          });
        });
      });
    });

    return entries;
  }, [form]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formSchemaJson = JSON.stringify(form, null, 2);
  const keyMapJson = JSON.stringify(
    keyMap.reduce(
      (acc, entry) => {
        acc[entry.exportKey] = {
          fieldId: entry.fieldId,
          fieldLabel: entry.fieldLabel,
          fieldType: entry.fieldType,
          libraryId: entry.libraryId,
          category: entry.category,
        };
        return acc;
      },
      {} as Record<string, any>
    ),
    null,
    2
  );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: V.bgSurface,
          borderRadius: V.r3,
          margin: 'auto',
          width: '80vw',
          height: '80vh',
          maxWidth: '1200px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: V.s3,
            borderBottom: `1px solid ${V.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h1 style={{ fontSize: V.md, fontWeight: 700, margin: 0, fontFamily: V.font }}>
            Export JSON
          </h1>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: 'none',
              background: 'transparent',
              color: V.textSecondary,
              cursor: 'pointer',
              fontSize: '20px',
              padding: 0,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: V.s3,
            padding: V.s3,
            backgroundColor: V.bgApp,
            borderBottom: `1px solid ${V.border}`,
          }}
        >
          {(['schema', 'keymap'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              style={{
                padding: `${V.s2} ${V.s3}`,
                border: 'none',
                borderBottom: activeTab === tab ? `2px solid ${V.primary}` : '2px solid transparent',
                backgroundColor: 'transparent',
                color: activeTab === tab ? V.primary : V.textSecondary,
                cursor: 'pointer',
                fontSize: V.sm,
                fontWeight: activeTab === tab ? 600 : 400,
                fontFamily: V.font,
              }}
            >
              {tab === 'schema' ? 'Form Schema' : 'Full Key Map'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {activeTab === 'schema' ? (
            <>
              <div style={{ padding: V.s3, flex: 1, overflow: 'auto' }}>
                <pre
                  style={{
                    margin: 0,
                    padding: V.s2,
                    backgroundColor: '#1e1e1e',
                    color: '#d4d4d4',
                    borderRadius: V.r2,
                    fontSize: V.xs,
                    fontFamily: 'monospace',
                    overflow: 'auto',
                    lineHeight: 1.5,
                  }}
                >
                  {formSchemaJson}
                </pre>
              </div>
            </>
          ) : (
            <>
              <div style={{ padding: V.s3, flex: 1, overflow: 'auto' }}>
                <pre
                  style={{
                    margin: 0,
                    padding: V.s2,
                    backgroundColor: '#1e1e1e',
                    color: '#d4d4d4',
                    borderRadius: V.r2,
                    fontSize: V.xs,
                    fontFamily: 'monospace',
                    overflow: 'auto',
                    lineHeight: 1.5,
                  }}
                >
                  {keyMapJson}
                </pre>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            backgroundColor: V.bgApp,
            borderTop: `1px solid ${V.border}`,
            padding: V.s3,
            display: 'flex',
            gap: V.s2,
            justifyContent: 'flex-end',
          }}
        >
          <button
            type="button"
            onClick={() => copyToClipboard(activeTab === 'schema' ? formSchemaJson : keyMapJson)}
            style={{
              padding: `${V.s2} ${V.s3}`,
              border: `1px solid ${V.border}`,
              borderRadius: V.r2,
              backgroundColor: V.bgSurface,
              color: V.textPrimary,
              cursor: 'pointer',
              fontSize: V.sm,
              fontWeight: 600,
              fontFamily: V.font,
            }}
          >
            📋 Copy to Clipboard
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: `${V.s2} ${V.s4}`,
              border: 'none',
              borderRadius: V.r2,
              backgroundColor: V.primary,
              color: 'white',
              cursor: 'pointer',
              fontSize: V.sm,
              fontWeight: 600,
              fontFamily: V.font,
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
