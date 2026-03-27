import type { Field } from '@fieldsaver/shared';
import { V } from '../../constants/design';
import { FIELD_TYPES } from '../../constants/fieldTypes';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface FieldTypesSidebarProps {
  onAddField: (type: Field['type']) => void;
  onPaletteDragStart: (type: Field['type']) => void;
  onPaletteDragEnd: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FieldTypesSidebar({
  onAddField,
  onPaletteDragStart,
  onPaletteDragEnd,
}: FieldTypesSidebarProps) {
  const categories = ['basic', 'choice', 'advanced', 'layout'] as const;
  const catLabels: Record<string, string> = {
    basic: 'BASIC',
    choice: 'CHOICE',
    advanced: 'ADVANCED',
    layout: 'LAYOUT',
  };

  const catColors: Record<string, string> = {
    basic: '#0073EA',      // Vibe blue
    choice: '#A78BFA',     // Purple
    advanced: '#6BE7B9',   // Green
    layout: '#FFB366',     // Orange
  };

  return (
    <div
      style={{
        width: '200px',
        flexShrink: 0,
        backgroundColor: V.bgSurface,
        borderRight: `1px solid ${V.borderLight}`,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          height: '52px',
          padding: `0 ${V.s3}`,
          display: 'flex',
          alignItems: 'center',
          borderBottom: `1px solid ${V.borderLight}`,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: V.xs,
            fontWeight: 700,
            color: V.textDisabled,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontFamily: V.font,
          }}
        >
          Field Types
        </span>
      </div>

      {/* Field types list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: `${V.s3} ${V.s2}` }}>
        {categories.map((cat) => (
          <div key={cat} style={{ marginBottom: V.s4 }}>
            {/* Category label */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: V.s1,
                marginBottom: V.s2,
                paddingLeft: V.s1,
              }}
            >
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: catColors[cat],
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: V.xs,
                  fontWeight: 700,
                  color: V.textDisabled,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontFamily: V.font,
                }}
              >
                {catLabels[cat]}
              </span>
            </div>

            {/* Field type items */}
            {FIELD_TYPES.filter((t) => t.category === cat).map((fieldType) => (
              <button
                key={fieldType.type}
                type="button"
                draggable
                onClick={() => onAddField(fieldType.type)}
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/x-fieldsaver-palette-type', fieldType.type);
                  e.dataTransfer.effectAllowed = 'copy';
                  onPaletteDragStart(fieldType.type);
                }}
                onDragEnd={() => onPaletteDragEnd()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: V.s2,
                  width: '100%',
                  padding: `${V.s2} ${V.s2}`,
                  marginBottom: V.s1,
                  border: `1px solid ${V.borderLight}`,
                  borderRadius: V.r2,
                  backgroundColor: V.bgApp,
                  color: V.textPrimary,
                  cursor: 'grab',
                  fontSize: V.sm,
                  fontFamily: V.font,
                  transition: 'all 0.12s',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = V.bgHover;
                  e.currentTarget.style.borderColor = V.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = V.bgApp;
                  e.currentTarget.style.borderColor = V.borderLight;
                }}
                title={`Add ${fieldType.label} field or drag to place in column`}
              >
                {/* Icon */}
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: V.r2,
                    backgroundColor: `${catColors[cat]}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: catColors[cat],
                    fontSize: V.sm,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {fieldType.icon}
                </div>

                {/* Label */}
                <span
                  style={{
                    fontSize: V.sm,
                    color: V.textPrimary,
                    fontFamily: V.font,
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {fieldType.label}
                </span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
