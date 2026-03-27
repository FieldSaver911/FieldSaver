import React from 'react';
import type { Form } from '@fieldsaver/shared';
import { V } from '../../constants/design';
import { LiveField } from './LiveField';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PreviewSinglePageProps {
  form: Form;
  deviceWidth: number;
}

// ─── PreviewSinglePage ────────────────────────────────────────────────────────

export function PreviewSinglePage({ form }: PreviewSinglePageProps) {
  const pages = form.data?.pages || [];
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(
    new Set(pages.flatMap((p) => p.sections?.map((s) => s.id) || []))
  );

  const [fieldValues, setFieldValues] = React.useState<Record<string, any>>({});

  const handleFieldChange = (fieldId: string, value: any) => {
    setFieldValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: V.s4 }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          {/* Form Title */}
          {form.name && (
            <h1
              style={{
                fontSize: V.lg,
                fontWeight: 700,
                color: V.textPrimary,
                fontFamily: V.font,
                marginBottom: V.s2,
              }}
            >
              {form.name}
            </h1>
          )}

          {/* Form Description */}
          {form.description && (
            <p
              style={{
                fontSize: V.sm,
                color: V.textSecondary,
                fontFamily: V.font,
                marginBottom: V.s4,
              }}
            >
              {form.description}
            </p>
          )}

          {/* Pages and Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: V.s3 }}>
            {pages.map((page) => (
              <div key={page.id}>
                {/* Page Title (if multi-page) */}
                {pages.length > 1 && (
                  <h2
                    style={{
                      fontSize: V.md,
                      fontWeight: 600,
                      color: V.textPrimary,
                      fontFamily: V.font,
                      marginBottom: V.s2,
                    }}
                  >
                    {page.title}
                  </h2>
                )}

                {/* Sections */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: V.s2 }}>
                  {page.sections?.map((section) => (
                    <div
                      key={section.id}
                      style={{
                        border: `1px solid ${V.border}`,
                        borderRadius: V.r2,
                        overflow: 'hidden',
                      }}
                    >
                      {/* Section Header (Accordion Trigger) */}
                      <button
                        type="button"
                        onClick={() => toggleSection(section.id)}
                        style={{
                          width: '100%',
                          padding: V.s3,
                          backgroundColor: V.bgApp,
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: V.s2,
                          transition: 'background-color 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = V.bgApp;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = V.bgApp;
                        }}
                      >
                        <div style={{ textAlign: 'left', flex: 1 }}>
                          <h3
                            style={{
                              fontSize: V.sm,
                              fontWeight: 600,
                              color: V.textPrimary,
                              fontFamily: V.font,
                              margin: 0,
                            }}
                          >
                            {section.title}
                          </h3>
                          {section.rows && (
                            <p
                              style={{
                                fontSize: V.xs,
                                color: V.textSecondary,
                                fontFamily: V.font,
                                margin: `${V.s1}px 0 0 0`,
                              }}
                            >
                              {section.rows.length} field{section.rows.length !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                        <span
                          style={{
                            fontSize: V.sm,
                            color: V.textSecondary,
                            transform: expandedSections.has(section.id)
                              ? 'rotate(180deg)'
                              : 'rotate(0deg)',
                            transition: 'transform 0.2s ease',
                          }}
                        >
                          ▼
                        </span>
                      </button>

                      {/* Section Content (Accordion Body) */}
                      {expandedSections.has(section.id) && (
                        <div
                          style={{
                            padding: V.s3,
                            borderTop: `1px solid ${V.border}`,
                            backgroundColor: V.bgSurface,
                          }}
                        >
                          {/* Section Rows */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: V.s3 }}>
                            {section.rows?.map((row) => (
                              <div
                                key={row.id}
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: row.preset?.cols
                                    ?.map((col) => `${(col / 12) * 100}%`)
                                    .join(' ')
                                    || '1fr',
                                  gap: V.s3,
                                }}
                              >
                                {row.cells?.map((cell) => (
                                  <div key={cell.id}>
                                    {cell.fields?.map((field) => (
                                      <LiveField
                                        key={field.id}
                                        field={field}
                                        value={fieldValues[field.id] ?? null}
                                        onChange={(value) => handleFieldChange(field.id, value)}
                                      />
                                    ))}
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Submit Footer */}
      <div
        style={{
          padding: V.s3,
          backgroundColor: V.bgApp,
          borderTop: `1px solid ${V.border}`,
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <button
          type="button"
          style={{
            padding: `${V.s2} ${V.s4}`,
            border: 'none',
            borderRadius: V.r2,
            backgroundColor: V.primary,
            color: V.bgSurface,
            cursor: 'pointer',
            fontSize: V.sm,
            fontWeight: 600,
            fontFamily: V.font,
          }}
        >
          {form.settings?.submitLabel || 'Submit'}
        </button>
      </div>
    </div>
  );
}
