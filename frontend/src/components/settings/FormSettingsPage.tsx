import { useState } from 'react';
import type { Form, FormSettings } from '@fieldsaver/shared';
import { V } from '../../constants/design';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormSettingsPageProps {
  form: Form;
  onBack: () => void;
  onSave: (settings: Partial<FormSettings>) => void;
}

type SettingsSection = 'general' | 'submission' | 'display' | 'behavior' | 'access' | 'integration' | 'notifications' | 'data-export';

// ─── FormSettingsPage ─────────────────────────────────────────────────────────

export function FormSettingsPage({ form, onBack, onSave }: FormSettingsPageProps) {
  const [activeSection, setActiveSection] = useState<SettingsSection>('general');
  const [settings, setSettings] = useState<FormSettings>(form.settings);

  const handleSave = () => {
    onSave(settings);
  };

  const updateSetting = <K extends keyof FormSettings>(key: K, value: FormSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const sections: Array<{
    id: SettingsSection;
    icon: string;
    label: string;
    subtitle: string;
  }> = [
    { id: 'general', icon: '⚙️', label: 'General', subtitle: 'Form name and description' },
    { id: 'submission', icon: '📤', label: 'Submission', subtitle: 'After submission behavior' },
    { id: 'display', icon: '🎨', label: 'Display & Theme', subtitle: 'Layout and branding' },
    { id: 'behavior', icon: '⚡', label: 'Behavior', subtitle: 'Validation and navigation' },
    { id: 'access', icon: '🔐', label: 'Access & Sharing', subtitle: 'Visibility and protection' },
    { id: 'integration', icon: '🔗', label: 'Integrations', subtitle: 'monday.com and webhooks' },
    { id: 'notifications', icon: '🔔', label: 'Notifications', subtitle: 'Email alerts' },
    { id: 'data-export', icon: '📊', label: 'Data & Export', subtitle: 'Format and retention' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: V.s3 }}>
            <div>
              <label style={{ display: 'block', fontSize: V.sm, fontWeight: 600, marginBottom: V.s1, fontFamily: V.font }}>
                Form Name
              </label>
              <input
                type="text"
                value={form.name}
                disabled
                style={{
                  width: '100%',
                  padding: `${V.s2} ${V.s3}`,
                  border: `1px solid ${V.border}`,
                  borderRadius: V.r2,
                  fontSize: V.sm,
                  fontFamily: V.font,
                }}
              />
              <p style={{ fontSize: V.xs, color: V.textSecondary, margin: `${V.s1}px 0 0 0`, fontFamily: V.font }}>
                (Editable in form list)
              </p>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: V.sm, fontWeight: 600, marginBottom: V.s1, fontFamily: V.font }}>
                Description
              </label>
              <textarea
                value={form.description}
                disabled
                rows={3}
                style={{
                  width: '100%',
                  padding: `${V.s2} ${V.s3}`,
                  border: `1px solid ${V.border}`,
                  borderRadius: V.r2,
                  fontSize: V.sm,
                  fontFamily: V.font,
                  resize: 'vertical',
                }}
              />
              <p style={{ fontSize: V.xs, color: V.textSecondary, margin: `${V.s1}px 0 0 0`, fontFamily: V.font }}>
                Shown at top of form
              </p>
            </div>
          </div>
        );

      case 'submission':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: V.s3 }}>
            <div>
              <label style={{ display: 'block', fontSize: V.sm, fontWeight: 600, marginBottom: V.s1, fontFamily: V.font }}>
                Submit Button Label
              </label>
              <input
                type="text"
                value={settings.submitLabel}
                onChange={(e) => updateSetting('submitLabel', e.target.value)}
                style={{
                  width: '100%',
                  padding: `${V.s2} ${V.s3}`,
                  border: `1px solid ${V.border}`,
                  borderRadius: V.r2,
                  fontSize: V.sm,
                  fontFamily: V.font,
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: V.sm, fontWeight: 600, marginBottom: V.s1, fontFamily: V.font }}>
                Success Message
              </label>
              <textarea
                value={settings.successMessage}
                onChange={(e) => updateSetting('successMessage', e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: `${V.s2} ${V.s3}`,
                  border: `1px solid ${V.border}`,
                  borderRadius: V.r2,
                  fontSize: V.sm,
                  fontFamily: V.font,
                  resize: 'vertical',
                }}
              />
              <p style={{ fontSize: V.xs, color: V.textSecondary, margin: `${V.s1}px 0 0 0`, fontFamily: V.font }}>
                Shown if no redirect URL is set
              </p>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: V.sm, fontWeight: 600, marginBottom: V.s1, fontFamily: V.font }}>
                Redirect URL (optional)
              </label>
              <input
                type="text"
                placeholder="https://..."
                value={settings.redirectUrl}
                onChange={(e) => updateSetting('redirectUrl', e.target.value)}
                style={{
                  width: '100%',
                  padding: `${V.s2} ${V.s3}`,
                  border: `1px solid ${V.border}`,
                  borderRadius: V.r2,
                  fontSize: V.sm,
                  fontFamily: V.font,
                }}
              />
            </div>
          </div>
        );

      case 'display':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: V.s3 }}>
            <div>
              <label style={{ display: 'block', fontSize: V.sm, fontWeight: 600, marginBottom: V.s2, fontFamily: V.font }}>
                Form Layout
              </label>
              <div style={{ display: 'flex', gap: V.s2 }}>
                {(['progress', 'single-page', 'side-nav'] as const).map((layout) => (
                  <button
                    key={layout}
                    type="button"
                    onClick={() => updateSetting('formLayout', layout)}
                    style={{
                      flex: 1,
                      padding: V.s2,
                      border: `2px solid ${settings.formLayout === layout ? V.primary : V.border}`,
                      borderRadius: V.r2,
                      backgroundColor: settings.formLayout === layout ? V.primary : V.bgApp,
                      color: settings.formLayout === layout ? 'white' : V.textPrimary,
                      cursor: 'pointer',
                      fontSize: V.sm,
                      fontWeight: 600,
                      fontFamily: V.font,
                    }}
                  >
                    {layout === 'progress' ? '📊 Progress Form' : layout === 'single-page' ? '📄 Single Page' : '📑 Side Navigation'}
                  </button>
                ))}
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: V.s2, cursor: 'pointer', fontFamily: V.font }}>
              <input
                type="checkbox"
                checked={settings.showProgress}
                onChange={(e) => updateSetting('showProgress', e.target.checked)}
              />
              <span style={{ fontSize: V.sm }}>Show progress bar</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: V.s2, cursor: 'pointer', fontFamily: V.font }}>
              <input
                type="checkbox"
                checked={settings.showPageNumbers}
                onChange={(e) => updateSetting('showPageNumbers', e.target.checked)}
              />
              <span style={{ fontSize: V.sm }}>Show page numbers</span>
            </label>

            <div>
              <label style={{ display: 'block', fontSize: V.sm, fontWeight: 600, marginBottom: V.s1, fontFamily: V.font }}>
                Primary Color
              </label>
              <div style={{ display: 'flex', gap: V.s2 }}>
                <input
                  type="color"
                  value={settings.brandColor || '#605cd4'}
                  onChange={(e) => updateSetting('brandColor', e.target.value)}
                  style={{ width: '60px', height: '40px', border: `1px solid ${V.border}`, borderRadius: V.r2 }}
                />
                <input
                  type="text"
                  value={settings.brandColor || '#605cd4'}
                  onChange={(e) => updateSetting('brandColor', e.target.value)}
                  style={{
                    flex: 1,
                    padding: `${V.s2} ${V.s3}`,
                    border: `1px solid ${V.border}`,
                    borderRadius: V.r2,
                    fontSize: V.sm,
                    fontFamily: 'monospace',
                  }}
                />
              </div>
            </div>
          </div>
        );

      case 'behavior':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: V.s2 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: V.s2, cursor: 'pointer', fontFamily: V.font }}>
              <input type="checkbox" disabled />
              <span style={{ fontSize: V.sm }}>Allow respondents to save drafts</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: V.s2, cursor: 'pointer', fontFamily: V.font }}>
              <input type="checkbox" disabled />
              <span style={{ fontSize: V.sm }}>Auto-save responses as typing</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: V.s2, cursor: 'pointer', fontFamily: V.font }}>
              <input type="checkbox" disabled />
              <span style={{ fontSize: V.sm }}>Validate fields on change</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: V.s2, cursor: 'pointer', fontFamily: V.font }}>
              <input type="checkbox" disabled />
              <span style={{ fontSize: V.sm }}>Prevent multiple submissions</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: V.s2, cursor: 'pointer', fontFamily: V.font }}>
              <input type="checkbox" disabled />
              <span style={{ fontSize: V.sm }}>Allow respondents to go back</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: V.s2, cursor: 'pointer', fontFamily: V.font }}>
              <input type="checkbox" disabled />
              <span style={{ fontSize: V.sm }}>Randomize page order</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: V.s2, cursor: 'pointer', fontFamily: V.font }}>
              <input type="checkbox" disabled />
              <span style={{ fontSize: V.sm }}>Randomize field order</span>
            </label>
          </div>
        );

      case 'access':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: V.s3 }}>
            <div>
              <label style={{ display: 'block', fontSize: V.sm, fontWeight: 600, marginBottom: V.s1, fontFamily: V.font }}>
                Form Status
              </label>
              <div style={{ display: 'flex', gap: V.s2 }}>
                {(['draft', 'published', 'archived'] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    disabled
                    style={{
                      flex: 1,
                      padding: V.s2,
                      border: `1px solid ${V.border}`,
                      borderRadius: V.r2,
                      backgroundColor: V.bgApp,
                      color: V.textSecondary,
                      cursor: 'not-allowed',
                      fontSize: V.sm,
                      fontWeight: 600,
                      fontFamily: V.font,
                      opacity: 0.5,
                      textTransform: 'capitalize',
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: V.xs, color: V.textSecondary, margin: `${V.s1}px 0 0 0`, fontFamily: V.font }}>
                (Edit in TopBar)
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: V.sm, fontWeight: 600, marginBottom: V.s1, fontFamily: V.font }}>
                Password Protection
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: V.s2, cursor: 'pointer', fontFamily: V.font }}>
                <input type="checkbox" disabled />
                <span style={{ fontSize: V.sm }}>Require password to open</span>
              </label>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: V.sm, fontWeight: 600, marginBottom: V.s1, fontFamily: V.font }}>
                Allowed Embed Domains
              </label>
              <input
                type="text"
                placeholder="example.com, app.example.com"
                disabled
                style={{
                  width: '100%',
                  padding: `${V.s2} ${V.s3}`,
                  border: `1px solid ${V.border}`,
                  borderRadius: V.r2,
                  fontSize: V.sm,
                  fontFamily: V.font,
                  opacity: 0.5,
                }}
              />
            </div>
          </div>
        );

      case 'integration':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: V.s3 }}>
            <div>
              <h3 style={{ fontSize: V.sm, fontWeight: 700, margin: 0, marginBottom: V.s2, fontFamily: V.font }}>
                monday.com Board
              </h3>
              <label style={{ display: 'block', fontSize: V.sm, marginBottom: V.s1, fontFamily: V.font }}>
                Target Board ID
              </label>
              <input
                type="text"
                value={settings.mondayBoardId}
                onChange={(e) => updateSetting('mondayBoardId', e.target.value)}
                placeholder="e.g., 1234567890"
                style={{
                  width: '100%',
                  padding: `${V.s2} ${V.s3}`,
                  border: `1px solid ${V.border}`,
                  borderRadius: V.r2,
                  fontSize: V.sm,
                  fontFamily: V.font,
                }}
              />
            </div>

            <div>
              <h3 style={{ fontSize: V.sm, fontWeight: 700, margin: 0, marginBottom: V.s2, fontFamily: V.font }}>
                Webhooks
              </h3>
              <label style={{ display: 'block', fontSize: V.sm, marginBottom: V.s1, fontFamily: V.font }}>
                Webhook URL
              </label>
              <input
                type="text"
                value={settings.webhookUrl}
                onChange={(e) => updateSetting('webhookUrl', e.target.value)}
                placeholder="https://..."
                style={{
                  width: '100%',
                  padding: `${V.s2} ${V.s3}`,
                  border: `1px solid ${V.border}`,
                  borderRadius: V.r2,
                  fontSize: V.sm,
                  fontFamily: V.font,
                }}
              />
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: V.s2 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: V.s2, cursor: 'pointer', fontFamily: V.font }}>
              <input type="checkbox" disabled />
              <span style={{ fontSize: V.sm }}>Send email on each submission</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: V.s2, cursor: 'pointer', fontFamily: V.font }}>
              <input type="checkbox" disabled />
              <span style={{ fontSize: V.sm }}>Send daily digest</span>
            </label>
          </div>
        );

      case 'data-export':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: V.s3 }}>
            <div>
              <label style={{ display: 'block', fontSize: V.sm, fontWeight: 600, marginBottom: V.s1, fontFamily: V.font }}>
                Date Format
              </label>
              <select
                value={settings.dateFormat}
                onChange={(e) => updateSetting('dateFormat', e.target.value)}
                style={{
                  width: '100%',
                  padding: `${V.s2} ${V.s3}`,
                  border: `1px solid ${V.border}`,
                  borderRadius: V.r2,
                  fontSize: V.sm,
                  fontFamily: V.font,
                }}
              >
                <option value="ISO 8601">ISO 8601</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: V.sm, fontWeight: 600, marginBottom: V.s1, fontFamily: V.font }}>
                Empty Field Handling
              </label>
              <select
                value={settings.emptyFieldHandling}
                onChange={(e) => updateSetting('emptyFieldHandling', e.target.value as any)}
                style={{
                  width: '100%',
                  padding: `${V.s2} ${V.s3}`,
                  border: `1px solid ${V.border}`,
                  borderRadius: V.r2,
                  fontSize: V.sm,
                  fontFamily: V.font,
                }}
              >
                <option value="omit">Omit key</option>
                <option value="null">null</option>
                <option value="empty-string">""</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: V.sm, fontWeight: 600, marginBottom: V.s1, fontFamily: V.font }}>
                Response Retention (days)
              </label>
              <input
                type="number"
                value={settings.retentionDays}
                onChange={(e) => updateSetting('retentionDays', parseInt(e.target.value, 10))}
                min="0"
                style={{
                  width: '100%',
                  padding: `${V.s2} ${V.s3}`,
                  border: `1px solid ${V.border}`,
                  borderRadius: V.r2,
                  fontSize: V.sm,
                  fontFamily: V.font,
                }}
              />
              <p style={{ fontSize: V.xs, color: V.textSecondary, margin: `${V.s1}px 0 0 0`, fontFamily: V.font }}>
                0 = keep forever
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: V.bgApp,
        display: 'flex',
        zIndex: 1000,
      }}
    >
      {/* Left Sidebar */}
      <div
        style={{
          width: '280px',
          backgroundColor: V.bgSurface,
          borderRight: `1px solid ${V.border}`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
        }}
      >
        <div style={{ padding: V.s3, borderBottom: `1px solid ${V.border}` }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: V.s2,
              fontSize: V.sm,
              color: V.textSecondary,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontFamily: V.font,
              marginBottom: V.s2,
            }}
          >
            ← Back to Builder
          </button>
        </div>

        <div style={{ flex: 1 }}>
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              style={{
                width: '100%',
                padding: V.s3,
                border: 'none',
                backgroundColor: activeSection === section.id ? V.bgApp : 'transparent',
                borderLeft: activeSection === section.id ? `4px solid ${V.primary}` : '4px solid transparent',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background-color 0.2s',
              }}
            >
              <div style={{ fontSize: '18px', marginBottom: '4px' }}>{section.icon}</div>
              <div style={{ fontSize: V.sm, fontWeight: 600, color: V.textPrimary, fontFamily: V.font }}>
                {section.label}
              </div>
              <div style={{ fontSize: V.xs, color: V.textSecondary, fontFamily: V.font }}>
                {section.subtitle}
              </div>
            </button>
          ))}
        </div>

        <div style={{ padding: V.s3, borderTop: `1px solid ${V.border}` }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: V.s2,
              fontSize: V.sm,
              color: V.textSecondary,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontFamily: V.font,
              padding: `${V.s2} 0`,
            }}
          >
            ← Back to Builder
          </button>
        </div>
      </div>

      {/* Right Content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: V.s4,
            borderBottom: `1px solid ${V.border}`,
            backgroundColor: V.bgSurface,
          }}
        >
          <h1 style={{ fontSize: V.lg, fontWeight: 700, margin: 0, fontFamily: V.font }}>
            Form Settings
          </h1>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: V.s4,
          }}
        >
          <div style={{ maxWidth: '600px' }}>
            {renderContent()}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            backgroundColor: V.bgSurface,
            borderTop: `1px solid ${V.border}`,
            padding: V.s3,
            display: 'flex',
            gap: V.s2,
            justifyContent: 'flex-end',
          }}
        >
          <button
            type="button"
            onClick={onBack}
            style={{
              padding: `${V.s2} ${V.s4}`,
              border: `1px solid ${V.border}`,
              borderRadius: V.r2,
              backgroundColor: V.bgSurface,
              color: V.textPrimary,
              cursor: 'pointer',
              fontSize: V.sm,
              fontWeight: 600,
              fontFamily: V.font,
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
              borderRadius: V.r2,
              backgroundColor: V.primary,
              color: 'white',
              cursor: 'pointer',
              fontSize: V.sm,
              fontWeight: 600,
              fontFamily: V.font,
            }}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
