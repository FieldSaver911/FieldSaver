import React, { useMemo } from 'react';
import type { Form, Field } from '@fieldsaver/shared';
import { X } from 'lucide-react';
import { V } from '../../constants/design';
import { LiveField } from './LiveField';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PreviewSideNavProps {
  form: Form;
  currentPageIndex: number;
  onChangePageIndex: (index: number) => void;
  deviceWidth: number;
  onClose?: () => void;
}

interface RequiredStats {
  total: number;
  filled: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function collectRequiredFields(form: Form): Field[] {
  const fields: Field[] = [];
  for (const page of form.data?.pages ?? []) {
    for (const section of page.sections ?? []) {
      for (const row of section.rows ?? []) {
        for (const cell of row.cells ?? []) {
          for (const field of cell.fields ?? []) {
            if (field.required) fields.push(field);
          }
        }
      }
    }
  }
  return fields;
}

function countStats(
  fields: Field[],
  values: Record<string, unknown>,
): RequiredStats {
  let filled = 0;
  for (const f of fields) {
    const v = values[f.id];
    if (v !== null && v !== undefined && v !== '') filled++;
  }
  return { total: fields.length, filled };
}

function requiredDotColor(total: number, filled: number): string {
  if (total === 0) return '#4caf50';
  if (filled === total) return '#4caf50';
  if (filled > 0) return '#ffc107';
  return '#ff5252';
}

// ─── PreviewSideNav ──────────────────────────────────────────────────────────

export function PreviewSideNav({
  form,
  currentPageIndex,
  onChangePageIndex,
  onClose,
}: PreviewSideNavProps) {
  const pages = form.data?.pages ?? [];
  const brandColor = form.settings?.brandColor || V.primary;
  const compactMode = form.settings?.compactMode || false;
  const rowGap = compactMode ? V.s2 : V.s3;

  const [activePi, setActivePi] = React.useState(currentPageIndex);
  const [activeSectionId, setActiveSectionId] = React.useState<string | null>(
    pages[0]?.sections?.[0]?.id ?? null,
  );
  const [fieldValues, setFieldValues] = React.useState<Record<string, unknown>>({});

  // Keep activePi in sync when parent drives page changes
  React.useEffect(() => {
    setActivePi(currentPageIndex);
  }, [currentPageIndex]);

  // Reset activeSectionId to first section of the new active page
  React.useEffect(() => {
    const firstSec = pages[activePi]?.sections?.[0]?.id ?? null;
    setActiveSectionId(firstSec);
  }, [activePi]); // eslint-disable-line react-hooks/exhaustive-deps

  const activePage = pages[activePi] ?? pages[0];

  const handleFieldChange = (fieldId: string, value: unknown) => {
    setFieldValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const goToSection = (pi: number, secId: string) => {
    setActivePi(pi);
    onChangePageIndex(pi);
    setActiveSectionId(secId);
  };

  // Required field stats for the whole form
  const allRequired = useMemo(() => collectRequiredFields(form), [form]);
  const formStats = useMemo(
    () => countStats(allRequired, fieldValues),
    [allRequired, fieldValues],
  );

  // Active section content
  const activeSection = useMemo(() => {
    if (!activePage) return null;
    return (activePage.sections ?? []).find((s) => s.id === activeSectionId) ?? null;
  }, [activePage, activeSectionId]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        fontFamily: V.font,
        overflow: 'hidden',
      }}
    >
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div
        style={{
          background: brandColor,
          padding: `${V.s3} ${V.s5}`,
          color: '#fff',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: V.s3,
          height: 48,
        }}
      >
        {/* Form name */}
        <div
          style={{
            fontWeight: 700,
            fontSize: V.md,
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {form.name}
        </div>

        {/* Required field count badge */}
        {formStats.total > 0 && (
          <div
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: '#fff',
              padding: '2px 10px',
              borderRadius: V.rFull,
              fontSize: V.xs,
              fontWeight: 700,
              fontFamily: V.font,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
            title={`${formStats.filled} of ${formStats.total} required fields filled`}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: requiredDotColor(formStats.total, formStats.filled),
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
            {formStats.filled}/{formStats.total}
          </div>
        )}

        {/* Close button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: '#fff',
              width: 26,
              height: 26,
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
            }}
            title="Close preview"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* ── Body: sidebar + content ──────────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── Left sidebar ─────────────────────────────────────────────── */}
        <div
          style={{
            width: 210,
            background: V.sidebarBg,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {/* Page + section nav list */}
          <div style={{ overflowY: 'auto', flex: 1, paddingTop: V.s2 }}>
            {pages.map((page, pi) => {
              const isActivePage = pi === activePi;
              const firstSectionId = page.sections?.[0]?.id;

              return (
                <div key={page.id}>
                  {/* Page row */}
                  <PageNavRow
                    label={page.title || `Page ${pi + 1}`}
                    isActive={isActivePage && activeSectionId === firstSectionId}
                    brandColor={brandColor}
                    onClick={() => goToSection(pi, firstSectionId ?? '')}
                  />

                  {/* Section sub-items — only when this page is active and has multiple sections */}
                  {isActivePage &&
                    (page.sections?.length ?? 0) > 1 &&
                    page.sections.map((sec) => (
                      <SectionNavRow
                        key={sec.id}
                        label={sec.title || 'Section'}
                        isActive={activeSectionId === sec.id}
                        onClick={() => goToSection(pi, sec.id)}
                      />
                    ))}
                </div>
              );
            })}
          </div>

          {/* Submit button pinned at sidebar bottom */}
          <div
            style={{
              padding: V.s3,
              borderTop: `1px solid ${V.sidebarBorder}`,
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              style={{
                width: '100%',
                padding: '7px 0',
                background: V.positive,
                border: 'none',
                borderRadius: V.r2,
                color: '#fff',
                fontWeight: 700,
                fontSize: V.sm,
                cursor: 'pointer',
                fontFamily: V.font,
              }}
            >
              {form.settings?.submitLabel || 'Submit'}
            </button>
          </div>
        </div>

        {/* ── Main content area ─────────────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: V.s5,
            background: V.bgApp,
          }}
        >
          {!activePage ? (
            <div
              style={{
                textAlign: 'center',
                color: V.textSecondary,
                fontFamily: V.font,
                padding: V.s5,
              }}
            >
              No form structure. Create pages and sections to display content.
            </div>
          ) : (
            <>
              {/* Render only the active section (or first if none selected) */}
              {activeSection ? (
                <div key={`${activePage.id}-${activeSection.id}`}>
                  {/* Section title — show when page has multiple sections */}
                  {(activePage.sections?.length ?? 0) > 1 && activeSection.title && (
                    <h2
                      style={{
                        fontSize: V.lg,
                        fontWeight: 700,
                        color: V.textPrimary,
                        fontFamily: V.font,
                        marginBottom: V.s4,
                        marginTop: 0,
                      }}
                    >
                      {activeSection.title}
                    </h2>
                  )}

                  {/* Rows */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: rowGap }}>
                    {activeSection.rows?.map((row) => (
                      <div
                        key={row.id}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: row.preset?.cols
                            ?.map((col) => `${(col / 12) * 100}%`)
                            .join(' ') ?? '1fr',
                          gap: rowGap,
                        }}
                      >
                        {row.cells?.map((cell) => (
                          <div key={cell.id}>
                            {cell.fields?.map((field) => (
                              <LiveField
                                key={field.id}
                                field={field}
                                value={(fieldValues[field.id] as string | number | boolean | null) ?? null}
                                onChange={(value) => handleFieldChange(field.id, value)}
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    textAlign: 'center',
                    color: V.textSecondary,
                    fontFamily: V.font,
                    padding: V.s5,
                  }}
                >
                  Select a section from the sidebar to begin.
                </div>
              )}

              {/* Prev / Next page navigation */}
              <div
                style={{
                  display: 'flex',
                  gap: V.s2,
                  marginTop: V.s5,
                  paddingTop: V.s4,
                  borderTop: `1px solid ${V.borderLight}`,
                }}
              >
                {activePi > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const prevPi = activePi - 1;
                      const prevSec = pages[prevPi]?.sections?.[0]?.id ?? '';
                      goToSection(prevPi, prevSec);
                    }}
                    style={navBtnStyle('secondary')}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = V.bgHover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = V.bgSurface;
                    }}
                  >
                    ← {pages[activePi - 1]?.title || 'Prev'}
                  </button>
                )}

                {activePi < pages.length - 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const nextPi = activePi + 1;
                      const nextSec = pages[nextPi]?.sections?.[0]?.id ?? '';
                      goToSection(nextPi, nextSec);
                    }}
                    style={{ ...navBtnStyle('primary', brandColor), marginLeft: 'auto' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.85';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                  >
                    Next: {pages[activePi + 1]?.title || 'Next'} →
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── PageNavRow ───────────────────────────────────────────────────────────────

interface PageNavRowProps {
  label: string;
  isActive: boolean;
  brandColor: string;
  onClick: () => void;
}

function PageNavRow({ label, isActive, brandColor, onClick }: PageNavRowProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: V.s2,
        padding: `${V.s2} ${V.s3}`,
        cursor: 'pointer',
        background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        transition: 'background .1s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.08)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = isActive
          ? 'rgba(255,255,255,0.15)'
          : 'transparent';
      }}
    >
      {/* Active dot */}
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: isActive ? brandColor : 'rgba(255,255,255,0.4)',
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontSize: V.xs,
          fontWeight: 700,
          color: '#fff',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1,
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── SectionNavRow ────────────────────────────────────────────────────────────

interface SectionNavRowProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function SectionNavRow({ label, isActive, onClick }: SectionNavRowProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: V.s2,
        padding: `${V.s1} ${V.s3} ${V.s1} 24px`,
        cursor: 'pointer',
        background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
        transition: 'background .1s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.07)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = isActive
          ? 'rgba(255,255,255,0.12)'
          : 'transparent';
      }}
    >
      <span
        style={{
          fontSize: V.xs,
          color: isActive ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.55)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1,
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Nav button style helper ──────────────────────────────────────────────────

function navBtnStyle(
  variant: 'primary' | 'secondary',
  brandColor?: string,
): React.CSSProperties {
  if (variant === 'secondary') {
    return {
      padding: `${V.s2} ${V.s4}`,
      border: `1px solid ${V.border}`,
      borderRadius: V.r2,
      background: V.bgSurface,
      color: V.textPrimary,
      cursor: 'pointer',
      fontSize: V.sm,
      fontWeight: 600,
      fontFamily: V.font,
      transition: 'background .1s',
    };
  }
  return {
    padding: `${V.s2} ${V.s4}`,
    border: 'none',
    borderRadius: V.r2,
    background: brandColor ?? V.primary,
    color: '#fff',
    cursor: 'pointer',
    fontSize: V.sm,
    fontWeight: 600,
    fontFamily: V.font,
    transition: 'opacity .1s',
  };
}
