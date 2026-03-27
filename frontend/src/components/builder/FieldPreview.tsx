import type { Field } from '@fieldsaver/shared';
import { V } from '../../constants/design';
import { FIELD_TYPES } from '../../constants/fieldTypes';

interface FieldPreviewProps {
  field: Field;
}

export function FieldPreview({ field }: FieldPreviewProps) {
  const fieldTypeDef = FIELD_TYPES.find((t) => t.type === field.type);
  const isLayoutField = field.type === 'description' || field.type === 'divider';

  if (!fieldTypeDef) return null;

  return (
    <div
      style={{
        padding: V.s3,
        marginBottom: V.s3,
        backgroundColor: V.bgSurface,
        border: `1px solid ${V.border}`,
        borderRadius: V.r3,
      }}
    >
      <div style={{ fontSize: V.xs, color: V.textSecondary, marginBottom: V.s2, fontFamily: V.font }}>
        LIVE PREVIEW
      </div>

      {/* Description field */}
      {field.type === 'description' && (
        <div style={{ fontSize: V.md, color: V.textPrimary, fontFamily: V.font, whiteSpace: 'pre-wrap' }}>
          {field.settings.content || '(No content)'}
        </div>
      )}

      {/* Divider field */}
      {field.type === 'divider' && (
        <div style={{ height: '2px', backgroundColor: V.borderLight, margin: `${V.s2} 0` }} />
      )}

      {/* Other fields */}
      {!isLayoutField && (
        <>
          {field.label && (
            <label
              style={{
                display: 'block',
                fontSize: V.md,
                fontWeight: 500,
                color: V.textPrimary,
                marginBottom: V.s2,
                fontFamily: V.font,
              }}
            >
              {field.label}
              {field.required && <span style={{ color: 'red', marginLeft: '4px' }}>*</span>}
            </label>
          )}

          {/* Text / Long Text */}
          {(field.type === 'text' || field.type === 'long_text') && (
            <input
              type="text"
              placeholder={field.placeholder || 'Enter text...'}
              disabled
              style={{
                width: '100%',
                padding: `${V.s2} ${V.s2}`,
                border: `1px solid ${V.borderLight}`,
                borderRadius: V.r2,
                fontSize: V.md,
                backgroundColor: V.bgSurface,
                color: V.textDisabled,
                fontFamily: V.font,
                boxSizing: 'border-box',
                opacity: 0.6,
              }}
            />
          )}

          {/* Number */}
          {field.type === 'number' && (
            <input
              type="number"
              placeholder={field.placeholder || 'Enter number...'}
              disabled
              style={{
                width: '100%',
                padding: `${V.s2} ${V.s2}`,
                border: `1px solid ${V.borderLight}`,
                borderRadius: V.r2,
                fontSize: V.md,
                backgroundColor: V.bgSurface,
                color: V.textDisabled,
                fontFamily: V.font,
                boxSizing: 'border-box',
                opacity: 0.6,
              }}
            />
          )}

          {/* Email */}
          {field.type === 'email' && (
            <input
              type="email"
              placeholder={field.placeholder || 'email@example.com'}
              disabled
              style={{
                width: '100%',
                padding: `${V.s2} ${V.s2}`,
                border: `1px solid ${V.borderLight}`,
                borderRadius: V.r2,
                fontSize: V.md,
                backgroundColor: V.bgSurface,
                color: V.textDisabled,
                fontFamily: V.font,
                boxSizing: 'border-box',
                opacity: 0.6,
              }}
            />
          )}

          {/* Phone */}
          {field.type === 'phone' && (
            <input
              type="tel"
              placeholder={field.placeholder || '(123) 456-7890'}
              disabled
              style={{
                width: '100%',
                padding: `${V.s2} ${V.s2}`,
                border: `1px solid ${V.borderLight}`,
                borderRadius: V.r2,
                fontSize: V.md,
                backgroundColor: V.bgSurface,
                color: V.textDisabled,
                fontFamily: V.font,
                boxSizing: 'border-box',
                opacity: 0.6,
              }}
            />
          )}

          {/* URL */}
          {field.type === 'url' && (
            <input
              type="url"
              placeholder={field.placeholder || 'https://example.com'}
              disabled
              style={{
                width: '100%',
                padding: `${V.s2} ${V.s2}`,
                border: `1px solid ${V.borderLight}`,
                borderRadius: V.r2,
                fontSize: V.md,
                backgroundColor: V.bgSurface,
                color: V.textDisabled,
                fontFamily: V.font,
                boxSizing: 'border-box',
                opacity: 0.6,
              }}
            />
          )}

          {/* Date */}
          {field.type === 'date' && (
            <input
              type="date"
              disabled
              style={{
                width: '100%',
                padding: `${V.s2} ${V.s2}`,
                border: `1px solid ${V.borderLight}`,
                borderRadius: V.r2,
                fontSize: V.md,
                backgroundColor: V.bgSurface,
                color: V.textDisabled,
                fontFamily: V.font,
                boxSizing: 'border-box',
                opacity: 0.6,
              }}
            />
          )}

          {/* Time */}
          {field.type === 'time' && (
            <input
              type="time"
              disabled
              style={{
                width: '100%',
                padding: `${V.s2} ${V.s2}`,
                border: `1px solid ${V.borderLight}`,
                borderRadius: V.r2,
                fontSize: V.md,
                backgroundColor: V.bgSurface,
                color: V.textDisabled,
                fontFamily: V.font,
                boxSizing: 'border-box',
                opacity: 0.6,
              }}
            />
          )}

          {/* Dropdown */}
          {field.type === 'dropdown' && (
            <select
              disabled
              style={{
                width: '100%',
                padding: `${V.s2} ${V.s2}`,
                border: `1px solid ${V.borderLight}`,
                borderRadius: V.r2,
                fontSize: V.md,
                backgroundColor: V.bgSurface,
                color: V.textDisabled,
                fontFamily: V.font,
                boxSizing: 'border-box',
                opacity: 0.6,
              }}
            >
              <option>Select an option...</option>
            </select>
          )}

          {/* Radio / Checkbox / Multi-Select */}
          {(field.type === 'radio' || field.type === 'checkbox' || field.type === 'multi_select') && (
            <div style={{ fontSize: V.sm, color: V.textSecondary, fontFamily: V.font }}>
              {field.type === 'multi_select' ? '(Multiple choice options)' : `(${field.type} options)`}
            </div>
          )}

          {/* Rating */}
          {field.type === 'rating' && (
            <div style={{ fontSize: V.lg, color: V.textSecondary, fontFamily: V.font, letterSpacing: V.s1 }}>
              ★ ★ ★ ★ ★
            </div>
          )}

          {/* Scale */}
          {field.type === 'scale' && (
            <div style={{ fontSize: V.sm, color: V.textSecondary, fontFamily: V.font }}>
              (Linear scale visualization)
            </div>
          )}

          {/* File */}
          {field.type === 'file' && (
            <div
              style={{
                padding: V.s3,
                border: `2px dashed ${V.borderLight}`,
                borderRadius: V.r2,
                textAlign: 'center',
                color: V.textSecondary,
                fontSize: V.sm,
                fontFamily: V.font,
              }}
            >
              Click to upload file
            </div>
          )}

          {/* Signature */}
          {field.type === 'signature' && (
            <div
              style={{
                height: '120px',
                border: `1px solid ${V.borderLight}`,
                borderRadius: V.r2,
                backgroundColor: V.bgHover,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: V.textSecondary,
                fontSize: V.sm,
                fontFamily: V.font,
              }}
            >
              Signature pad
            </div>
          )}

          {/* Help text */}
          {field.helpText && (
            <div
              style={{
                fontSize: V.sm,
                color: V.textSecondary,
                marginTop: V.s2,
                fontFamily: V.font,
                fontStyle: 'italic',
              }}
            >
              {field.helpText}
            </div>
          )}
        </>
      )}
    </div>
  );
}
