import React from 'react';
import type { SectionSettings } from '@fieldsaver/shared';
import { V } from '../../constants/design';

interface SectionSettingsDrawerProps {
  settings: SectionSettings;
  onUpdate: (settings: SectionSettings) => void;
  onClose: () => void;
}

export function SectionSettingsDrawer({ settings, onUpdate, onClose }: SectionSettingsDrawerProps) {
  const [localSettings, setLocalSettings] = React.useState<SectionSettings>(settings);

  const handleSave = () => {
    onUpdate(localSettings);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'flex-end',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '350px',
          height: '100vh',
          backgroundColor: V.bgSurface,
          boxShadow: V.shadow3,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideIn 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: V.s4,
            borderBottom: `1px solid ${V.borderLight}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <h3 style={{ margin: 0, fontSize: V.lg, fontWeight: 700, color: V.textPrimary, fontFamily: V.font }}>
            Section Settings
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: '28px',
              height: '28px',
              padding: 0,
              border: 'none',
              backgroundColor: 'transparent',
              color: V.textSecondary,
              fontSize: V.lg,
              cursor: 'pointer',
              fontFamily: V.font,
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: V.s4,
            display: 'flex',
            flexDirection: 'column',
            gap: V.s3,
          }}
        >
          {/* Repeatable toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: V.s3,
            }}
          >
            <div>
              <div style={{ fontSize: V.md, fontFamily: V.font, color: V.textPrimary }}>
                Allow Repeating
              </div>
              <div
                style={{
                  fontSize: V.sm,
                  color: V.textSecondary,
                  fontFamily: V.font,
                  marginTop: V.s1,
                }}
              >
                Respondents can add multiple instances of this section
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-label="Allow Repeating"
              aria-checked={localSettings.repeatable}
              onClick={() => setLocalSettings({ ...localSettings, repeatable: !localSettings.repeatable })}
              style={{
                flexShrink: 0,
                width: '36px',
                height: '20px',
                borderRadius: V.rFull,
                border: 'none',
                backgroundColor: localSettings.repeatable ? V.primary : V.border,
                cursor: 'pointer',
                position: 'relative',
                transition: 'background-color 0.2s',
                padding: 0,
              }}
            >
              <span
                style={{
                  display: 'block',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: V.bgSurface,
                  position: 'absolute',
                  top: '3px',
                  left: localSettings.repeatable ? '19px' : '3px',
                  transition: 'left 0.2s',
                }}
              />
            </button>
          </div>

          {/* Repeat label (only show if repeatable) */}
          {localSettings.repeatable && (
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: V.sm,
                  fontWeight: 600,
                  color: V.textSecondary,
                  marginBottom: V.s1,
                  fontFamily: V.font,
                }}
              >
                Add Button Label
              </label>
              <input
                type="text"
                value={localSettings.repeatLabel}
                onChange={(e) => setLocalSettings({ ...localSettings, repeatLabel: e.target.value })}
                placeholder="e.g. + Add Another"
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
            </div>
          )}

          {/* Max repeats (only show if repeatable) */}
          {localSettings.repeatable && (
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: V.sm,
                  fontWeight: 600,
                  color: V.textSecondary,
                  marginBottom: V.s1,
                  fontFamily: V.font,
                }}
              >
                Maximum Instances
              </label>
              <input
                type="number"
                value={localSettings.maxRepeats}
                onChange={(e) => setLocalSettings({ ...localSettings, maxRepeats: parseInt(e.target.value) || 0 })}
                placeholder="0 = unlimited"
                min="0"
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
              <div
                style={{
                  fontSize: V.xs,
                  color: V.textSecondary,
                  marginTop: V.s1,
                  fontFamily: V.font,
                  fontStyle: 'italic',
                }}
              >
                Leave blank or 0 for unlimited
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: V.s4,
            borderTop: `1px solid ${V.borderLight}`,
            display: 'flex',
            gap: V.s2,
            justifyContent: 'flex-end',
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: `${V.s2} ${V.s4}`,
              border: `1px solid ${V.border}`,
              borderRadius: V.r3,
              backgroundColor: V.bgSurface,
              color: V.textPrimary,
              fontSize: V.sm,
              fontWeight: 600,
              fontFamily: V.font,
              cursor: 'pointer',
              transition: 'all 0.12s',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{
              padding: `${V.s2} ${V.s4}`,
              border: 'none',
              borderRadius: V.r3,
              backgroundColor: V.primary,
              color: V.bgSurface,
              fontSize: V.sm,
              fontWeight: 600,
              fontFamily: V.font,
              cursor: 'pointer',
              transition: 'all 0.12s',
            }}
          >
            Save
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
