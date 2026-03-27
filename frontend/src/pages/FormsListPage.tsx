import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Form, FormStatus } from '@fieldsaver/shared';
import { V } from '../constants/design';
import { formsApi } from '../api/forms';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────

interface StatusBadgeProps {
  status: FormStatus;
}

function StatusBadge({ status }: StatusBadgeProps) {
  const cfg: Record<FormStatus, { bg: string; color: string; label: string }> = {
    draft:     { bg: '#F0F2F8', color: V.textSecondary, label: 'Draft'     },
    published: { bg: V.positiveBg, color: V.positive,  label: 'Published' },
    archived:  { bg: V.warningBg,  color: V.warning,   label: 'Archived'  },
  };
  const { bg, color, label } = cfg[status] ?? cfg.draft;

  return (
    <span
      style={{
        display: 'inline-block',
        padding: `2px ${V.s2}`,
        borderRadius: V.rFull,
        backgroundColor: bg,
        color,
        fontSize: V.xs,
        fontWeight: 600,
        fontFamily: V.font,
        letterSpacing: '0.04em',
        textTransform: 'capitalize',
      }}
    >
      {label}
    </span>
  );
}

// ─── RowActions ───────────────────────────────────────────────────────────────

interface RowActionsProps {
  form: Form;
  onView: () => void;
  onDuplicate: () => void;
  onPublish: () => void;
  onDelete: () => void;
  isLoading: boolean;
}

