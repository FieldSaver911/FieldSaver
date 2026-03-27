import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { COL_PRESETS } from '../../constants/fieldTypes';
import { V } from '../../constants/design';

interface LayoutPickerProps {
  onSelect: (preset: typeof COL_PRESETS[0]) => void;
  onClose: () => void;
  position?: { top: number; left: number; width: number };
  fullWidth?: boolean; // If true, use button width for dropdown width
}

export function LayoutPicker({ onSelect, onClose, position, fullWidth }: LayoutPickerProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState<{ top: number; left: number; width: number } | undefined>(position);
  const [maxHeight, setMaxHeight] = useState<string>('65vh');

  useEffect(() => {
    if (!position) return;

    // Wait for menu to render before measuring
    const timer = setTimeout(() => {
      if (!menuRef.current) return;

      const PADDING = 20; // Padding from viewport edge
      const BUTTON_HEIGHT = 40;
      const GAP = 8;
      const menuHeight = menuRef.current.offsetHeight;
      const viewportHeight = window.innerHeight;

      // Calculate available space
      const availableSpaceBelow = viewportHeight - position.top - BUTTON_HEIGHT;
      const availableSpaceAbove = position.top;

      let finalTop = position.top;
      let finalMaxHeight = '65vh';

      // Determine position and max height
      if (availableSpaceBelow >= menuHeight) {
        // Enough space below - position below button
        finalTop = position.top + BUTTON_HEIGHT + GAP;
        finalMaxHeight = `${availableSpaceBelow - PADDING}px`;
      } else if (availableSpaceAbove >= menuHeight) {
        // Not enough below but enough above - position above button
        finalTop = position.top - menuHeight - GAP;
        finalMaxHeight = `${availableSpaceAbove - PADDING}px`;
      } else if (availableSpaceAbove > availableSpaceBelow) {
        // Position above and limit height
        finalTop = PADDING;
        finalMaxHeight = `${availableSpaceAbove - PADDING}px`;
      } else {
        // Position below and limit height
        finalTop = position.top + BUTTON_HEIGHT + GAP;
        finalMaxHeight = `${availableSpaceBelow - PADDING}px`;
      }

      setAdjustedPosition({
        ...position,
        top: finalTop,
      });
      setMaxHeight(finalMaxHeight);
    }, 0);

    return () => clearTimeout(timer);
  }, [position]);
  return createPortal(
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
        ref={menuRef}
        style={{
          position: 'fixed',
          ...(adjustedPosition && {
            top: `${adjustedPosition.top}px`,
            left: `${fullWidth ? adjustedPosition.left : Math.max(10, Math.min(adjustedPosition.left, window.innerWidth - 400))}px`,
            ...(fullWidth && { width: `${adjustedPosition.width}px` }),
          }),
          ...(fullWidth ? {} : { minWidth: '380px' }),
          backgroundColor: V.bgSurface,
          borderRadius: V.r3,
          padding: '10px',
          maxWidth: 'calc(100vw - 20px)',
          maxHeight,
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
            gridTemplateColumns: 'repeat(2, 1fr)',
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
    </>,
    document.body
  );
}
