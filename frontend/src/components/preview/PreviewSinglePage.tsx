import React, { useMemo } from 'react';
import type { Form, Page, Section, Row } from '@fieldsaver/shared';
import { V } from '../../constants/design';
import { LiveField } from './LiveField';
import { RequiredDrawer } from './RequiredDrawer';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PreviewSinglePageProps {
  form: Form;
  deviceWidth: number;
  onClose?: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function countRequiredFields(
  pages: Page[],
  fieldValues: Record<string, unknown>
): { total: number; filled: number } {
  let total = 0;
  let filled = 0;
  pages.forEach((page) => {
    page.sections?.forEach((section) => {
      section.rows?.forEach((row) => {
        row.cells?.forEach((cell) => {
          cell.fields?.forEach((field) => {
            if (field.required) {
              total += 1;
              const v = fieldValues[field.id];
              if (v !== null && v !== undefined && v !== '') {
                filled += 1;
              }
            }
          });
        });
      });
    });
  });
  return { total, filled };
}

function countPageRequiredFields(
  page: Page,
  fieldValues: Record<string, unknown>
): { total: number; filled: number } {
  return countRequiredFields([page], fieldValues);
}

// ─── PageBody ─────────────────────────────────────────────────────────────────

interface PageBodyProps {
  page: Page;
  fieldValues: Record<string, unknown>;
  onFieldChange: (fieldId: string, value: unknown) => void;
  brandColor: string;
  compactMode: boolean;
}

function PageBody({ page, fieldValues, onFieldChange, brandColor: _brandColor, compactMode }: PageBodyProps) {
  const rowGap = compactMode ? V.s2 : V.s3;
  const sectionGap = compactMode ? V.s3 : V.s4;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: sectionGap }}>
      {page.sections?.map((section: Section) => (
        <div key={section.id}>
          {section.title && (
            <div
              style={{
                fontSize: V.sm,
                fontWeight: 700,
                color: V.textSecondary,
                fontFamily: V.font,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: V.s2,
              }}
            >
              {section.title}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: V.s3 }}>
            {section.rows?.map((row: Row) => (
              <div
                key={row.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: row.preset?.cols
                    ?.map((col) => `${(col / 12) * 100}%`)
                    .join(' ') || '1fr',
                  gap: rowGap,
                }}
              >
                {row.cells?.map((cell) => (
                  <div key={cell.id}>
                    {cell.fields?.map((field) => (
                      <LiveField
                        key={field.id}
                        field={field}
                        value={(fieldValues[field.id] as string | null | undefined) ?? null}
                        onChange={(value) => onFieldChange(field.id, value)}
                      />
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── PageAccordionItem ────────────────────────────────────────────────────────

interface PageAccordionItemProps {
  page: Page;
  pageIndex: number;
  isOpen: boolean;
  onToggle: () => void;
  fieldValues: Record<string, unknown>;
  onFieldChange: (fieldId: string, value: unknown) => void;
  brandColor: string;
  compactMode: boolean;
  onRequiredBadgeClick: () => void;
}

function PageAccordionItem({
  page,
  pageIndex,
  isOpen,
  onToggle,
  fieldValues,
  onFieldChange,
  brandColor,
  compactMode,
  onRequiredBadgeClick,
}: PageAccordionItemProps) {
  const [headerHovered, setHeaderHovered] = React.useState(false);
  const [badgeHovered, setBadgeHovered] = React.useState(false);

  const { total: pTotal, filled: pFilled } = countPageRequiredFields(page, fieldValues);

  const requiredDotColor =
    pFilled === pTotal && pTotal > 0
      ? '#4caf50'
      : pFilled > 0
      ? '#ffc107'
      : '#ff5252';

  return (
    <div style={{ borderBottom: `1px solid ${V.borderLight}` }}>
      {/* Accordion Header */}
      <button
        type="button"
        onClick={onToggle}
        onMouseEnter={() => setHeaderHovered(true)}
        onMouseLeave={() => setHeaderHovered(false)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: V.s3,
          padding: `${V.s4} ${V.s5}`,
          background: isOpen ? V.bgSurface : headerHovered ? V.bgHover : V.bgApp,
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'background 0.15s',
          fontFamily: V.font,
        }}
      >
        {/* Page Number Circle */}
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: isOpen ? brandColor : V.bgHover,
            color: isOpen ? '#fff' : V.textSecondary,
            fontSize: V.xs,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.15s',
          }}
        >
          {pageIndex + 1}
        </div>

        {/* Page Title and Description */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: V.md,
              fontWeight: 700,
              color: isOpen ? brandColor : V.textPrimary,
              fontFamily: V.font,
              transition: 'color 0.15s',
            }}
          >
            {page.title || `Page ${pageIndex + 1}`}
          </div>
          {page.description && (
            <div
              style={{
                fontSize: V.xs,
                color: V.textSecondary,
                fontFamily: V.font,
                marginTop: '2px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {page.description}
            </div>
          )}
        </div>

        {/* Required Fields Badge */}
        {pTotal > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRequiredBadgeClick();
            }}
            onMouseEnter={() => setBadgeHovered(true)}
            onMouseLeave={() => setBadgeHovered(false)}
            style={{
              background: badgeHovered ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.05)',
              border: 'none',
              color: V.textSecondary,
              padding: '3px 10px',
              borderRadius: V.rFull,
              cursor: 'pointer',
              fontSize: V.xs,
              fontWeight: 700,
              fontFamily: V.font,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              flexShrink: 0,
              transition: 'background 0.15s',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: requiredDotColor,
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
            {pFilled}/{pTotal} required
          </button>
        )}

        {/* Chevron */}
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: isOpen ? `${brandColor}22` : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isOpen ? brandColor : V.textDisabled,
            fontSize: '12px',
            transition: 'all 0.2s',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            flexShrink: 0,
          }}
        >
          ▼
        </div>
      </button>

      {/* Accordion Body */}
      {isOpen && (
        <div
          style={{
            padding: `0 ${V.s5} ${V.s5}`,
            background: V.bgSurface,
            borderTop: `1px solid ${V.borderLight}`,
          }}
        >
          <div style={{ paddingTop: V.s4 }}>
            <PageBody
              page={page}
              fieldValues={fieldValues}
              onFieldChange={onFieldChange}
              brandColor={brandColor}
              compactMode={compactMode}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PreviewSinglePage ────────────────────────────────────────────────────────

export function PreviewSinglePage({ form, onClose }: PreviewSinglePageProps) {
  const pages = form.data?.pages || [];

  // Settings
  const brandColor = form.settings?.brandColor || V.primary;
  const compactMode = form.settings?.compactMode || false;
  const allowMultiOpen = form.settings?.singlePageAllowMultiOpen || false;
  const defaultExpanded = form.settings?.singlePageDefaultExpanded !== false;

  // Initialise first page open when defaultExpanded is true
  const initialOpen = useMemo<Record<string, boolean>>(() => {
    if (pages.length === 0) return {};
    const firstId = pages[0].id;
    return defaultExpanded ? { [firstId]: true } : {};
  }, []); // eslint-disable-line react-hooks/exhaustive-deps — intentionally run once

  const [openPages, setOpenPages] = React.useState<Record<string, boolean>>(initialOpen);
  const [fieldValues, setFieldValues] = React.useState<Record<string, unknown>>({});
  const [showRequiredDrawer, setShowRequiredDrawer] = React.useState(false);

  const handleFieldChange = (fieldId: string, value: unknown) => {
    setFieldValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const togglePage = (pageId: string) => {
    if (allowMultiOpen) {
      setOpenPages((prev) => ({ ...prev, [pageId]: !prev[pageId] }));
    } else {
      setOpenPages((prev) => ({ [pageId]: !prev[pageId] }));
    }
  };

  const { total: fTotal, filled: fFilled } = useMemo(
    () => countRequiredFields(pages, fieldValues),
    [pages, fieldValues]
  );

  const requiredDotColor =
    fFilled === fTotal && fTotal > 0
      ? '#4caf50'
      : fFilled > 0
      ? '#ffc107'
      : '#ff5252';

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
      {/* ── Branded Header ───────────────────────────────────────────────────── */}
      <div
        style={{
          background: brandColor,
          padding: `${V.s4} ${V.s5}`,
          color: '#fff',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: V.s3,
        }}
      >
        {/* Form name + description */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: V.lg, fontWeight: 700, fontFamily: V.font }}>
            {form.name || 'Untitled Form'}
          </div>
          {form.description && (
            <div
              style={{
                fontSize: V.xs,
                opacity: 0.85,
                marginTop: '2px',
                fontFamily: V.font,
              }}
            >
              {form.description}
            </div>
          )}
        </div>

        {/* Required fields badge */}
        {fTotal > 0 && (
          <RequiredBadge
            filled={fFilled}
            total={fTotal}
            dotColor={requiredDotColor}
            onClick={() => setShowRequiredDrawer(true)}
          />
        )}

        {/* Close button */}
        {onClose && (
          <CloseButton onClick={onClose} />
        )}
      </div>

      {/* ── Accordion Body ───────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', background: V.bgApp }}>
        {pages.length === 0 ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              textAlign: 'center',
              color: V.textSecondary,
              padding: V.s5,
              fontFamily: V.font,
            }}
          >
            No form structure. Add pages and fields in the builder to display content.
          </div>
        ) : (
          <>
            {pages.map((page, pi) => (
              <PageAccordionItem
                key={page.id}
                page={page}
                pageIndex={pi}
                isOpen={!!openPages[page.id]}
                onToggle={() => togglePage(page.id)}
                fieldValues={fieldValues}
                onFieldChange={handleFieldChange}
                brandColor={brandColor}
                compactMode={compactMode}
                onRequiredBadgeClick={() => setShowRequiredDrawer(true)}
              />
            ))}

            {/* Submit button at the bottom of the scrollable area */}
            <div style={{ padding: V.s5 }}>
              <button
                type="button"
                style={{
                  width: '100%',
                  padding: `${V.s3} ${V.s4}`,
                  border: 'none',
                  borderRadius: V.r3,
                  backgroundColor: V.positive,
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: V.md,
                  fontWeight: 700,
                  fontFamily: V.font,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {form.settings?.submitLabel || 'Submit'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── Required Fields Drawer ───────────────────────────────────────────── */}
      {showRequiredDrawer && (
        <RequiredDrawer
          form={form}
          fieldValues={fieldValues as Record<string, any>}
          onFieldChange={handleFieldChange}
          onClose={() => setShowRequiredDrawer(false)}
        />
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface RequiredBadgeProps {
  filled: number;
  total: number;
  dotColor: string;
  onClick: () => void;
}

function RequiredBadge({ filled, total, dotColor, onClick }: RequiredBadgeProps) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.2)',
        border: 'none',
        color: '#fff',
        padding: '3px 10px',
        borderRadius: V.rFull,
        cursor: 'pointer',
        fontSize: V.xs,
        fontWeight: 700,
        fontFamily: V.font,
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        flexShrink: 0,
        transition: 'background 0.15s',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: dotColor,
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
      {filled}/{total} required
    </button>
  );
}

interface CloseButtonProps {
  onClick: () => void;
}

function CloseButton({ onClick }: CloseButtonProps) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title="Close"
      style={{
        background: hovered ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.2)',
        border: 'none',
        color: '#fff',
        width: 28,
        height: 28,
        borderRadius: '50%',
        cursor: 'pointer',
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'background 0.15s',
      }}
    >
      ×
    </button>
  );
}