function RowActions({ form, onView, onDuplicate, onPublish, onDelete, isLoading }: RowActionsProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const btnStyle: React.CSSProperties = {
    padding: `${V.s1} ${V.s3}`,
    border: `1px solid ${V.border}`,
    borderRadius: V.r3,
    backgroundColor: V.bgSurface,
    color: V.textPrimary,
    cursor: isLoading ? 'not-allowed' : 'pointer',
    fontSize: V.sm,
    fontFamily: V.font,
    opacity: isLoading ? 0.6 : 1,
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: V.s2, position: 'relative' }}>
      <button type="button" style={btnStyle} onClick={onView} disabled={isLoading}>
        Edit
      </button>

      {/* More actions menu */}
      <div ref={menuRef} style={{ position: 'relative' }}>
        <button
          type="button"
          style={{ ...btnStyle, padding: `${V.s1} ${V.s2}` }}
          onClick={() => setMenuOpen((v) => !v)}
          disabled={isLoading}
          title="More actions"
        >
          ⋯
        </button>

        {menuOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              zIndex: 100,
              marginTop: V.s1,
              backgroundColor: V.bgSurface,
              border: `1px solid ${V.border}`,
              borderRadius: V.r4,
              boxShadow: V.shadow2,
              minWidth: '160px',
              overflow: 'hidden',
            }}
          >
            {[
              { label: 'Duplicate', action: onDuplicate, icon: '⧉' },
              ...(form.status === 'draft' ? [{ label: 'Publish', action: onPublish, icon: '↗' }] : []),
              { label: 'Delete', action: onDelete, icon: '×', danger: true },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => { item.action(); setMenuOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: V.s2,
                  width: '100%',
                  padding: `${V.s2} ${V.s4}`,
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: (item as { danger?: boolean }).danger ? V.negative : V.textPrimary,
                  cursor: 'pointer',
                  fontSize: V.sm,
                  fontFamily: V.font,
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: '12px' }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── FormRow ──────────────────────────────────────────────────────────────────

interface FormRowProps {
  form: Form;
  onRefresh: () => void;
}

function FormRow({ form, onRefresh }: FormRowProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleView = () => {
    navigate(`/forms/${form.id}`);
  };

  const handleDuplicate = async () => {
    setIsLoading(true);
    try {
      const dup = await formsApi.duplicate(form.id);
      navigate(`/forms/${dup.id}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    setIsLoading(true);
    try {
      await formsApi.publish(form.id);
      onRefresh();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${form.name}"? This cannot be undone.`)) return;
    setIsLoading(true);
    try {
      await formsApi.delete(form.id);
      onRefresh();
    } finally {
      setIsLoading(false);
    }
  };

  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <tr
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: isHovered ? V.bgHover : 'transparent',
        transition: 'background-color 0.1s',
      }}
    >
      <td
        style={{
          padding: `${V.s3} ${V.s4}`,
          borderBottom: `1px solid ${V.borderLight}`,
          fontSize: V.md,
          fontFamily: V.font,
          color: V.textPrimary,
          cursor: 'pointer',
          fontWeight: 500,
        }}
        onClick={handleView}
      >
        {form.name}
      </td>
      <td style={{ padding: `${V.s3} ${V.s4}`, borderBottom: `1px solid ${V.borderLight}` }}>
        <StatusBadge status={form.status} />
      </td>
      <td
        style={{
          padding: `${V.s3} ${V.s4}`,
          borderBottom: `1px solid ${V.borderLight}`,
          fontSize: V.sm,
          color: V.textSecondary,
          fontFamily: V.font,
        }}
      >
        {formatDate(form.updatedAt)}
      </td>
      <td
        style={{
          padding: `${V.s3} ${V.s4}`,
          borderBottom: `1px solid ${V.borderLight}`,
          textAlign: 'right',
        }}
      >
        <RowActions
          form={form}
          onView={handleView}
          onDuplicate={handleDuplicate}
          onPublish={handlePublish}
          onDelete={handleDelete}
          isLoading={isLoading}
        />
      </td>
    </tr>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

interface EmptyStateProps {
  onCreateForm: () => void;
}

function EmptyState({ onCreateForm }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${V.s6} ${V.s4}`,
        gap: V.s4,
      }}
    >
      <div style={{ fontSize: '48px', lineHeight: 1 }}>📋</div>
      <div
        style={{
          fontSize: V.lg,
          fontWeight: 600,
          color: V.textPrimary,
          fontFamily: V.font,
        }}
      >
        No forms yet
      </div>
      <div
        style={{
          fontSize: V.md,
          color: V.textSecondary,
          fontFamily: V.font,
          textAlign: 'center',
          maxWidth: '360px',
        }}
      >
        Create your first form to start collecting EMS data.
      </div>
      <button
        type="button"
        onClick={onCreateForm}
        style={{
          padding: `${V.s3} ${V.s5}`,
          backgroundColor: V.primary,
          color: '#fff',
          border: 'none',
          borderRadius: V.r3,
          fontSize: V.md,
          fontWeight: 600,
          fontFamily: V.font,
          cursor: 'pointer',
        }}
      >
        New Form
      </button>
    </div>
  );
}

// ─── FormsListPage ────────────────────────────────────────────────────────────

export function FormsListPage() {
  const navigate = useNavigate();
  const [forms, setForms] = React.useState<Form[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);

  const loadForms = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await formsApi.list();
      setForms(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load forms');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadForms();
  }, [loadForms]);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const form = await formsApi.create({ name: 'Untitled Form', description: '' });
      navigate(`/forms/${form.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create form');
      setIsCreating(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: V.bgApp,
        fontFamily: V.font,
      }}
    >
      {/* Top bar */}
      <div
        style={{
          backgroundColor: V.bgSurface,
          borderBottom: `1px solid ${V.borderLight}`,
          padding: `${V.s4} ${V.s6}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: V.xl,
              fontWeight: 700,
              color: V.textPrimary,
              margin: 0,
              fontFamily: V.font,
            }}
          >
            Forms
          </h1>
          <p style={{ margin: `${V.s1} 0 0`, fontSize: V.sm, color: V.textSecondary }}>
            Build and manage your EMS data collection forms
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreate}
          disabled={isCreating}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: V.s2,
            padding: `${V.s2} ${V.s4}`,
            backgroundColor: V.primary,
            color: '#fff',
            border: 'none',
            borderRadius: V.r3,
            fontSize: V.md,
            fontWeight: 600,
            fontFamily: V.font,
            cursor: isCreating ? 'not-allowed' : 'pointer',
            opacity: isCreating ? 0.7 : 1,
          }}
        >
          {isCreating ? 'Creating…' : '+ New Form'}
        </button>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: `${V.s5} ${V.s6}` }}>
        {/* Error state */}
        {error && (
          <div
            style={{
              padding: `${V.s3} ${V.s4}`,
              backgroundColor: V.negativeBg,
              border: `1px solid ${V.negative}`,
              borderRadius: V.r3,
              color: V.negative,
              fontSize: V.sm,
              fontFamily: V.font,
              marginBottom: V.s4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {error}
            <button
              type="button"
              onClick={loadForms}
              style={{
                border: 'none',
                background: 'transparent',
                color: V.negative,
                cursor: 'pointer',
                fontSize: V.sm,
                textDecoration: 'underline',
                fontFamily: V.font,
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div
            style={{
              padding: `${V.s6}`,
              textAlign: 'center',
              color: V.textDisabled,
              fontSize: V.md,
              fontFamily: V.font,
            }}
          >
            Loading forms…
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && forms.length === 0 && (
          <EmptyState onCreateForm={handleCreate} />
        )}

        {/* Table */}
        {!isLoading && forms.length > 0 && (
          <div
            style={{
              backgroundColor: V.bgSurface,
              borderRadius: V.r4,
              border: `1px solid ${V.borderLight}`,
              overflow: 'hidden',
              boxShadow: V.shadow1,
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr
                  style={{
                    backgroundColor: V.bgApp,
                    borderBottom: `1px solid ${V.border}`,
                  }}
                >
                  {['Name', 'Status', 'Last Modified', ''].map((col) => (
                    <th
                      key={col}
                      style={{
                        padding: `${V.s3} ${V.s4}`,
                        textAlign: col === '' ? 'right' : 'left',
                        fontSize: V.xs,
                        fontWeight: 700,
                        color: V.textSecondary,
                        fontFamily: V.font,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {forms.map((form) => (
                  <FormRow key={form.id} form={form} onRefresh={loadForms} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
