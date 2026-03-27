import type { Field } from '@fieldsaver/shared';
import { V } from '../../constants/design';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LiveFieldProps {
  field: Field;
  value: string | number | boolean | null;
  onChange: (value: string | number | boolean | null) => void;
  showNotMode?: boolean;
  onToggleNotMode?: () => void;
  isNotMode?: boolean;
}

// ─── LiveField ────────────────────────────────────────────────────────────────

export function LiveField({
  field,
  value,
  onChange,
  showNotMode = false,
  onToggleNotMode,
  isNotMode = false,
}: LiveFieldProps) {
  return (
    <div style={{ marginBottom: V.s4 }}>
      {/* Field header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: V.s2,
          marginBottom: V.s2,
        }}
      >
        <label
          style={{
            fontSize: V.md,
            fontWeight: 600,
            color: isNotMode ? '#D32F2F' : V.textPrimary,
            fontFamily: V.font,
            flex: 1,
          }}
        >
          {field.label}
          {field.required && <span style={{ color: '#D32F2F' }}>*</span>}
        </label>
        {isNotMode && (
          <span
            style={{
              display: 'inline-block',
              padding: `2px ${V.s2}`,
              backgroundColor: '#D32F2F',
              color: 'white',
              borderRadius: V.r2,
              fontSize: V.xs,
              fontWeight: 600,
              fontFamily: V.font,
            }}
          >
            NOT Mode
          </span>
        )}
        {showNotMode && (
          <button
            type="button"
            onClick={onToggleNotMode}
            style={{
              padding: `${V.s1} ${V.s2}`,
              border: `1px solid ${V.border}`,
              borderRadius: V.r3,
              backgroundColor: V.bgSurface,
              color: V.textPrimary,
              cursor: 'pointer',
              fontSize: V.xs,
              fontFamily: V.font,
            }}
          >
            Toggle NOT
          </button>
        )}
      </div>

      {/* Field help text */}
      {field.helpText && (
        <div style={{ fontSize: V.xs, color: V.textSecondary, fontFamily: V.font, marginBottom: V.s2 }}>
          {field.helpText}
        </div>
      )}

      {/* NOT value chips (when applicable) */}
      {showNotMode && field.dataAttrs?.showCategories?.includes('NOT Value') && (
        <div style={{ display: 'flex', gap: V.s2, flexWrap: 'wrap', marginBottom: V.s3 }}>
          {['Not Applicable', 'Not Recorded', 'Not Reporting'].map((notValue) => (
            <button
              key={notValue}
              type="button"
              style={{
                padding: `${V.s1} ${V.s2}`,
                border: `1px solid ${V.border}`,
                borderRadius: V.r3,
                backgroundColor: V.bgApp,
                color: V.textPrimary,
                cursor: 'pointer',
                fontSize: V.xs,
                fontFamily: V.font,
              }}
            >
              {notValue}
            </button>
          ))}
        </div>
      )}

      {/* Field input based on type */}
      {field.type === 'text' && (
        <input
          type="text"
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          style={{
            width: '100%',
            padding: `${V.s2} ${V.s3}`,
            border: `1px solid ${V.border}`,
            borderRadius: V.r3,
            fontSize: V.md,
            fontFamily: V.font,
            color: V.textPrimary,
            backgroundColor: V.bgSurface,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      )}

      {field.type === 'long_text' && (
        <textarea
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={4}
          style={{
            width: '100%',
            padding: `${V.s2} ${V.s3}`,
            border: `1px solid ${V.border}`,
            borderRadius: V.r3,
            fontSize: V.md,
            fontFamily: V.font,
            color: V.textPrimary,
            backgroundColor: V.bgSurface,
            outline: 'none',
            boxSizing: 'border-box',
            resize: 'vertical',
          }}
        />
      )}

      {field.type === 'number' && (
        <input
          type="number"
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : null)}
          placeholder={field.placeholder}
          style={{
            width: '100%',
            padding: `${V.s2} ${V.s3}`,
            border: `1px solid ${V.border}`,
            borderRadius: V.r3,
            fontSize: V.md,
            fontFamily: V.font,
            color: V.textPrimary,
            backgroundColor: V.bgSurface,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      )}

      {field.type === 'date' && (
        <input
          type="date"
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%',
            padding: `${V.s2} ${V.s3}`,
            border: `1px solid ${V.border}`,
            borderRadius: V.r3,
            fontSize: V.md,
            fontFamily: V.font,
            color: V.textPrimary,
            backgroundColor: V.bgSurface,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      )}

      {field.type === 'time' && (
        <input
          type="time"
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%',
            padding: `${V.s2} ${V.s3}`,
            border: `1px solid ${V.border}`,
            borderRadius: V.r3,
            fontSize: V.md,
            fontFamily: V.font,
            color: V.textPrimary,
            backgroundColor: V.bgSurface,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      )}

      {field.type === 'dropdown' && (
        <select
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%',
            padding: `${V.s2} ${V.s3}`,
            border: `1px solid ${V.border}`,
            borderRadius: V.r3,
            fontSize: V.md,
            fontFamily: V.font,
            color: V.textPrimary,
            backgroundColor: V.bgSurface,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        >
          <option value="">{field.placeholder || 'Select...'}</option>
          {field.options?.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {field.type === 'multi_select' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: V.s2 }}>
          {field.options?.map((opt) => (
            <label
              key={opt.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: V.s2,
                fontSize: V.sm,
                fontFamily: V.font,
                cursor: 'pointer',
              }}
            >
              <input type="checkbox" />
              {opt.label}
            </label>
          ))}
        </div>
      )}

      {field.type === 'radio' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: V.s2 }}>
          {field.options?.map((opt) => (
            <label
              key={opt.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: V.s2,
                fontSize: V.sm,
                fontFamily: V.font,
                cursor: 'pointer',
              }}
            >
              <input type="radio" name={field.id} value={opt.id} onChange={() => onChange(opt.id)} />
              {opt.label}
            </label>
          ))}
        </div>
      )}

      {field.type === 'checkbox' && (
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: V.s2,
            fontSize: V.sm,
            fontFamily: V.font,
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
          />
          {field.placeholder}
        </label>
      )}

      {field.type === 'rating' && (
        <div style={{ display: 'flex', gap: V.s2 }}>
          {Array.from({ length: (field.settings.max as number ?? 5) }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onChange(i + 1)}
              style={{
                padding: `${V.s2} ${V.s3}`,
                border: `1px solid ${V.border}`,
                borderRadius: V.r3,
                backgroundColor: (value as number) > i ? V.primary : V.bgApp,
                color: (value as number) > i ? V.bgSurface : V.textPrimary,
                cursor: 'pointer',
                fontSize: V.md,
                fontFamily: V.font,
              }}
            >
              ★
            </button>
          ))}
        </div>
      )}

      {field.type === 'scale' && (
        <div style={{ display: 'flex', gap: V.s2 }}>
          {Array.from({ length: Math.max(0, (field.settings.max as number ?? 5) - (field.settings.min as number ?? 1) + 1) }).map((_, i) => {
            const min = (field.settings.min as number ?? 1);
            const val = min + i;
            return (
              <button
                key={val}
                type="button"
                onClick={() => onChange(val)}
                style={{
                  padding: `${V.s2} ${V.s3}`,
                  border: `1px solid ${V.border}`,
                  borderRadius: V.r3,
                  backgroundColor: value === val ? V.primary : V.bgApp,
                  color: value === val ? V.bgSurface : V.textPrimary,
                  cursor: 'pointer',
                  fontSize: V.md,
                  fontFamily: V.font,
                }}
              >
                {val}
              </button>
            );
          })}
        </div>
      )}

      {field.type === 'file' && (
        <input
          type="file"
          onChange={(e) => onChange(e.target.files?.[0]?.name ?? null)}
          style={{
            width: '100%',
            padding: `${V.s2} ${V.s3}`,
            border: `1px solid ${V.border}`,
            borderRadius: V.r3,
            fontSize: V.md,
            fontFamily: V.font,
            cursor: 'pointer',
          }}
        />
      )}

      {field.type === 'description' && (
        <div
          style={{
            padding: V.s3,
            backgroundColor: V.bgApp,
            borderRadius: V.r3,
            fontSize: V.sm,
            color: V.textSecondary,
            fontFamily: V.font,
            lineHeight: 1.5,
          }}
        >
          {field.settings.content}
        </div>
      )}

      {field.type === 'divider' && (
        <div style={{ height: '1px', backgroundColor: V.border, margin: `${V.s4} 0` }} />
      )}
    </div>
  );
}
