import { useState } from 'react';
import type { Form } from '@fieldsaver/shared';
import { V } from '../../constants/design';
import { PreviewProgress } from './PreviewProgress';
import { PreviewSinglePage } from './PreviewSinglePage';
import { PreviewSideNav } from './PreviewSideNav';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PreviewModalProps {
  form: Form;
  onClose: () => void;
}

type DeviceType = 'web' | 'tablet' | 'mobile';

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

  const deviceWidth = DEVICE_WIDTHS[selectedDevice];
  const formLayout = form.settings?.formLayout || 'progress';

  const renderLayout = () => {
    switch (formLayout) {
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
        return <PreviewSinglePage form={form} deviceWidth={deviceWidth} />;
      case 'side-nav':
        return (
          <PreviewSideNav
            form={form}
            currentPageIndex={currentPageIndex}
            onChangePageIndex={setCurrentPageIndex}
            deviceWidth={deviceWidth}
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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: V.bgSurface,
          borderBottom: `1px solid ${V.border}`,
          padding: V.s3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: V.s2 }}>
          <span style={{ fontSize: V.md, fontWeight: 600, fontFamily: V.font }}>
            Preview Form
          </span>
          <span style={{ fontSize: V.xs, color: V.textSecondary, fontFamily: V.font }}>
            Layout: {formLayout === 'progress' ? 'Progress Form' : formLayout === 'single-page' ? 'Single Page' : 'Side Navigation'}
          </span>
        </div>

        {/* Device Switcher */}
        <div style={{ display: 'flex', gap: V.s2 }}>
          {(['web', 'tablet', 'mobile'] as const).map((device) => (
            <button
              key={device}
              type="button"
              onClick={() => setSelectedDevice(device)}
              style={{
                padding: `${V.s1} ${V.s3}`,
                border: `1px solid ${selectedDevice === device ? V.primary : V.border}`,
                borderRadius: V.r2,
                backgroundColor: selectedDevice === device ? V.primary : V.bgApp,
                color: selectedDevice === device ? V.bgSurface : V.textPrimary,
                cursor: 'pointer',
                fontSize: V.xs,
                fontWeight: selectedDevice === device ? 600 : 400,
                fontFamily: V.font,
                textTransform: 'capitalize',
              }}
            >
              {device === 'web' ? '💻' : device === 'tablet' ? '📱' : '📱'} {device}
            </button>
          ))}
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
            fontSize: '20px',
            padding: 0,
            lineHeight: 1,
          }}
          title="Close"
        >
          ✕
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
        onClick={(e) => e.stopPropagation()}
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
  );
}
