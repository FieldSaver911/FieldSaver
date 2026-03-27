import React, { useMemo } from 'react';
import type { Form } from '@fieldsaver/shared';
import { V } from '../../constants/design';
import { LiveField } from './LiveField';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PreviewSideNavProps {
  form: Form;
  currentPageIndex: number;
  onChangePageIndex: (index: number) => void;
  deviceWidth: number;
}

interface NavItem {
  pageId: string;
  pageIndex: number;
  pageTitle: string;
  sectionId: string;
  sectionTitle: string;
}

// ─── PreviewSideNav ──────────────────────────────────────────────────────────

export function PreviewSideNav({
  form,
  currentPageIndex,
  onChangePageIndex,
}: PreviewSideNavProps) {
  const pages = form.data?.pages || [];
  const currentPage = pages[currentPageIndex];

  const [fieldValues, setFieldValues] = React.useState<Record<string, any>>({});
  const [activeSectionId, setActiveSectionId] = React.useState<string | null>(
    currentPage?.sections?.[0]?.id || null
  );

  const handleFieldChange = (fieldId: string, value: any) => {
    setFieldValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const navItems = useMemo<NavItem[]>(() => {
    const items: NavItem[] = [];
    pages.forEach((page, pageIdx) => {
      page.sections?.forEach((section) => {
        items.push({
          pageId: page.id,
          pageIndex: pageIdx,
          pageTitle: page.title,
          sectionId: section.id,
          sectionTitle: section.title,
        });
      });
    });
    return items;
  }, [pages]);

  const currentSection = useMemo(() => {
    if (!currentPage) return null;
    return currentPage.sections?.find((s) => s.id === activeSectionId);
  }, [currentPage, activeSectionId]);

  const handleNavClick = (pageIndex: number, sectionId: string) => {
    onChangePageIndex(pageIndex);
    setActiveSectionId(sectionId);
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Left Navigation Sidebar */}
      <div
        style={{
          width: '280px',
          backgroundColor: V.bgApp,
          borderRight: `1px solid ${V.border}`,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Form Title in Sidebar */}
        <div style={{ padding: V.s3, borderBottom: `1px solid ${V.border}` }}>
          <h2
            style={{
              fontSize: V.sm,
              fontWeight: 700,
              color: V.textPrimary,
              fontFamily: V.font,
              margin: 0,
            }}
          >
            {form.name}
          </h2>
        </div>

        {/* Navigation Items */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {navItems.map((item) => {
            const isActive = item.sectionId === activeSectionId && item.pageIndex === currentPageIndex;
            return (
              <button
                key={`${item.pageId}-${item.sectionId}`}
                type="button"
                onClick={() => handleNavClick(item.pageIndex, item.sectionId)}
                style={{
                  width: '100%',
                  padding: `${V.s2} ${V.s3}`,
                  border: 'none',
                  backgroundColor: isActive ? V.primary : 'transparent',
                  borderLeft: isActive ? `4px solid ${V.primary}` : '4px solid transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = V.bgSurface;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div
                  style={{
                    fontSize: V.xs,
                    fontWeight: 500,
                    color: isActive ? V.bgSurface : V.textSecondary,
                    fontFamily: V.font,
                    marginBottom: '2px',
                  }}
                >
                  {item.pageTitle}
                </div>
                <div
                  style={{
                    fontSize: V.sm,
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? V.bgSurface : V.textPrimary,
                    fontFamily: V.font,
                  }}
                >
                  {item.sectionTitle}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: V.s4 }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            {currentPage && (
              <>
                {/* Page Title */}
                {currentPage.title && (
                  <h1
                    style={{
                      fontSize: V.lg,
                      fontWeight: 700,
                      color: V.textPrimary,
                      fontFamily: V.font,
                      marginBottom: V.s2,
                    }}
                  >
                    {currentPage.title}
                  </h1>
                )}

                {/* Page Description */}
                {currentPage.description && (
                  <p
                    style={{
                      fontSize: V.sm,
                      color: V.textSecondary,
                      fontFamily: V.font,
                      marginBottom: V.s3,
                    }}
                  >
                    {currentPage.description}
                  </p>
                )}

                {/* Section Content */}
                {currentSection && (
                  <div>
                    {/* Section Title */}
                    {currentSection.title && (
                      <h2
                        style={{
                          fontSize: V.md,
                          fontWeight: 600,
                          color: V.textPrimary,
                          fontFamily: V.font,
                          marginBottom: V.s2,
                        }}
                      >
                        {currentSection.title}
                      </h2>
                    )}

                    {/* Section Rows */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: V.s3 }}>
                      {currentSection.rows?.map((row) => (
                        <div
                          key={row.id}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: row.preset?.cols
                              ?.map((col) => `${(col / 12) * 100}%`)
                              .join(' ')
                              || '1fr',
                            gap: V.s3,
                          }}
                        >
                          {row.cells?.map((cell) => (
                            <div key={cell.id}>
                              {cell.fields?.map((field) => (
                                <LiveField
                                  key={field.id}
                                  field={field}
                                  value={fieldValues[field.id] ?? null}
                                  onChange={(value) => handleFieldChange(field.id, value)}
                                />
                              ))}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Submit Footer */}
        <div
          style={{
            padding: V.s3,
            backgroundColor: V.bgApp,
            borderTop: `1px solid ${V.border}`,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            type="button"
            style={{
              padding: `${V.s2} ${V.s4}`,
              border: 'none',
              borderRadius: V.r2,
              backgroundColor: V.primary,
              color: V.bgSurface,
              cursor: 'pointer',
              fontSize: V.sm,
              fontWeight: 600,
              fontFamily: V.font,
            }}
          >
            {form.settings?.submitLabel || 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}
