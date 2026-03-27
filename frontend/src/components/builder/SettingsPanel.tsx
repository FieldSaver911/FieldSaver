import React from 'react';
import type { Field, Page, FieldType } from '@fieldsaver/shared';
import { V } from '../../constants/design';
import { FIELD_TYPES } from '../../constants/fieldTypes';
import { useFormStore } from '../../stores/useFormStore';
import { FieldPreview } from './FieldPreview';
import { OptionsEditor } from './OptionsEditor';
import { FieldKeysPanel } from '../library/FieldKeysPanel';

// ─── Tab type ─────────────────────────────────────────────────────────────────

type PanelTab = 'field' | 'page' | 'form';

// ─── Sub-components ──────────────────────────────────────────────────────────

interface LabelledInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
  rows?: number;
}

function LabelledInput({ label, value, onChange, placeholder, type = 'text', multiline = false, rows = 3 }: LabelledInputProps) {
  const [focused, setFocused] = React.useState(false);
  const baseStyle: React.CSSProperties = {
    width: '100%',
    padding: `${V.s2} ${V.s3}`,
    border: `1px solid ${focused ? V.borderFocus : V.border}`,
    borderRadius: V.r3,
    fontSize: V.md,
    fontFamily: V.font,
    color: V.textPrimary,
    backgroundColor: V.bgSurface,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.12s',
    resize: multiline ? 'vertical' : undefined,
  };
  return (
    <div style={{ marginBottom: V.s3 }}>
      <label style={{ display: 'block', fontSize: V.sm, fontWeight: 600, color: V.textSecondary, marginBottom: V.s1, fontFamily: V.font }}>
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          rows={rows}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={baseStyle}
        />
      ) : (
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={baseStyle}
        />
      )}
    </div>
  );
}

interface ToggleRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

function ToggleRow({ label, description, checked, onChange }: ToggleRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: V.s3,
        marginBottom: V.s3,
      }}
    >
      <div>
        <div style={{ fontSize: V.md, fontFamily: V.font, color: V.textPrimary }}>{label}</div>
        {description && (
          <div style={{ fontSize: V.sm, color: V.textSecondary, fontFamily: V.font, marginTop: V.s1 }}>
            {description}
          </div>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-label={label}
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        style={{
          flexShrink: 0,
          width: '36px',
          height: '20px',
          borderRadius: V.rFull,
          border: 'none',
          backgroundColor: checked ? V.primary : V.border,
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
            left: checked ? '19px' : '3px',
            transition: 'left 0.2s',
          }}
        />
      </button>
    </div>
  );
}

interface ExpandableRowProps {
  label: string;
  description?: string;
  value: string;
  onValueChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}

function ExpandableRow({ label, description, value, onValueChange, placeholder, type = 'text' }: ExpandableRowProps) {
  const [expanded, setExpanded] = React.useState(!!value);

  return (
    <div style={{ marginBottom: V.s3 }}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: V.s3,
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          marginBottom: expanded ? V.s2 : 0,
        }}
      >
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: V.md, fontFamily: V.font, color: V.textPrimary }}>{label}</div>
          {description && (
            <div style={{ fontSize: V.sm, color: V.textSecondary, fontFamily: V.font, marginTop: V.s1 }}>
              {description}
            </div>
          )}
        </div>
        <div
          style={{
            flexShrink: 0,
            fontSize: V.sm,
            color: V.textSecondary,
            fontFamily: V.font,
            transition: 'transform 0.2s',
            transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
          }}
        >
          ▶
        </div>
      </button>
      {expanded && (
        <input
          type={type}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: `${V.s2} ${V.s3}`,
            border: `1px solid ${V.border}`,
            borderRadius: V.r2,
            fontSize: V.md,
            fontFamily: V.font,
            color: V.textPrimary,
            backgroundColor: V.bgSurface,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      )}
    </div>
  );
}

// ─── FieldTab ─────────────────────────────────────────────────────────────────

interface FieldTabProps {
  field: Field;
  onUpdate: (patch: Partial<Field>) => void;
}

