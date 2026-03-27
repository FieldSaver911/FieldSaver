import React, { useMemo } from 'react';
import type { Form } from '@fieldsaver/shared';
import { V } from '../../constants/design';
import { LiveField } from './LiveField';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PreviewProgressProps {
  form: Form;
  currentPageIndex: number;
  onChangePageIndex: (index: number) => void;
  deviceWidth: number;
}

// ─── PreviewProgress ──────────────────────────────────────────────────────────

export function PreviewProgress({
  form,
  currentPageIndex,
  onChangePageIndex,
}: PreviewProgressProps) {
  const pages = form.data?.pages || [];
  const currentPage = pages[currentPageIndex];
  const totalPages = pages.length;

  const [fieldValues, setFieldValues] = React.useState<Record<string, any>>({});

  const handleFieldChange = (fieldId: string, value: any) => {
    setFieldValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const progressPercent = useMemo(() => {
    if (totalPages === 0) return 0;
    return ((currentPageIndex + 1) / totalPages) * 100;
  }, [currentPageIndex, totalPages]);

  const canGoPrev = currentPageIndex > 0;
  const isLastPage = currentPageIndex === totalPages - 1;

  if (!currentPage) {
    return (
      <div style={{ padding: V.s4, textAlign: 'center' }}>
        <p style={{ color: V.textSecondary, fontFamily: V.font }}>No pages to display</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Progress Bar */}
      <div style={{ padding: V.s3, backgroundColor: V.bgApp }}>
        <div
          style={{
            height: '4px',
            backgroundColor: V.border,
            borderRadius: '2px',
            overflow: 'hidden',
            marginBottom: V.s2,
          }}
        >
          <div
            style={{
              height: '100%',
              backgroundColor: V.primary,
              width: `${progressPercent}%`,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
        <div
          style={{
            fontSize: V.xs,
            color: V.textSecondary,
            textAlign: 'center',
            fontFamily: V.font,
          }}
        >
          Page {currentPageIndex + 1} of {totalPages}
        </div>
      </div>

      {/* Page Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: V.s4 }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          {/* Page Title */}
          {currentPage.title && (
            <h1
              style={{
                fontSize: V.lg,
                fontWeight: 700,
                color: V.textPrimary,
                fontFamily: V.font,
                marginBottom: V.s2,
              }}
            >
              {currentPage.title}
            </h1>
          )}

          {/* Page Description */}
          {currentPage.description && (
            <p
              style={{
                fontSize: V.sm,
                color: V.textSecondary,
                fontFamily: V.font,
                marginBottom: V.s3,
              }}
            >
              {currentPage.description}
            </p>
          )}

          {/* Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: V.s4 }}>
            {currentPage.sections?.map((section) => (
              <div key={section.id}>
                {/* Section Title */}
                {section.title && (
                  <h2
                    style={{
                      fontSize: V.md,
                      fontWeight: 600,
                      color: V.textPrimary,
                      fontFamily: V.font,
                      marginBottom: V.s2,
                    }}
                  >
                    {section.title}
                  </h2>
                )}

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
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div
        style={{
          padding: V.s3,
          backgroundColor: V.bgApp,
          borderTop: `1px solid ${V.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <button
          type="button"
          onClick={() => onChangePageIndex(currentPageIndex - 1)}
          disabled={!canGoPrev}
          style={{
            padding: `${V.s2} ${V.s3}`,
            border: `1px solid ${V.border}`,
            borderRadius: V.r2,
            backgroundColor: canGoPrev ? V.bgSurface : V.bgApp,
            color: canGoPrev ? V.textPrimary : V.textSecondary,
            cursor: canGoPrev ? 'pointer' : 'not-allowed',
            fontSize: V.sm,
            fontWeight: 600,
            fontFamily: V.font,
            opacity: canGoPrev ? 1 : 0.5,
          }}
        >
          ← Previous
        </button>

        {isLastPage ? (
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
        ) : (
          <button
            type="button"
            onClick={() => onChangePageIndex(currentPageIndex + 1)}
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
            Next →
          </button>
        )}
      </div>
    </div>
  );
}
