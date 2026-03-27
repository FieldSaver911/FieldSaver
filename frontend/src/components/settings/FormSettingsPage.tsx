import React, { useState } from 'react';
import type { Form, FormSettings, FormStatus } from '@fieldsaver/shared';
import { V } from '../../constants/design';
import { SidebarCollapseIcon } from '../icons/SidebarCollapseIcon';
import {
  SettingsIcon,
  SubmissionIcon,
  ThemeIcon,
  BehaviorIcon,
  AccessIcon,
  IntegrationIcon,
  NotificationIcon,
  DataIcon,
  BackIcon,
  ICON_SIZE,
} from '../icons';
import { BarChart3, FileText, ListOrdered } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormSettingsPageProps {
  form: Form;
  onBack: () => void;
  onSave: (settings: Partial<FormSettings>) => void;
  onStatusChange?: (status: FormStatus) => void;
}

type SettingsSection = 'general' | 'submission' | 'display' | 'behavior' | 'access' | 'integration' | 'notifications' | 'data-export';

// ─── Helper Components ─────────────────────────────────────────────────────────

function SettingsToggle({ checked, onChange, label, hint }: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <div style={{ marginBottom: hint ? V.s2 : 0 }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: V.s2, cursor: 'pointer', fontFamily: V.font }}>
        <div
          onClick={() => onChange(!checked)}
          style={{
            width: '40px',
            height: '22px',
            borderRadius: '11px',
            backgroundColor: checked ? V.primary : V.border,
            position: 'relative',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            display: 'flex',
            alignItems: 'center',
            padding: '2px',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              transition: 'transform 0.2s',
              transform: checked ? 'translateX(18px)' : 'translateX(0)',
            }}
          />
        </div>
        <span style={{ fontSize: V.sm, cursor: 'pointer' }}>{label}</span>
      </label>
      {hint && (
        <p style={{ fontSize: V.xs, color: V.textSecondary, margin: `${V.s1}px 0 0 0`, fontFamily: V.font }}>
          {hint}
        </p>
      )}
    </div>
  );
}

function SegmentedControl<T extends string>({ value, onChange, options }: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string }>;
}) {
  return (
    <div style={{ display: 'flex', gap: V.s1, borderRadius: V.r2, backgroundColor: V.bgApp, padding: V.s1 }}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          style={{
            flex: 1,
            padding: `${V.s2} ${V.s3}`,
            border: 'none',
            borderRadius: V.r2,
            backgroundColor: value === opt.value ? V.primary : 'transparent',
            color: value === opt.value ? '#ffffff' : V.textPrimary,
            cursor: 'pointer',
            fontSize: V.sm,
            fontWeight: value === opt.value ? 600 : 500,
            fontFamily: V.font,
            transition: 'all 0.2s',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function SettingsField({ label, hint, children }: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: V.xs, fontWeight: 700, marginBottom: V.s1, letterSpacing: '0.5px', textTransform: 'uppercase', color: V.textPrimary, fontFamily: V.font }}>
        {label}
      </label>
      {children}
      {hint && (
        <p style={{ fontSize: V.xs, color: V.textSecondary, margin: `${V.s1}px 0 0 0`, fontFamily: V.font }}>
          {hint}
        </p>
      )}
    </div>
  );
}

function FieldGroup({ title, subtitle, children }: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ paddingTop: title ? V.s3 : 0, borderTop: title ? `1px solid ${V.borderLight}` : 'none' }}>
      {title && (
        <h3 style={{ fontSize: V.md, fontWeight: 700, margin: `0 0 ${V.s1}px 0`, fontFamily: V.font }}>
          {title}
        </h3>
      )}
      {subtitle && (
        <p style={{ fontSize: V.sm, color: V.textSecondary, margin: `0 0 ${V.s2}px 0`, fontFamily: V.font }}>
          {subtitle}
        </p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: V.s2 }}>
        {children}
      </div>
    </div>
  );
}

// ─── FormSettingsPage ─────────────────────────────────────────────────────────

