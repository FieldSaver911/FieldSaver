import { COL_PRESETS } from '../../constants/fieldTypes';
import { V } from '../../constants/design';

interface LayoutPickerProps {
  onSelect: (preset: typeof COL_PRESETS[0]) => void;
  onClose: () => void;
  position?: { top: number; left: number; width: number };
}

export function LayoutPicker({ onSelect, onClose, position }: LayoutPickerProps) {
  return (
    <>
      {/* Backdrop - click to close */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9998,
        }}
        onClick={onClose}
      />

      {/* Dropdown menu - very compact */}
      <div
        style={{
          position: position ? 'fixed' : 'absolute',
          ...(position
            ? { top: `${position.top}px`, left: `${position.left}px`, width: `${position.width}px` }
            : { top: '100%', left: 0, marginTop: '4px', right: 'auto' }),
          backgroundColor: V.bgSurface,
          borderRadius: V.r3,
          padding: '10px',
          maxWidth: 'calc(100vw - 20px)',
          maxHeight: '65vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          boxShadow: V.shadow3,
          border: `1px solid ${V.borderLight}`,
          zIndex: 9999,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - very small */}
        <div style={{ marginBottom: '8px' }}>
          <h3
            style={{
              margin: 0,
              fontSize: '10px',
              fontWeight: 700,
              color: V.textDisabled,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontFamily: V.font,
            }}
          >
            Column Layout — 12-Column Grid
          </h3>
        </div>

        {/* Layout grid - 2 columns, ultra compact */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '6px',
          }}
        >
          {COL_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                onSelect(preset);
                onClose();
              }}
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '6px',
                alignItems: 'center',
                padding: '5px 6px',
                border: `1px solid ${V.borderLight}`,
                borderRadius: V.r2,
                backgroundColor: V.bgSurface,
                cursor: 'pointer',
                transition: 'all 0.12s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = V.primary;
                (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 0 1px ${V.primaryBg}`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = V.borderLight;
                (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
              }}
            >
              {/* Visual representation - very compact */}
              <div
                style={{
                  display: 'flex',
                  gap: '2px',
                  alignItems: 'center',
                  minHeight: '24px',
                  flexShrink: 0,
                }}
              >
                {preset.cols.map((span, idx) => {
                  const minWidth = 14;
                  const maxWidth = 32;
                  const widthPercent = (span / 12) * 100;
                  const visualWidth = Math.max(minWidth, Math.min(maxWidth, (widthPercent / 100) * 60));

                  return (
                    <div
                      key={idx}
                      style={{
                        width: `${visualWidth}px`,
                        height: '22px',
                        backgroundColor: '#E3F2FD',
                        border: `1px solid ${V.primary}`,
                        borderRadius: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '9px',
                        fontWeight: 700,
                        color: V.primary,
                        fontFamily: V.font,
                        flexShrink: 0,
                      }}
                    >
                      {span}
                    </div>
                  );
                })}
              </div>

              {/* Layout info - very compact */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1px',
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: V.textPrimary,
                    fontFamily: V.font,
                    lineHeight: 1.2,
                  }}
                >
                  {preset.label}
                </span>
                <span
                  style={{
                    fontSize: '9px',
                    color: V.textDisabled,
                    fontFamily: V.font,
                    lineHeight: 1.2,
                  }}
                >
                  {preset.hint}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
