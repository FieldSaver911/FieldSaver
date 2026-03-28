import { useState } from 'react';
import type { Form } from '@fieldsaver/shared';
import { Monitor, Tablet, Smartphone, X } from 'lucide-react';
import { V } from '../../constants/design';
import { useFormStore } from '../../stores/useFormStore';
import { PreviewProgress } from './PreviewProgress';
import { PreviewSinglePage } from './PreviewSinglePage';
import { PreviewSideNav } from './PreviewSideNav';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PreviewModalProps {
  form: Form;
  onClose: () => void;
}

type DeviceType = 'web' | 'tablet' | 'mobile';
type FormLayout = 'progress' | 'single-page' | 'side-nav';

// ─── Device Widths ────────────────────────────────────────────────────────────

const DEVICE_WIDTHS: Record<DeviceType, number> = {
  web: 1024,
  tablet: 768,
  mobile: 375,
};

// ─── PreviewModal ─────────────────────────────────────────────────────────────

export function PreviewModal({ form, onClose }: PreviewModalProps) {
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>('web');
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [localLayout, setLocalLayout] = useState<FormLayout>(form.settings?.formLayout || 'progress');

  const setFormAction = useFormStore((s) => s.setForm);
  const markDirtyAction = useFormStore((s) => s.markDirty);

  const deviceWidth = DEVICE_WIDTHS[selectedDevice];

  const handleLayoutChange = (layout: FormLayout) => {
    setLocalLayout(layout);
    // Update form settings in store
    const updatedForm = {
      ...form,
      settings: {
        ...form.settings,
        formLayout: layout,
      },
    };
    setFormAction(updatedForm);
    markDirtyAction();
  };

  const renderLayout = () => {
    switch (localLayout) {
      case 'progress':
        return (
          <PreviewProgress
            form={form}
            currentPageIndex={currentPageIndex}
            onChangePageIndex={setCurrentPageIndex}
            deviceWidth={deviceWidth}
          />
        );
      case 'single-page':
        return <PreviewSinglePage form={form} deviceWidth={deviceWidth} onClose={onClose} />;
      case 'side-nav':
        return (
          <PreviewSideNav
            form={form}
            currentPageIndex={currentPageIndex}
            onChangePageIndex={setCurrentPageIndex}
            deviceWidth={deviceWidth}
            onClose={onClose}
          />
        );
      default:
        return (
          <PreviewProgress
            form={form}
            currentPageIndex={currentPageIndex}
            onChangePageIndex={setCurrentPageIndex}
            deviceWidth={deviceWidth}
          />
        );
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          zIndex: 999,
          backdropFilter: 'blur(2px)',
        }}
        onClick={onClose}
      />

      {/* Right-side slider */}
      <div
        style={{
          position: 'fixed',
          right: 0,
          top: 0,
          bottom: 0,
          width: '75%',
          backgroundColor: V.bgApp,
          boxShadow: '-4px 0 12px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          animation: 'slideInRight 0.3s ease-out',
        }}
      >
        <style>{`
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}</style>

        {/* Header */}
        <div
          style={{
            backgroundColor: V.bgSurface,
            borderBottom: `1px solid ${V.border}`,
            padding: `${V.s3} ${V.s4}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: V.s3,
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: V.s2 }}>
            <span style={{ fontSize: V.md, fontWeight: 600, fontFamily: V.font }}>
              Preview
            </span>
          </div>

          {/* Layout controls */}
          <div style={{ display: 'flex', gap: V.s2, alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => handleLayoutChange('progress')}
              style={{
                padding: `${V.s1} ${V.s3}`,
                border: `1px solid ${localLayout === 'progress' ? V.primary : V.border}`,
                borderRadius: V.r2,
                backgroundColor: localLayout === 'progress' ? V.primary : V.bgApp,
                color: localLayout === 'progress' ? '#ffffff' : V.textPrimary,
                cursor: 'pointer',
                fontSize: V.xs,
                fontWeight: localLayout === 'progress' ? 600 : 400,
                fontFamily: V.font,
                transition: 'all 0.12s',
              }}
              title="Progress form layout"
            >
              Progress
            </button>
            <button
              type="button"
              onClick={() => handleLayoutChange('single-page')}
              style={{
                padding: `${V.s1} ${V.s3}`,
                border: `1px solid ${localLayout === 'single-page' ? V.primary : V.border}`,
                borderRadius: V.r2,
                backgroundColor: localLayout === 'single-page' ? V.primary : V.bgApp,
                color: localLayout === 'single-page' ? '#ffffff' : V.textPrimary,
                cursor: 'pointer',
                fontSize: V.xs,
                fontWeight: localLayout === 'single-page' ? 600 : 400,
                fontFamily: V.font,
                transition: 'all 0.12s',
              }}
              title="Single page layout"
            >
              Single Page
            </button>
            <button
              type="button"
              onClick={() => handleLayoutChange('side-nav')}
              style={{
                padding: `${V.s1} ${V.s3}`,
                border: `1px solid ${localLayout === 'side-nav' ? V.primary : V.border}`,
                borderRadius: V.r2,
                backgroundColor: localLayout === 'side-nav' ? V.primary : V.bgApp,
                color: localLayout === 'side-nav' ? '#ffffff' : V.textPrimary,
                cursor: 'pointer',
                fontSize: V.xs,
                fontWeight: localLayout === 'side-nav' ? 600 : 400,
                fontFamily: V.font,
                transition: 'all 0.12s',
              }}
              title="Side navigation layout"
            >
              Side Nav
            </button>
          </div>

          {/* Device Switcher */}
          <div style={{ display: 'flex', gap: V.s2, borderLeft: `1px solid ${V.border}`, paddingLeft: V.s3 }}>
            {(['web', 'tablet', 'mobile'] as const).map((device) => {
              const Icon = device === 'web' ? Monitor : device === 'tablet' ? Tablet : Smartphone;
              return (
                <button
                  key={device}
                  type="button"
                  onClick={() => setSelectedDevice(device)}
                  style={{
                    padding: `${V.s1} ${V.s2}`,
                    border: `1px solid ${selectedDevice === device ? V.primary : V.border}`,
                    borderRadius: V.r2,
                    backgroundColor: selectedDevice === device ? V.primary : V.bgApp,
                    color: selectedDevice === device ? '#ffffff' : V.textSecondary,
                    cursor: 'pointer',
                    fontSize: V.xs,
                    fontWeight: selectedDevice === device ? 600 : 400,
                    fontFamily: V.font,
                    display: 'flex',
                    alignItems: 'center',
                    gap: V.s1,
                  }}
                >
                  <Icon size={16} />
                </button>
              );
            })}
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            style={{
              border: 'none',
              background: 'transparent',
              color: V.textSecondary,
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 'auto',
            }}
            title="Close preview"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: V.s4,
            backgroundColor: V.bgApp,
          }}
        >
          <div
            style={{
              width: `${deviceWidth}px`,
              maxWidth: '100%',
              backgroundColor: V.bgSurface,
              borderRadius: V.r3,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              overflow: 'hidden',
            }}
          >
            {renderLayout()}
          </div>
        </div>
      </div>
    </>
  );
}