export function FormSettingsPage({ form, onBack, onSave, onStatusChange }: FormSettingsPageProps) {
  const [activeSection, setActiveSection] = useState<SettingsSection>('general');
  const [settings, setSettings] = useState<FormSettings>(form.settings);
  const [localStatus, setLocalStatus] = useState<FormStatus>(form.status);
  const [collapsed, setCollapsed] = useState(false);

  const handleSave = () => {
    onSave(settings);
    if (localStatus !== form.status) {
      onStatusChange?.(localStatus);
    }
  };

  const updateSetting = <K extends keyof FormSettings>(key: K, value: FormSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const sections: Array<{
    id: SettingsSection;
    Icon: React.ComponentType<{ size?: number; color?: string }>;
    label: string;
    subtitle: string;
  }> = [
    { id: 'general', Icon: SettingsIcon, label: 'General', subtitle: 'Name, description, slug' },
    { id: 'submission', Icon: SubmissionIcon, label: 'Submission', subtitle: 'Button, success message...' },
    { id: 'display', Icon: ThemeIcon, label: 'Display & Theme', subtitle: 'Progress bar, layout, bran...' },
    { id: 'behavior', Icon: BehaviorIcon, label: 'Behavior', subtitle: 'Drafts, autosave, validation' },
    { id: 'access', Icon: AccessIcon, label: 'Access & Sharing', subtitle: 'Visibility, password, embed' },
    { id: 'integration', Icon: IntegrationIcon, label: 'Integrations', subtitle: 'monday.com boards, web...' },
    { id: 'notifications', Icon: NotificationIcon, label: 'Notifications', subtitle: 'Email alerts, confirmations' },
    { id: 'data-export', Icon: DataIcon, label: 'Data & Export', subtitle: 'Key mapping, libraries, export format' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: V.s3 }}>
            <SettingsField label="Form Name">
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
                  backgroundColor: V.bgApp,
                  opacity: 0.6,
                }}
              />
              <p style={{ fontSize: V.xs, color: V.textSecondary, margin: `${V.s1}px 0 0 0`, fontFamily: V.font }}>
                (Editable in form list)
              </p>
            </SettingsField>

            <SettingsField label="Description">
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
                  backgroundColor: V.bgApp,
                  opacity: 0.6,
                }}
              />
              <p style={{ fontSize: V.xs, color: V.textSecondary, margin: `${V.s1}px 0 0 0`, fontFamily: V.font }}>
                Shown at top of form
              </p>
            </SettingsField>
          </div>
        );

      case 'submission':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: V.s3 }}>
            <FieldGroup title="Submit Button" subtitle="Customize what the respondent sees when submitting.">
              <SettingsField label="Button Label">
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
              </SettingsField>
            </FieldGroup>

            <FieldGroup title="After Submission" subtitle="What happens when the form is submitted successfully.">
              <SettingsField label="Success Message">
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
                  Shown after submission. Leave redirect URL blank to display this.
                </p>
              </SettingsField>

              <SettingsField label="Redirect URL" hint="If set, respondent is redirected here after submission instead of showing the success message.">
                <input
                  type="text"
                  placeholder="https://example.com/thank-you"
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
              </SettingsField>
            </FieldGroup>

            <FieldGroup title="Confirmation Email">
              <SettingsToggle
                checked={settings.confirmationEmail}
                onChange={(v) => updateSetting('confirmationEmail', v)}
                label="Send confirmation email to respondent."
              />
            </FieldGroup>
          </div>
        );

      case 'display':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: V.s3 }}>
            <FieldGroup title="Form Layout" subtitle="Choose how respondents navigate and experience the form.">
              <div style={{ display: 'flex', gap: V.s2, marginBottom: V.s3 }}>
                {(['progress', 'single-page', 'side-nav'] as const).map((layout) => (
                  <button
                    key={layout}
                    type="button"
                    onClick={() => updateSetting('formLayout', layout)}
                    style={{
                      flex: 1,
                      padding: V.s3,
                      border: `2px solid ${settings.formLayout === layout ? V.primary : V.border}`,
                      borderRadius: V.r4,
                      backgroundColor: settings.formLayout === layout ? V.primaryBg : V.bgSurface,
                      color: V.textPrimary,
                      cursor: 'pointer',
                      fontSize: V.sm,
                      fontWeight: 600,
                      fontFamily: V.font,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: V.s2,
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ color: V.textPrimary }}>
                      {layout === 'progress' ? (
                        <BarChart3 size={24} />
                      ) : layout === 'single-page' ? (
                        <FileText size={24} />
                      ) : (
                        <ListOrdered size={24} />
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700 }}>
                        {layout === 'progress' ? 'Progress Form' : layout === 'single-page' ? 'Single Page' : 'Side Navigation'}
                      </div>
                      <div style={{ fontSize: V.xs, color: V.textSecondary, marginTop: V.s1 }}>
                        {layout === 'progress' ? 'Pages shown one at a time with a step progress bar and Prev/Next navigation.'
                          : layout === 'single-page' ? 'All pages shown on one scrollable page. Pages collapse/expand like accordion-style sections.'
                          : 'Left sidebar shows all pages and sections. Respondents jump directly to any section.'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <SettingsToggle
                checked={settings.showProgress}
                onChange={(v) => updateSetting('showProgress', v)}
                label="Show progress bar"
              />

              <SettingsToggle
                checked={settings.showPageNumbers}
                onChange={(v) => updateSetting('showPageNumbers', v)}
                label="Show page numbers (e.g. Page 1 of 3)"
              />
            </FieldGroup>

            <FieldGroup title="Branding">
              <SettingsField label="Primary Color" hint="Used for buttons, progress bar, and accents">
                <div style={{ display: 'flex', gap: V.s2, alignItems: 'center' }}>
                  <input
                    type="color"
                    value={settings.brandColor || '#0073EA'}
                    onChange={(e) => updateSetting('brandColor', e.target.value)}
                    style={{ width: '60px', height: '40px', border: `1px solid ${V.border}`, borderRadius: V.r2, cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={settings.brandColor || '#0073EA'}
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
                  <button
                    type="button"
                    onClick={() => updateSetting('brandColor', '#0073EA')}
                    style={{
                      padding: `${V.s2} ${V.s3}`,
                      border: `1px solid ${V.border}`,
                      borderRadius: V.r2,
                      backgroundColor: 'transparent',
                      color: V.textPrimary,
                      cursor: 'pointer',
                      fontSize: V.sm,
                      fontFamily: V.font,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = V.bgHover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    Reset
                  </button>
                </div>
              </SettingsField>

              <SettingsField label="Logo URL" hint="Optional logo shown in the form header">
                <input
                  type="text"
                  placeholder="https://.../logo.png"
                  value={settings.companyLogoUrl}
                  onChange={(e) => updateSetting('companyLogoUrl', e.target.value)}
                  style={{
                    width: '100%',
                    padding: `${V.s2} ${V.s3}`,
                    border: `1px solid ${V.border}`,
                    borderRadius: V.r2,
                    fontSize: V.sm,
                    fontFamily: V.font,
                  }}
                />
              </SettingsField>
            </FieldGroup>

            <FieldGroup title="Options">
              <SettingsToggle
                checked={settings.compactMode}
                onChange={(v) => updateSetting('compactMode', v)}
                label="Compact mode — reduce field spacing"
              />
            </FieldGroup>
          </div>
        );

      case 'behavior':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: V.s3 }}>
            <FieldGroup title="Drafts & Auto-save">
              <SettingsToggle
                checked={settings.allowDraft}
                onChange={(v) => updateSetting('allowDraft', v)}
                label="Allow respondents to save and resume later"
              />
              <SettingsToggle
                checked={settings.autoSave}
                onChange={(v) => updateSetting('autoSave', v)}
                label="Auto-save responses as respondent types"
              />
            </FieldGroup>

            <FieldGroup title="Validation & Submission">
              <SettingsToggle
                checked={settings.validateOnChange}
                onChange={(v) => updateSetting('validateOnChange', v)}
                label="Validate fields on change (not just on submit)"
              />
              <SettingsToggle
                checked={settings.preventMultipleSubmissions}
                onChange={(v) => updateSetting('preventMultipleSubmissions', v)}
                label="Prevent multiple submissions from same device"
              />
              <SettingsToggle
                checked={settings.requireAllPages}
                onChange={(v) => updateSetting('requireAllPages', v)}
                label="Require all pages to be completed before submitting"
              />
            </FieldGroup>

            <FieldGroup title="Navigation">
              <SettingsToggle
                checked={settings.allowGoBack}
                onChange={(v) => updateSetting('allowGoBack', v)}
                label="Allow respondents to go back to previous pages"
              />
              <SettingsToggle
                checked={settings.randomizePageOrder}
                onChange={(v) => updateSetting('randomizePageOrder', v)}
                label="Randomize page order"
              />
              <SettingsToggle
                checked={settings.randomizeFieldOrder}
                onChange={(v) => updateSetting('randomizeFieldOrder', v)}
                label="Randomize field order within sections"
              />
            </FieldGroup>
          </div>
        );

      case 'access':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: V.s3 }}>
            <FieldGroup title="Visibility">
              <SettingsField label="Form Status">
                <SegmentedControl<FormStatus>
                  value={localStatus}
                  onChange={setLocalStatus}
                  options={[
                    { value: 'draft', label: 'Draft' },
                    { value: 'published', label: 'Active' },
                    { value: 'archived', label: 'Closed' },
                  ]}
                />
                <p style={{ fontSize: V.xs, color: V.textSecondary, margin: `${V.s1}px 0 0 0`, fontFamily: V.font }}>
                  {localStatus === 'published' ? 'Form is active and accepting responses' : localStatus === 'archived' ? 'Form is closed' : 'Form is in draft'}
                </p>
              </SettingsField>

              {localStatus === 'archived' && (
                <SettingsField label="Closed Form Message">
                  <input
                    type="text"
                    value={settings.closedFormMessage}
                    onChange={(e) => updateSetting('closedFormMessage', e.target.value)}
                    placeholder="This form is no longer accepting responses."
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
                    Shown when the form status is Closed
                  </p>
                </SettingsField>
              )}
            </FieldGroup>

            <FieldGroup title="Password Protection">
              <SettingsToggle
                checked={settings.passwordProtected}
                onChange={(v) => updateSetting('passwordProtected', v)}
                label="Require a password to open this form"
              />
            </FieldGroup>

            <FieldGroup title="Embed">
              <SettingsField label="Allowed Domains" hint="Comma-separated domains that may embed this form. Leave blank to allow all.">
                <input
                  type="text"
                  placeholder="example.com, app.example.com"
                  value={settings.allowedDomains}
                  onChange={(e) => updateSetting('allowedDomains', e.target.value)}
                  style={{
                    width: '100%',
                    padding: `${V.s2} ${V.s3}`,
                    border: `1px solid ${V.border}`,
                    borderRadius: V.r2,
                    fontSize: V.sm,
                    fontFamily: V.font,
                  }}
                />
              </SettingsField>
            </FieldGroup>
          </div>
        );

      case 'integration':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: V.s3 }}>
            <FieldGroup title="monday.com Board" subtitle="Connect this form to a monday.com board for automatic item creation on submission.">
              <SettingsField label="Target Board ID" hint="The monday.com board ID where form submissions will create new items">
                <input
                  type="text"
                  placeholder="e.g. 1234567890"
                  value={settings.mondayBoardId}
                  onChange={(e) => updateSetting('mondayBoardId', e.target.value)}
                  style={{
                    width: '100%',
                    padding: `${V.s2} ${V.s3}`,
                    border: `1px solid ${V.border}`,
                    borderRadius: V.r2,
                    fontSize: V.sm,
                    fontFamily: V.font,
                  }}
                />
              </SettingsField>

              <SettingsField label="Target Group ID" hint="Optional: Add new items to a specific group within the board">
                <input
                  type="text"
                  placeholder="e.g. new_group"
                  value={settings.mondayGroupId}
                  onChange={(e) => updateSetting('mondayGroupId', e.target.value)}
                  style={{
                    width: '100%',
                    padding: `${V.s2} ${V.s3}`,
                    border: `1px solid ${V.border}`,
                    borderRadius: V.r2,
                    fontSize: V.sm,
                    fontFamily: V.font,
                  }}
                />
              </SettingsField>

              <SettingsToggle
                checked={settings.mondayCreateLabels}
                onChange={(v) => updateSetting('mondayCreateLabels', v)}
                label="Create dropdown labels if they don't exist on the board"
              />
            </FieldGroup>

            <FieldGroup title="Webhooks" subtitle="POST form submissions to external endpoints.">
              <SettingsField label="Webhook URL" hint="Receives a JSON POST with all field values when the form is submitted">
                <input
                  type="text"
                  placeholder="https://your-app.com/webhook"
                  value={settings.webhookUrl}
                  onChange={(e) => updateSetting('webhookUrl', e.target.value)}
                  style={{
                    width: '100%',
                    padding: `${V.s2} ${V.s3}`,
                    border: `1px solid ${V.border}`,
                    borderRadius: V.r2,
                    fontSize: V.sm,
                    fontFamily: V.font,
                  }}
                />
              </SettingsField>

              <SettingsField label="Authorization Header" hint="Optional Bearer token or API key to include in webhook requests">
                <input
                  type="text"
                  placeholder="Bearer sk-..."
                  value={settings.webhookAuthHeader}
                  onChange={(e) => updateSetting('webhookAuthHeader', e.target.value)}
                  style={{
                    width: '100%',
                    padding: `${V.s2} ${V.s3}`,
                    border: `1px solid ${V.border}`,
                    borderRadius: V.r2,
                    fontSize: V.sm,
                    fontFamily: V.font,
                  }}
                />
              </SettingsField>
            </FieldGroup>
          </div>
        );

      case 'notifications':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: V.s3 }}>
            <FieldGroup title="Submission Alerts" subtitle="Get notified when someone submits this form.">
              <SettingsToggle
                checked={settings.notifyEmails !== ''}
                onChange={(v) => updateSetting('notifyEmails', v ? 'user@example.com' : '')}
                label="Send email notification on each submission"
              />
            </FieldGroup>

            <FieldGroup title="Digest">
              <SettingsToggle
                checked={settings.digestEmail}
                onChange={(v) => updateSetting('digestEmail', v)}
                label="Send a daily digest of all submissions"
              />
            </FieldGroup>
          </div>
        );

      case 'data-export':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: V.s3 }}>
            <FieldGroup title="Export Format" subtitle="How field values are structured in JSON exports and API payloads.">
              <SettingsField label="Date Format" hint="How date fields are stored in exports">
                <SegmentedControl
                  value={settings.dateFormat}
                  onChange={(v) => updateSetting('dateFormat', v)}
                  options={[
                    { value: 'ISO 8601', label: 'ISO 8601' },
                    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                  ]}
                />
              </SettingsField>

              <SettingsField label="Empty Field Handling" hint="What to output when a field has no answer">
                <SegmentedControl
                  value={settings.emptyFieldHandling}
                  onChange={(v) => updateSetting('emptyFieldHandling', v)}
                  options={[
                    { value: 'omit', label: 'Omit key' },
                    { value: 'null', label: 'null' },
                    { value: 'empty-string', label: '""' },
                  ]}
                />
              </SettingsField>
            </FieldGroup>

            <FieldGroup title="NEMSIS / Data Standards">
              <SettingsToggle
                checked={settings.includeXmlNil}
                onChange={(v) => updateSetting('includeXmlNil', v)}
                label="Include xml:nil attributes on nillable fields in XML export"
              />
              <SettingsToggle
                checked={settings.includePertinentNegatives}
                onChange={(v) => updateSetting('includePertinentNegatives', v)}
                label="Include pertinent negative attributes in export payload"
              />
              <SettingsToggle
                checked={settings.includeNotValues}
                onChange={(v) => updateSetting('includeNotValues', v)}
                label="Include NOT value attributes in export payload"
              />
            </FieldGroup>

            <FieldGroup title="Retention">
              <SettingsField label="Response Retention (Days)" hint="Automatically delete submissions after this many days. 0 = keep forever.">
                <input
                  type="number"
                  value={settings.retentionDays}
                  onChange={(e) => updateSetting('retentionDays', parseInt(e.target.value, 10) || 0)}
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
              </SettingsField>
            </FieldGroup>
          </div>
        );

      default:
        return null;
    }
  };

  if (collapsed) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: V.bgApp,
          display: 'flex',
          zIndex: 1000,
          fontFamily: V.font,
        }}
      >
        {/* Collapsed Sidebar */}
        <div
          style={{
            width: '60px',
            backgroundColor: V.bgSurface,
            borderRight: `1px solid ${V.border}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: V.s2,
            gap: V.s2,
            overflow: 'auto',
          }}
        >
          {/* Expand button */}
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            title="Expand sidebar"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              border: 'none',
              borderRadius: V.r2,
              backgroundColor: 'transparent',
              color: V.textSecondary,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = V.bgHover;
              e.currentTarget.style.color = V.textPrimary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = V.textSecondary;
            }}
          >
            <SidebarCollapseIcon collapsed size={18} />
          </button>

          {/* Icon buttons for each section */}
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => {
                setActiveSection(section.id);
                setCollapsed(false);
              }}
              title={section.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                border: 'none',
                borderRadius: V.r2,
                backgroundColor: activeSection === section.id ? V.bgApp : 'transparent',
                color: activeSection === section.id ? V.primary : V.textSecondary,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (activeSection !== section.id) {
                  e.currentTarget.style.backgroundColor = V.bgHover;
                  e.currentTarget.style.color = V.textPrimary;
                }
              }}
              onMouseLeave={(e) => {
                if (activeSection !== section.id) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = V.textSecondary;
                }
              }}
            >
              <section.Icon size={20} />
            </button>
          ))}
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
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = V.bgHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = V.bgSurface;
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
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: V.sm,
                fontWeight: 600,
                fontFamily: V.font,
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#4a47a3';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = V.primary;
              }}
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: V.bgApp,
        display: 'flex',
        zIndex: 1000,
        fontFamily: V.font,
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
        <div style={{ padding: V.s3, borderBottom: `1px solid ${V.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: V.s2 }}>
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
              flex: 1,
            }}
          >
            <BackIcon size={16} />
            Back to Builder
          </button>
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            title="Collapse sidebar"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              border: 'none',
              borderRadius: V.r2,
              backgroundColor: 'transparent',
              color: V.textSecondary,
              cursor: 'pointer',
              transition: 'all 0.2s',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = V.bgHover;
              e.currentTarget.style.color = V.textPrimary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = V.textSecondary;
            }}
          >
            <SidebarCollapseIcon collapsed={false} size={16} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
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
                display: 'flex',
                alignItems: 'flex-start',
                gap: V.s2,
              }}
            >
              <div style={{ color: activeSection === section.id ? V.primary : V.textSecondary, flexShrink: 0, marginTop: V.s1 }}>
                <section.Icon size={18} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: V.sm, fontWeight: 600, color: V.textPrimary }}>
                  {section.label}
                </div>
                <div style={{ fontSize: V.xs, color: V.textSecondary }}>
                  {section.subtitle}
                </div>
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
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = V.textPrimary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = V.textSecondary;
            }}
          >
            <BackIcon size={16} />
            Back to Builder
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
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = V.bgHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = V.bgSurface;
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
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: V.sm,
              fontWeight: 600,
              fontFamily: V.font,
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#4a47a3';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = V.primary;
            }}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
