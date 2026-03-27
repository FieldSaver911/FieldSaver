import { useState, useMemo } from 'react';
import type { Form, NarrativeTemplate } from '@fieldsaver/shared';
import { V } from '../../constants/design';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NarrativeBuilderProps {
  form: Form;
  onClose: () => void;
  onSave: (templates: NarrativeTemplate[]) => void;
}

interface FieldToken {
  pageTitle: string;
  sectionTitle: string;
  fieldId: string;
  fieldLabel: string;
}

// ─── NarrativeBuilder ─────────────────────────────────────────────────────────

export function NarrativeBuilder({ form, onClose, onSave }: NarrativeBuilderProps) {
  const [templates, setTemplates] = useState<NarrativeTemplate[]>(
    form.data?.narrativeTemplates || []
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    templates[0]?.id || null
  );
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  // Collect all fields for the right panel
  const fieldTokens = useMemo<FieldToken[]>(() => {
    const tokens: FieldToken[] = [];
    const pages = form.data?.pages || [];
    pages.forEach((page) => {
      page.sections?.forEach((section) => {
        section.rows?.forEach((row) => {
          row.cells?.forEach((cell) => {
            cell.fields?.forEach((field) => {
              tokens.push({
                pageTitle: page.title,
                sectionTitle: section.title,
                fieldId: field.id,
                fieldLabel: field.label,
              });
            });
          });
        });
      });
    });
    return tokens;
  }, [form]);

  const handleAddTemplate = () => {
    const newTemplate: NarrativeTemplate = {
      id: `template-${Date.now()}`,
      name: 'New Template',
      content: '',
    };
    setTemplates([...templates, newTemplate]);
    setSelectedTemplateId(newTemplate.id);
  };

  const handleDeleteTemplate = (id: string) => {
    const updated = templates.filter((t) => t.id !== id);
    setTemplates(updated);
    if (selectedTemplateId === id && updated.length > 0) {
      setSelectedTemplateId(updated[0].id);
    } else if (updated.length === 0) {
      setSelectedTemplateId(null);
    }
  };

  const handleStartRename = (id: string, name: string) => {
    setEditingNameId(id);
    setEditingName(name);
  };

  const handleSaveRename = (id: string) => {
    const updated = templates.map((t) =>
      t.id === id ? { ...t, name: editingName } : t
    );
    setTemplates(updated);
    setEditingNameId(null);
  };

  const handleContentChange = (content: string) => {
    if (selectedTemplateId) {
      const updated = templates.map((t) =>
        t.id === selectedTemplateId ? { ...t, content } : t
      );
      setTemplates(updated);
    }
  };

  const handleInsertToken = (fieldId: string, fieldLabel: string) => {
    if (selectedTemplateId) {
      const token = `{{${fieldId}|${fieldLabel}}}`;
      const updated = templates.map((t) =>
        t.id === selectedTemplateId
          ? { ...t, content: t.content + token }
          : t
      );
      setTemplates(updated);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: V.bgApp,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: V.bgSurface,
          borderBottom: `1px solid ${V.border}`,
          padding: V.s3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h1 style={{ fontSize: V.md, fontWeight: 700, margin: 0, fontFamily: V.font }}>
          Narrative Builder
        </h1>
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
        >
          ✕
        </button>
      </div>

      {/* Three-panel body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left: Templates List */}
        <div
          style={{
            width: '280px',
            backgroundColor: V.bgSurface,
            borderRight: `1px solid ${V.border}`,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ padding: V.s3, borderBottom: `1px solid ${V.border}` }}>
            <button
              type="button"
              onClick={handleAddTemplate}
              style={{
                width: '100%',
                padding: `${V.s2} ${V.s3}`,
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
              + Add Template
            </button>
          </div>

          <div style={{ flex: 1, overflow: 'auto' }}>
            {templates.map((template) => (
              <div
                key={template.id}
                style={{
                  padding: V.s2,
                  borderBottom: `1px solid ${V.borderLight}`,
                  backgroundColor: selectedTemplateId === template.id ? V.bgApp : V.bgSurface,
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setSelectedTemplateId(template.id);
                  setEditingNameId(null);
                }}
              >
                {editingNameId === template.id ? (
                  <input
                    autoFocus
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={() => handleSaveRename(template.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveRename(template.id);
                      if (e.key === 'Escape') setEditingNameId(null);
                    }}
                    style={{
                      width: '100%',
                      padding: `${V.s1} ${V.s2}`,
                      border: `1px solid ${V.primary}`,
                      borderRadius: V.r2,
                      fontSize: V.sm,
                      fontFamily: V.font,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: V.s1,
                    }}
                  >
                    <span
                      style={{
                        flex: 1,
                        fontSize: V.sm,
                        fontWeight: 600,
                        color: V.textPrimary,
                        fontFamily: V.font,
                      }}
                      onDoubleClick={() => handleStartRename(template.id, template.name)}
                    >
                      {template.name}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTemplate(template.id);
                      }}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: V.textSecondary,
                        cursor: 'pointer',
                        fontSize: '16px',
                        padding: 0,
                        lineHeight: 1,
                      }}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Center: Editor */}
        {selectedTemplate ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              borderRight: `1px solid ${V.border}`,
              backgroundColor: V.bgApp,
            }}
          >
            <div style={{ padding: V.s3, borderBottom: `1px solid ${V.border}` }}>
              <label
                style={{
                  display: 'block',
                  fontSize: V.xs,
                  fontWeight: 700,
                  color: V.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: V.s2,
                  fontFamily: V.font,
                }}
              >
                Template Content
              </label>
              <textarea
                value={selectedTemplate.content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Enter template text. Use {{fieldId|label}} to insert field tokens."
                style={{
                  width: '100%',
                  height: '120px',
                  padding: V.s2,
                  border: `1px solid ${V.border}`,
                  borderRadius: V.r2,
                  fontSize: V.sm,
                  fontFamily: 'monospace',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Live Preview */}
            <div style={{ padding: V.s3, flex: 1, overflow: 'auto' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: V.xs,
                  fontWeight: 700,
                  color: V.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: V.s2,
                  fontFamily: V.font,
                }}
              >
                Live Preview
              </label>
              <div
                style={{
                  padding: V.s3,
                  backgroundColor: V.bgSurface,
                  borderRadius: V.r2,
                  fontSize: V.sm,
                  color: V.textPrimary,
                  fontFamily: V.font,
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {selectedTemplate.content || '(empty)'}
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: V.textSecondary,
              fontSize: V.sm,
              fontFamily: V.font,
            }}
          >
            Select a template to edit
          </div>
        )}

        {/* Right: Field Tokens Browser */}
        <div
          style={{
            width: '280px',
            backgroundColor: V.bgSurface,
            borderLeft: `1px solid ${V.border}`,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ padding: V.s3, borderBottom: `1px solid ${V.border}` }}>
            <label
              style={{
                display: 'block',
                fontSize: V.xs,
                fontWeight: 700,
                color: V.textSecondary,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontFamily: V.font,
              }}
            >
              Available Fields
            </label>
          </div>

          <div style={{ flex: 1, overflow: 'auto' }}>
            {fieldTokens.map((token, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleInsertToken(token.fieldId, token.fieldLabel)}
                style={{
                  width: '100%',
                  padding: V.s2,
                  border: 'none',
                  backgroundColor: 'transparent',
                  borderBottom: `1px solid ${V.borderLight}`,
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = V.bgApp;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div
                  style={{
                    fontSize: V.xs,
                    color: V.textSecondary,
                    fontFamily: V.font,
                    marginBottom: '2px',
                  }}
                >
                  {token.pageTitle} › {token.sectionTitle}
                </div>
                <div
                  style={{
                    fontSize: V.sm,
                    fontWeight: 600,
                    color: V.textPrimary,
                    fontFamily: V.font,
                  }}
                >
                  {token.fieldLabel}
                </div>
              </button>
            ))}
          </div>
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
          onClick={onClose}
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
          onClick={() => {
            onSave(templates);
            onClose();
          }}
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
          Save Templates
        </button>
      </div>
    </div>
  );
}
