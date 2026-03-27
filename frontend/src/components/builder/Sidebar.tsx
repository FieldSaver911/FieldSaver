import React from 'react';
import type { Page, Section } from '@fieldsaver/shared';
import { V } from '../../constants/design';
import { SidebarCollapseIcon } from '../icons/SidebarCollapseIcon';

// ─── Drag types ───────────────────────────────────────────────────────────────

interface ColumnDrag {
  cellId: string;
  rowId: string;
  fields: any[];
  span: number;
}

// ─── SectionItem ──────────────────────────────────────────────────────────────

interface SectionItemProps {
  section: Section;
  pageId: string;
  isActive: boolean;
  onSelect: (secId: string) => void;
  onDelete: (secId: string) => void;
  isDragActive?: boolean;
}

function SectionItem({ section, pageId, onSelect, onDelete, isDragActive }: SectionItemProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  const fieldCount = section.rows.reduce(
    (acc, row) => acc + row.cells.reduce((a, c) => a + c.fields.length, 0),
    0,
  );

  return (
    <div
      role="button"
      tabIndex={0}
      data-drop-page-id={pageId}
      data-drop-sec-id={section.id}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(section.id)}
      onKeyDown={(e) => { if (e.key === 'Enter') onSelect(section.id); }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: V.s2,
        padding: `${V.s2} ${V.s3} ${V.s2} ${V.s5}`,
        borderRadius: V.r3,
        backgroundColor: isDragActive
          ? isHovered
            ? 'rgba(0, 115, 234, 0.3)'
            : 'rgba(0, 115, 234, 0.1)'
          : isHovered
          ? V.sidebarHover
          : 'transparent',
        cursor: 'pointer',
        transition: 'background-color 0.1s',
      }}
    >
      {/* Section repeatable indicator */}
      <span
        style={{
          fontSize: '9px',
          color: section.settings.repeatable ? V.primary : V.sidebarMuted,
          flexShrink: 0,
        }}
        title={section.settings.repeatable ? 'Repeatable' : ''}
      >
        {section.settings.repeatable ? '⟳' : '·'}
      </span>

      <span
        style={{
          flex: 1,
          fontSize: V.sm,
          color: V.sidebarMuted,
          fontFamily: V.font,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {section.title}
      </span>

      <span
        style={{
          fontSize: V.xs,
          color: V.sidebarMuted,
          fontFamily: V.font,
          flexShrink: 0,
        }}
      >
        {fieldCount}
      </span>

      {isHovered && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(section.id); }}
          title="Delete section"
          style={{
            border: 'none',
            background: 'transparent',
            color: V.sidebarMuted,
            cursor: 'pointer',
            padding: 0,
            fontSize: '14px',
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}

// ─── PageItem ─────────────────────────────────────────────────────────────────

interface PageItemProps {
  page: Page;
  isActivePage: boolean;
  activeSectionId: string | null;
  onSelectPage: (pageId: string) => void;
  onSelectSection: (secId: string) => void;
  onDeleteSection: (pageId: string, secId: string) => void;
  onAddSection: (pageId: string) => void;
  onDeletePage: (pageId: string) => void;
  onRenamePage: (pageId: string, title: string) => void;
  isOnlyPage: boolean;
  columnDrag?: ColumnDrag | null;
  isExpanded?: boolean;
  onToggleExpand?: (pageId: string) => void;
}

function PageItem({
  page,
  isActivePage,
  activeSectionId,
  onSelectPage,
  onSelectSection,
  onDeleteSection,
  onAddSection,
  onDeletePage,
  onRenamePage,
  isOnlyPage,
  columnDrag,
  isExpanded,
  onToggleExpand,
}: PageItemProps) {
  const expanded = isExpanded ?? isActivePage;
  const [isHovered, setIsHovered] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(page.title);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handlePageClick = () => {
    onSelectPage(page.id);
    onToggleExpand?.(page.id);
  };

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditValue(page.title);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const handleRenameCommit = () => {
    const trimmed = editValue.trim() || page.title;
    onRenamePage(page.id, trimmed);
    setIsEditing(false);
  };

  return (
    <div style={{ marginBottom: V.s1 }}>
      {/* Page row */}
      <div
        role="button"
        tabIndex={0}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handlePageClick}
        onKeyDown={(e) => { if (e.key === 'Enter') handlePageClick(); }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: V.s2,
          padding: `${V.s2} ${V.s3}`,
          borderRadius: V.r3,
          backgroundColor: isActivePage && !expanded ? V.sidebarActive : isHovered ? V.sidebarHover : 'transparent',
          cursor: 'pointer',
          transition: 'background-color 0.1s',
          userSelect: 'none',
        }}
      >
        {/* Expand/collapse arrow */}
        <span
          style={{
            fontSize: '12px',
            color: V.sidebarMuted,
            transition: 'transform 0.15s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
            flexShrink: 0,
            width: '16px',
            height: '16px',
          }}
        >
          ▾
        </span>

        {isEditing ? (
          <input
            ref={inputRef}
            value={editValue}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleRenameCommit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRenameCommit();
              if (e.key === 'Escape') setIsEditing(false);
            }}
            style={{
              flex: 1,
              border: 'none',
              outline: `1px solid ${V.primary}`,
              borderRadius: V.r2,
              padding: `1px ${V.s1}`,
              fontSize: V.sm,
              fontFamily: V.font,
              color: V.sidebarText,
              backgroundColor: 'rgba(255,255,255,0.1)',
            }}
          />
        ) : (
          <span
            style={{
              flex: 1,
              fontSize: V.sm,
              fontWeight: 600,
              color: isActivePage ? V.sidebarText : V.sidebarMuted,
              fontFamily: V.font,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            onDoubleClick={handleStartEdit}
          >
            {page.title}
          </span>
        )}

        <span style={{ fontSize: V.xs, color: V.sidebarMuted, fontFamily: V.font, flexShrink: 0 }}>
          {page.sections.length}
        </span>

        {isHovered && !isOnlyPage && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDeletePage(page.id); }}
            title="Delete page"
            style={{
              border: 'none',
              background: 'transparent',
              color: V.sidebarMuted,
              cursor: 'pointer',
              padding: 0,
              fontSize: '14px',
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Sections list */}
      {expanded && (
        <div>
          {page.sections.map((section) => (
            <SectionItem
              key={section.id}
              section={section}
              pageId={page.id}
              isActive={activeSectionId === section.id}
              onSelect={onSelectSection}
              onDelete={(secId) => onDeleteSection(page.id, secId)}
              isDragActive={!!columnDrag}
            />
          ))}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onAddSection(page.id); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: V.s1,
              padding: `${V.s1} ${V.s3} ${V.s1} ${V.s5}`,
              border: 'none',
              background: 'transparent',
              color: V.sidebarMuted,
              cursor: 'pointer',
              fontSize: V.xs,
              fontFamily: V.font,
              width: '100%',
              textAlign: 'left',
            }}
          >
            + Add Section
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export interface SidebarProps {
  pages: Page[];
  activePId: string | null;
  activeSId: string | null;
  onSelectPage: (pageId: string) => void;
  onSelectSection: (secId: string) => void;
  onAddPage: () => void;
  onDeletePage: (pageId: string) => void;
  onRenamePage: (pageId: string, title: string) => void;
  onAddSection: (pageId: string) => void;
  onDeleteSection: (pageId: string, secId: string) => void;
  columnDrag?: ColumnDrag | null;
  expandedPages?: Set<string>;
  onTogglePageExpand?: (pageId: string) => void;
  onExpandAllPages?: () => void;
  onCollapseAllPages?: () => void;
}

export function Sidebar({
  pages,
  activePId,
  activeSId,
  onSelectPage,
  onSelectSection,
  onAddPage,
  onDeletePage,
  onRenamePage,
  onAddSection,
  onDeleteSection,
  columnDrag,
  expandedPages,
  onTogglePageExpand,
  onExpandAllPages,
  onCollapseAllPages,
}: SidebarProps) {
  const [collapsed, setCollapsed] = React.useState(false);

  if (collapsed) {
    return (
      <div
        style={{
          width: '36px',
          flexShrink: 0,
          backgroundColor: V.sidebarBg,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Expand button */}
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          title="Expand Pages"
          style={{
            width: '36px',
            height: '52px',
            padding: 0,
            border: 'none',
            borderBottom: `1px solid ${V.sidebarBorder}`,
            backgroundColor: 'transparent',
            color: V.sidebarMuted,
            cursor: 'pointer',
            transition: 'all 0.12s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = V.sidebarText; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = V.sidebarMuted; }}
        >
          <SidebarCollapseIcon collapsed size={18} color="currentColor" />
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '180px',
        flexShrink: 0,
        backgroundColor: V.sidebarBg,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          height: '52px',
          padding: `0 ${V.s3}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${V.sidebarBorder}`,
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: V.s2 }}>
          <span
            style={{
              fontSize: V.xs,
              fontWeight: 700,
              color: V.sidebarMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontFamily: V.font,
            }}
          >
            Pages
          </span>
          <button
            type="button"
            onClick={onAddPage}
            title="Add page"
            style={{
              width: '28px',
              height: '28px',
              border: `1.5px solid ${V.sidebarBorder}`,
              background: 'transparent',
              color: V.sidebarMuted,
              cursor: 'pointer',
              borderRadius: V.r2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              lineHeight: 1,
              transition: 'all 0.12s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = V.sidebarText;
              e.currentTarget.style.borderColor = V.sidebarText;
              e.currentTarget.style.backgroundColor = V.sidebarHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = V.sidebarMuted;
              e.currentTarget.style.borderColor = V.sidebarBorder;
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            +
          </button>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          title="Collapse Pages"
          style={{
            border: 'none',
            background: 'transparent',
            color: V.sidebarMuted,
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            lineHeight: 1,
            transition: 'color 0.12s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = V.sidebarText; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = V.sidebarMuted; }}
        >
          <SidebarCollapseIcon collapsed={false} size={16} color="currentColor" />
        </button>
      </div>

      {/* Expand/Collapse All Controls */}
      <div
        style={{
          height: '40px',
          padding: `0 ${V.s2}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0,
          borderBottom: `1px solid ${V.sidebarBorder}`,
          flexShrink: 0,
          backgroundColor: V.sidebarBg,
        }}
      >
        {/* Expand All Pages button */}
        {onExpandAllPages && (
          <button
            type="button"
            onClick={onExpandAllPages}
            title="Expand all pages"
            style={{
              flex: 1,
              border: 'none',
              borderRight: `1px solid ${V.sidebarBorder}`,
              background: 'transparent',
              color: V.sidebarMuted,
              cursor: 'pointer',
              padding: `${V.s2} ${V.s1}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              transition: 'color 0.12s, background-color 0.12s',
              fontSize: V.xs,
              fontFamily: V.font,
              fontWeight: 500,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = V.sidebarText;
              e.currentTarget.style.backgroundColor = V.sidebarHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = V.sidebarMuted;
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Expand All
          </button>
        )}

        {/* Collapse All Pages button */}
        {onCollapseAllPages && (
          <button
            type="button"
            onClick={onCollapseAllPages}
            title="Collapse all pages"
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              color: V.sidebarMuted,
              cursor: 'pointer',
              padding: `${V.s2} ${V.s1}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              transition: 'color 0.12s, background-color 0.12s',
              fontSize: V.xs,
              fontFamily: V.font,
              fontWeight: 500,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = V.sidebarText;
              e.currentTarget.style.backgroundColor = V.sidebarHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = V.sidebarMuted;
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Collapse All
          </button>
        )}
      </div>

      {/* Pages list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: `${V.s2} ${V.s2}` }}>
        {pages.map((page) => (
          <PageItem
            key={page.id}
            page={page}
            isActivePage={activePId === page.id}
            activeSectionId={activeSId}
            onSelectPage={onSelectPage}
            onSelectSection={onSelectSection}
            onDeleteSection={onDeleteSection}
            onAddSection={onAddSection}
            onDeletePage={onDeletePage}
            onRenamePage={onRenamePage}
            isOnlyPage={pages.length === 1}
            columnDrag={columnDrag}
            isExpanded={expandedPages.has(page.id) || (activePId === page.id)}
            onToggleExpand={onTogglePageExpand}
          />
        ))}
      </div>
    </div>
  );
}
