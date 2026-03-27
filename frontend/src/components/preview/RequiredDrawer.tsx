import React, { useMemo } from 'react';
import type { Form, Field } from '@fieldsaver/shared';
import { V } from '../../constants/design';
import { LiveField } from './LiveField';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RequiredDrawerProps {
  form: Form;
  fieldValues: Record<string, any>;
  onFieldChange: (fieldId: string, value: any) => void;
  onClose: () => void;
}

// ─── RequiredDrawer ───────────────────────────────────────────────────────────

export function RequiredDrawer({
  form,
  fieldValues,
  onFieldChange,
  onClose,
}: RequiredDrawerProps) {
  const [markedDone, setMarkedDone] = React.useState<Set<string>>(new Set());

  // Collect all required fields grouped by page › section
  const requiredFieldsBySection = useMemo(() => {
    const grouped: Array<{
      pageTitle: string;
      sectionTitle: string;
      fields: Field[];
    }> = [];

    const pages = form.data?.pages || [];
    pages.forEach((page) => {
      page.sections?.forEach((section) => {
        const requiredFields = section.rows
          ?.flatMap((row) => row.cells?.flatMap((cell) => cell.fields || []) || [])
          .filter((field) => field.required)
          || [];

        if (requiredFields.length > 0) {
          grouped.push({
            pageTitle: page.title,
            sectionTitle: section.title,
            fields: requiredFields,
          });
        }
      });
    });

    return grouped;
  }, [form]);

  const filledCount = useMemo(() => {
    return requiredFieldsBySection.reduce((count, group) => {
      return (
        count +
        group.fields.filter((field) => {
          const value = fieldValues[field.id];
          return value !== null && value !== undefined && value !== '';
        }).length
      );
    }, 0);
  }, [requiredFieldsBySection, fieldValues]);

  const totalRequired = requiredFieldsBySection.reduce(
    (count, group) => count + group.fields.length,
    0
  );

  const progressPercent = totalRequired > 0 ? (filledCount / totalRequired) * 100 : 0;

  return (
    <div
      style={{
        position: 'fixed',
        right: 0,
        top: 0,
        height: '100vh',
        width: '350px',
        backgroundColor: V.bgSurface,
        borderLeft: `1px solid ${V.border}`,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 999,
        boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.15)',
      }}
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
        <div>
          <h3
            style={{
              fontSize: V.sm,
              fontWeight: 700,
              color: V.textPrimary,
              fontFamily: V.font,
              margin: 0,
            }}
          >
            Required Fields
          </h3>
          <p
            style={{
              fontSize: V.xs,
              color: V.textSecondary,
              fontFamily: V.font,
              margin: `${V.s1}px 0 0 0`,
            }}
          >
            {filledCount} of {totalRequired}
          </p>
        </div>
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
          title="Close"
        >
          ✕
        </button>
      </div>

      {/* Progress Bar */}
      <div style={{ padding: V.s2, backgroundColor: V.bgApp }}>
        <div
          style={{
            height: '6px',
            backgroundColor: V.border,
            borderRadius: '3px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              backgroundColor: progressPercent === 100 ? '#22c55e' : V.primary,
              width: `${progressPercent}%`,
              transition: 'width 0.3s ease, background-color 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Fields List */}
      <div style={{ flex: 1, overflow: 'auto', padding: V.s3 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: V.s4 }}>
          {requiredFieldsBySection.map((group, groupIdx) => (
            <div key={groupIdx}>
              {/* Group Header */}
              <div
                style={{
                  fontSize: V.xs,
                  fontWeight: 700,
                  color: V.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: V.s2,
                  fontFamily: V.font,
                }}
              >
                {group.pageTitle} › {group.sectionTitle}
              </div>

              {/* Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: V.s3 }}>
                {group.fields.map((field) => {
                  const fieldValue = fieldValues[field.id];
                  const isFilled = fieldValue !== null && fieldValue !== undefined && fieldValue !== '';
                  const isDone = markedDone.has(field.id) || isFilled;

                  return (
                    <div key={field.id}>
                      {/* Field Renderer */}
                      <div style={{ marginBottom: V.s2 }}>
                        <LiveField
                          field={field}
                          value={fieldValue ?? null}
                          onChange={(value) => onFieldChange(field.id, value)}
                        />
                      </div>

                      {/* Mark Done Button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (isFilled) {
                            setMarkedDone((prev) => new Set([...prev, field.id]));
                          }
                        }}
                        disabled={!isFilled}
                        style={{
                          width: '100%',
                          padding: `${V.s1} ${V.s2}`,
                          border: 'none',
                          borderRadius: V.r2,
                          backgroundColor: isFilled ? '#22c55e' : V.bgApp,
                          color: isFilled ? 'white' : V.textSecondary,
                          cursor: isFilled ? 'pointer' : 'not-allowed',
                          fontSize: V.xs,
                          fontWeight: 600,
                          fontFamily: V.font,
                          opacity: isFilled ? 1 : 0.5,
                          transition: 'background-color 0.2s ease',
                        }}
                      >
                        {isDone ? '✓ Done' : 'Mark Done'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {totalRequired === 0 && (
          <div style={{ textAlign: 'center', padding: V.s4 }}>
            <p style={{ color: V.textSecondary, fontFamily: V.font, fontSize: V.sm }}>
              No required fields in this form.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