function FieldTab({ field, onUpdate }: FieldTabProps) {
  const typeOptions = FIELD_TYPES.map((t) => ({ value: t.type, label: t.label }));

  return (
    <div style={{ padding: V.s4 }}>
      <FieldPreview field={field} />

      <LabelledInput
        label="Label"
        value={field.label}
        onChange={(v) => onUpdate({ label: v })}
        placeholder="Field label"
      />

      {/* Type selector */}
      <div style={{ marginBottom: V.s3 }}>
        <label style={{ display: 'block', fontSize: V.sm, fontWeight: 600, color: V.textSecondary, marginBottom: V.s1, fontFamily: V.font }}>
          Field Type
        </label>
        <select
          value={field.type}
          onChange={(e) => onUpdate({ type: e.target.value as FieldType })}
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
          {typeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <ToggleRow
        label="Required"
        description="Respondent must fill this field"
        checked={field.required}
        onChange={(v) => onUpdate({ required: v })}
      />

      {field.type !== 'description' && field.type !== 'divider' && (
        <LabelledInput
          label="Placeholder"
          value={field.placeholder}
          onChange={(v) => onUpdate({ placeholder: v })}
          placeholder="Placeholder text"
        />
      )}

      <LabelledInput
        label="Help text"
        value={field.helpText}
        onChange={(v) => onUpdate({ helpText: v })}
        placeholder="Guidance for respondents"
        multiline
        rows={2}
      />

      {field.type === 'description' && (
        <LabelledInput
          label="Content"
          value={field.settings.content ?? ''}
          onChange={(v) => onUpdate({ settings: { ...field.settings, content: v } })}
          placeholder="Description text"
          multiline
          rows={4}
        />
      )}

      {(field.type === 'text' || field.type === 'long_text') && (
        <LabelledInput
          label="Max length"
          value={String(field.settings.maxLength ?? '')}
          onChange={(v) => onUpdate({ settings: { ...field.settings, maxLength: v } })}
          placeholder="No limit"
          type="number"
        />
      )}

      {field.type === 'number' && (
        <>
          <LabelledInput
            label="Min"
            value={String(field.settings.min ?? '')}
            onChange={(v) => onUpdate({ settings: { ...field.settings, min: v } })}
            placeholder="No minimum"
            type="number"
          />
          <LabelledInput
            label="Max"
            value={String(field.settings.max ?? '')}
            onChange={(v) => onUpdate({ settings: { ...field.settings, max: v } })}
            placeholder="No maximum"
            type="number"
          />
          <LabelledInput
            label="Prefix"
            value={field.settings.prefix ?? ''}
            onChange={(v) => onUpdate({ settings: { ...field.settings, prefix: v } })}
            placeholder="e.g. $"
          />
          <LabelledInput
            label="Suffix"
            value={field.settings.suffix ?? ''}
            onChange={(v) => onUpdate({ settings: { ...field.settings, suffix: v } })}
            placeholder="e.g. kg"
          />
        </>
      )}

      {field.type === 'rating' && (
        <div style={{ marginBottom: V.s3 }}>
          <label style={{ display: 'block', fontSize: V.sm, fontWeight: 600, color: V.textSecondary, marginBottom: V.s1, fontFamily: V.font }}>
            Max Stars
          </label>
          <select
            value={field.settings.max ?? 5}
            onChange={(e) => onUpdate({ settings: { ...field.settings, max: parseInt(e.target.value) } })}
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
            <option value={3}>3 stars</option>
            <option value={5}>5 stars</option>
            <option value={7}>7 stars</option>
            <option value={10}>10 stars</option>
          </select>
        </div>
      )}

      {field.type === 'scale' && (
        <>
          <LabelledInput
            label="Min Value"
            value={String(field.settings.min ?? '')}
            onChange={(v) => onUpdate({ settings: { ...field.settings, min: v } })}
            placeholder="0"
            type="number"
          />
          <LabelledInput
            label="Max Value"
            value={String(field.settings.max ?? '')}
            onChange={(v) => onUpdate({ settings: { ...field.settings, max: v } })}
            placeholder="10"
            type="number"
          />
          <LabelledInput
            label="Min Label"
            value={field.settings.minLabel ?? ''}
            onChange={(v) => onUpdate({ settings: { ...field.settings, minLabel: v } })}
            placeholder="e.g. Not likely"
          />
          <LabelledInput
            label="Max Label"
            value={field.settings.maxLabel ?? ''}
            onChange={(v) => onUpdate({ settings: { ...field.settings, maxLabel: v } })}
            placeholder="e.g. Very likely"
          />
        </>
      )}

      {field.type === 'file' && (
        <>
          <LabelledInput
            label="Max Size (MB)"
            value={String(field.settings.maxSize ?? '')}
            onChange={(v) => onUpdate({ settings: { ...field.settings, maxSize: v ? parseInt(v) : undefined } })}
            placeholder="No limit"
            type="number"
          />
          <LabelledInput
            label="Accept File Types"
            value={field.settings.accept ?? ''}
            onChange={(v) => onUpdate({ settings: { ...field.settings, accept: v } })}
            placeholder="e.g. .pdf,.doc,.txt"
          />
          <ToggleRow
            label="Allow multiple files"
            checked={field.settings.multiple ?? false}
            onChange={(v) => onUpdate({ settings: { ...field.settings, multiple: v } })}
          />
        </>
      )}

      {/* Options for choice fields */}
      {(field.type === 'dropdown' || field.type === 'multi_select' || field.type === 'radio' || field.type === 'checkbox') && (
        <OptionsEditor
          options={field.options}
          onUpdate={(options) => onUpdate({ options })}
        />
      )}

      {/* Validation */}
      <div style={{ borderTop: `1px solid ${V.borderLight}`, paddingTop: V.s3, marginTop: V.s1 }}>
        <div style={{ fontSize: V.sm, fontWeight: 700, color: V.textSecondary, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: V.s3, fontFamily: V.font }}>
          Validation
        </div>
        <LabelledInput
          label="Error Message"
          value={field.validation.message ?? ''}
          onChange={(v) => onUpdate({ validation: { ...field.validation, message: v } })}
          placeholder="Enter custom error message"
          multiline
          rows={2}
        />
      </div>

      {/* Export Keys & Data Attributes */}
      <div style={{ borderTop: `1px solid ${V.borderLight}`, paddingTop: V.s3, marginTop: V.s1 }}>
        <div style={{ fontSize: V.sm, fontWeight: 700, color: V.textSecondary, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: V.s3, fontFamily: V.font }}>
          Export Keys & Data Attributes
        </div>
        <FieldKeysPanel
          field={field}
          onUpdateField={onUpdate}
        />
      </div>

      {/* Behaviour */}
      <div style={{ borderTop: `1px solid ${V.borderLight}`, paddingTop: V.s3, marginTop: V.s1 }}>
        <div style={{ fontSize: V.sm, fontWeight: 700, color: V.textSecondary, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: V.s3, fontFamily: V.font }}>
          Behaviour
        </div>
        <ToggleRow
          label="Enabled"
          description="Field is visible and active in the form"
          checked={field.behaviour.enabled}
          onChange={(v) => onUpdate({ behaviour: { ...field.behaviour, enabled: v } })}
        />
        <ToggleRow
          label="Required"
          description="Respondent must fill this field to submit"
          checked={field.required}
          onChange={(v) => onUpdate({ required: v })}
        />
        <ToggleRow
          label="Hidden"
          description="Hide from respondent entirely — value not collected"
          checked={field.behaviour.hidden}
          onChange={(v) => onUpdate({ behaviour: { ...field.behaviour, hidden: v } })}
        />
        <ToggleRow
          label="Hide Label"
          description="Show input only, without the field label"
          checked={field.behaviour.hideQuestion}
          onChange={(v) => onUpdate({ behaviour: { ...field.behaviour, hideQuestion: v } })}
        />
        <ExpandableRow
          label="Default Value"
          description="Pre-fill with this value — respondent can change it"
          value={field.behaviour.defaultValue}
          onValueChange={(v) => onUpdate({ behaviour: { ...field.behaviour, defaultValue: v } })}
          placeholder="Enter default value"
        />
        <ExpandableRow
          label="Hint Text"
          description="Tooltip shown on hover or focus"
          value={field.behaviour.hintText}
          onValueChange={(v) => onUpdate({ behaviour: { ...field.behaviour, hintText: v } })}
          placeholder="Enter hint text"
        />
        <ToggleRow
          label="Memory Field"
          description="Remember last value this user entered"
          checked={field.behaviour.memoryField}
          onChange={(v) => onUpdate({ behaviour: { ...field.behaviour, memoryField: v } })}
        />
        <ToggleRow
          label="Geo Location"
          description="Capture device coordinates on submit"
          checked={field.behaviour.geoLocation}
          onChange={(v) => onUpdate({ behaviour: { ...field.behaviour, geoLocation: v } })}
        />
        <ToggleRow
          label="Time Stamp"
          description="Auto-record exact time this field was filled"
          checked={field.behaviour.timeStamp}
          onChange={(v) => onUpdate({ behaviour: { ...field.behaviour, timeStamp: v } })}
        />
        <ToggleRow
          label="Exclude from Report"
          description="Omit this field from exports and reports"
          checked={field.behaviour.excludeReport}
          onChange={(v) => onUpdate({ behaviour: { ...field.behaviour, excludeReport: v } })}
        />
        <ExpandableRow
          label="Color"
          description="Accent color override for this field"
          value={field.behaviour.color}
          onValueChange={(v) => onUpdate({ behaviour: { ...field.behaviour, color: v } })}
          placeholder="#0073EA"
          type="color"
        />
      </div>

      {/* Narrative Text */}
      <div style={{ borderTop: `1px solid ${V.borderLight}`, paddingTop: V.s3, marginTop: V.s1 }}>
        <div style={{ fontSize: V.sm, fontWeight: 700, color: V.textSecondary, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: V.s3, fontFamily: V.font }}>
          Narrative Text
        </div>

        {/* Value Text */}
        <div style={{ marginBottom: V.s3 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: V.s2, marginBottom: V.s2 }}>
            <label style={{ fontSize: V.sm, fontWeight: 600, color: V.textSecondary, fontFamily: V.font, flex: 1 }}>
              Value Text
            </label>
            <span
              style={{
                display: 'inline-block',
                padding: `2px ${V.s2}`,
                backgroundColor: V.primary,
                color: V.bgSurface,
                borderRadius: V.r2,
                fontSize: V.xs,
                fontWeight: 600,
                fontFamily: V.font,
              }}
            >
              &lt;value&gt;
            </span>
          </div>
          <textarea
            value={field.narrative.valueText}
            onChange={(e) => onUpdate({ narrative: { ...field.narrative, valueText: e.target.value } })}
            placeholder="e.g. Patient reported &lt;value&gt;."
            rows={3}
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
          <div style={{ fontSize: V.xs, color: V.textSecondary, marginTop: V.s1, fontFamily: V.font, fontStyle: 'italic' }}>
            Used when the field has a real answer
          </div>
        </div>

        {/* Not Value Text */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: V.s2, marginBottom: V.s2 }}>
            <label style={{ fontSize: V.sm, fontWeight: 600, color: V.textSecondary, fontFamily: V.font, flex: 1 }}>
              Not Value Text
            </label>
            <span
              style={{
                display: 'inline-block',
                padding: `2px ${V.s2}`,
                backgroundColor: V.primary,
                color: V.bgSurface,
                borderRadius: V.r2,
                fontSize: V.xs,
                fontWeight: 600,
                fontFamily: V.font,
              }}
            >
              &lt;value&gt;
            </span>
          </div>
          <textarea
            value={field.narrative.notValueText}
            onChange={(e) => onUpdate({ narrative: { ...field.narrative, notValueText: e.target.value } })}
            placeholder="e.g. Pertinent negative: &lt;value&gt;."
            rows={3}
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
          <div style={{ fontSize: V.xs, color: V.textSecondary, marginTop: V.s1, fontFamily: V.font, fontStyle: 'italic' }}>
            Used when NOT value or Pertinent Negative is selected
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PageTab ──────────────────────────────────────────────────────────────────

interface PageTabProps {
  page: Page;
  onUpdate: (patch: Partial<Page>) => void;
}

function PageTab({ page, onUpdate }: PageTabProps) {
  return (
    <div style={{ padding: V.s4 }}>
      <LabelledInput
        label="Page title"
        value={page.title}
        onChange={(v) => onUpdate({ title: v })}
        placeholder="Page title"
      />
      <LabelledInput
        label="Description"
        value={page.description}
        onChange={(v) => onUpdate({ description: v })}
        placeholder="Optional page description"
        multiline
        rows={3}
      />
    </div>
  );
}

// ─── FormTab ─────────────────────────────────────────────────────────────────

function FormTab() {
  const form = useFormStore((s) => s.form);
  const setFormAction = useFormStore((s) => s.setForm);
  const markDirtyAction = useFormStore((s) => s.markDirty);

  if (!form) return null;

  const settings = form.settings;

  const updateSettings = React.useCallback(
    (patch: Partial<typeof settings>) => {
      setFormAction({ ...form, settings: { ...settings, ...patch } });
      markDirtyAction();
    },
    [form, settings, setFormAction, markDirtyAction],
  );

  return (
    <div style={{ padding: V.s4 }}>
      <LabelledInput
        label="Form name"
        value={form.name}
        onChange={(v) => { setFormAction({ ...form, name: v }); markDirtyAction(); }}
        placeholder="Form name"
      />
      <LabelledInput
        label="Description"
        value={form.description}
        onChange={(v) => { setFormAction({ ...form, description: v }); markDirtyAction(); }}
        placeholder="Optional description"
        multiline
        rows={2}
      />
      <div style={{ borderTop: `1px solid ${V.borderLight}`, paddingTop: V.s3, marginTop: V.s1 }}>
        <div style={{ fontSize: V.sm, fontWeight: 700, color: V.textSecondary, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: V.s3, fontFamily: V.font }}>
          Submission
        </div>
        <LabelledInput
          label="Submit button label"
          value={settings.submitLabel}
          onChange={(v) => updateSettings({ submitLabel: v })}
          placeholder="Submit"
        />
        <LabelledInput
          label="Success message"
          value={settings.successMessage}
          onChange={(v) => updateSettings({ successMessage: v })}
          placeholder="Thank you for your submission"
          multiline
          rows={2}
        />
        <LabelledInput
          label="Redirect URL (optional)"
          value={settings.redirectUrl}
          onChange={(v) => updateSettings({ redirectUrl: v })}
          placeholder="https://..."
        />
      </div>
      <div style={{ borderTop: `1px solid ${V.borderLight}`, paddingTop: V.s3, marginTop: V.s1 }}>
        <div style={{ fontSize: V.sm, fontWeight: 700, color: V.textSecondary, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: V.s3, fontFamily: V.font }}>
          Display
        </div>
        <ToggleRow
          label="Show progress bar"
          checked={settings.showProgress}
          onChange={(v) => updateSettings({ showProgress: v })}
        />
        <ToggleRow
          label="Show page numbers"
          checked={settings.showPageNumbers}
          onChange={(v) => updateSettings({ showPageNumbers: v })}
        />
        <ToggleRow
          label="Allow save draft"
          checked={settings.allowDraft}
          onChange={(v) => updateSettings({ allowDraft: v })}
        />
      </div>
    </div>
  );
}

// ─── Main SettingsPanel ───────────────────────────────────────────────────────

export interface SettingsPanelProps {
  selectedField: Field | null;
  activePage: Page | null;
  onUpdateField: (patch: Partial<Field>) => void;
  onUpdatePage: (patch: Partial<Page>) => void;
}

export function SettingsPanel({
  selectedField,
  activePage,
  onUpdateField,
  onUpdatePage,
}: SettingsPanelProps) {
  const [activeTab, setActiveTab] = React.useState<PanelTab>('field');
  const [collapsed, setCollapsed] = React.useState(false);

  // Auto-switch to field tab when a field is selected
  React.useEffect(() => {
    if (selectedField) setActiveTab('field');
  }, [selectedField]);

  const tabs: Array<{ id: PanelTab; label: string; icon: string }> = [
    { id: 'field', label: 'Field', icon: 'Aa' },
    { id: 'page',  label: 'Page',  icon: '📄' },
    { id: 'form',  label: 'Form',  icon: '⚙' },
  ];

  if (collapsed) {
    return (
      <div
        style={{
          width: '36px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: V.bgSurface,
          borderLeft: `1px solid ${V.borderLight}`,
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Icon rail */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            borderBottom: `1px solid ${V.borderLight}`,
            flexShrink: 0,
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setCollapsed(false);
              }}
              title={tab.label}
              style={{
                width: '36px',
                height: '36px',
                padding: 0,
                border: 'none',
                borderLeft: activeTab === tab.id ? `3px solid ${V.primary}` : '3px solid transparent',
                backgroundColor: activeTab === tab.id ? V.bgHighlight : 'transparent',
                fontSize: V.md,
                color: activeTab === tab.id ? V.primary : V.textSecondary,
                cursor: 'pointer',
                transition: 'all 0.12s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {tab.icon}
            </button>
          ))}
        </div>

        {/* Collapse button */}
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          title="Expand"
          style={{
            width: '36px',
            height: '36px',
            padding: 0,
            border: 'none',
            backgroundColor: 'transparent',
            fontSize: V.md,
            color: V.textSecondary,
            cursor: 'pointer',
            marginTop: 'auto',
            transition: 'all 0.12s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ◀
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '280px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: V.bgSurface,
        borderLeft: `1px solid ${V.borderLight}`,
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Tab bar with collapse button */}
      <div
        style={{
          display: 'flex',
          borderBottom: `1px solid ${V.borderLight}`,
          flexShrink: 0,
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: `${V.s3} ${V.s2}`,
              border: 'none',
              borderBottom: activeTab === tab.id ? `2px solid ${V.primary}` : '2px solid transparent',
              backgroundColor: 'transparent',
              fontSize: V.sm,
              fontWeight: activeTab === tab.id ? 700 : 400,
              color: activeTab === tab.id ? V.primary : V.textSecondary,
              cursor: 'pointer',
              fontFamily: V.font,
              transition: 'color 0.12s, border-color 0.12s',
            }}
          >
            {tab.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          title="Collapse"
          style={{
            width: '36px',
            height: 'auto',
            padding: `${V.s3} ${V.s2}`,
            border: 'none',
            borderBottom: '2px solid transparent',
            backgroundColor: 'transparent',
            fontSize: V.md,
            color: V.textSecondary,
            cursor: 'pointer',
            fontFamily: V.font,
            transition: 'color 0.12s',
          }}
        >
          ▶
        </button>
      </div>

      {/* Panel body */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'field' && (
          selectedField ? (
            <FieldTab field={selectedField} onUpdate={onUpdateField} />
          ) : (
            <div
              style={{
                padding: V.s6,
                textAlign: 'center',
                color: V.textDisabled,
                fontSize: V.sm,
                fontFamily: V.font,
              }}
            >
              Select a field to edit its settings
            </div>
          )
        )}
        {activeTab === 'page' && (
          activePage ? (
            <PageTab page={activePage} onUpdate={onUpdatePage} />
          ) : (
            <div style={{ padding: V.s6, textAlign: 'center', color: V.textDisabled, fontSize: V.sm, fontFamily: V.font }}>
              No page selected
            </div>
          )
        )}
        {activeTab === 'form' && <FormTab />}
      </div>
    </div>
  );
}
