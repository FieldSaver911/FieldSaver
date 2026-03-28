import React from 'react';
import type { Page, Section } from '@fieldsaver/shared';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { V } from '../../constants/design';
import { SidebarCollapseIcon } from '../icons/SidebarCollapseIcon';
import { SortableItem } from '../dnd/SortableItem';

// ─── SectionDropSentinel ──────────────────────────────────────────────────────
// Invisible drop zone for cross-page section moves (no visual feedback)

function SectionDropSentinel({ pageId }: { pageId: string }) {
  const { setNodeRef } = useDroppable({
    id: `section-drop-${pageId}`,
    data: { accepts: 'section', pageId, insertIndex: Infinity },
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        height: '0px',
        pointerEvents: 'none',
      }}
    />
  );
}

// ─── Drag types ───────────────────────────────────────────────────────────────

interface ColumnDrag {
  cellId: string;
  rowId: string;
  fields: any[];
  span: number;
}

// ─── AddSectionButton ─────────────────────────────────────────────────────────

function AddSectionButton({ pageId, onAddSection }: {
  pageId: string;
  onAddSection: (pageId: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onAddSection(pageId); }}
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
  );
}

// ─── SectionItem ──────────────────────────────────────────────────────────────

interface SectionItemProps {
  section: Section;
  pageId: string;
  isActive?: boolean;
  onSelect: (secId: string) => void;
  onDelete: (secId: string) => void;
  // Sortable render props
  setSortableRef?: (element: HTMLElement | null) => void;
  sortableAttributes?: Record<string, unknown>;
  sortableListeners?: Record<string, unknown>;
  sortableStyle?: React.CSSProperties;
  sortableIsDragging?: boolean;
  // Visual indentation when nested in flat list
  indented?: boolean;
}

function SectionItem({
  section,
  pageId,
  onSelect,
  onDelete,
  setSortableRef,
  sortableAttributes,
  sortableListeners,
  sortableStyle,
  sortableIsDragging,
  indented,
}: SectionItemProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  const fieldCount = section.rows.reduce(
    (acc, row) => acc + row.cells.reduce((a, c) => a + c.fields.length, 0),
    0,
  );

  return (
    <div
      ref={setSortableRef}
      {...sortableAttributes}
      data-draggable-id={section.id}
      style={{
        marginBottom: V.s1,
        paddingLeft: indented ? V.s4 : 0,
        ...sortableStyle,
      }}
    >
      {/* Section row */}
      <div
        role="button"
        tabIndex={0}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onSelect(section.id)}
        onKeyDown={(e) => { if (e.key === 'Enter') onSelect(section.id); }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: V.s2,
          padding: `${V.s2} ${V.s3}`,
          borderRadius: V.r3,
          backgroundColor: isHovered ? V.sidebarHover : 'transparent',
          border: sortableIsDragging ? `2px solid ${V.primary}` : 'none',
          cursor: 'pointer',
          transition: 'background-color 0.1s, border 0.1s',
          userSelect: 'none',
          opacity: sortableIsDragging ? 0.4 : 1,
        }}
      >
      {/* Drag handle */}
      <span
        {...sortableListeners}
        onClick={(e) => e.stopPropagation()}
        style={{
          fontSize: '14px',
          color: V.sidebarMuted,
          cursor: 'grab',
          flexShrink: 0,
          lineHeight: 1,
          padding: '4px 2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '24px',
          height: '24px',
          borderRadius: '2px',
        }}
        title="Drag to reorder section"
        aria-hidden="true"
      >
        ⠿
      </span>

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
  onDeletePage: (pageId: string) => void;
  onRenamePage: (pageId: string, title: string) => void;
  isOnlyPage: boolean;
  columnDrag?: ColumnDrag | null;
  isExpanded?: boolean;
  onToggleExpand?: (pageId: string) => void;
  // Sortable render props
  setSortableRef?: (element: HTMLElement | null) => void;
  sortableAttributes?: Record<string, unknown>;
  sortableListeners?: Record<string, unknown>;
  sortableStyle?: React.CSSProperties;
  sortableIsDragging?: boolean;
}

function PageItem({
  page,
  isActivePage,
  activeSectionId,
  onSelectPage,
  onSelectSection,
  onDeletePage,
  onRenamePage,
  isOnlyPage,
  columnDrag,
  isExpanded,
  onToggleExpand,
  setSortableRef,
  sortableAttributes,
  sortableListeners,
  sortableStyle,
  sortableIsDragging,
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
    <div
      ref={setSortableRef}
      {...sortableAttributes}
      data-draggable-id={page.id}
      style={{
        marginBottom: V.s1,
        ...sortableStyle,
      }}
    >
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
          opacity: sortableIsDragging ? 0.4 : 1,
        }}
      >
        {/* Drag handle */}
        <span
          {...sortableListeners}
          onClick={(e) => e.stopPropagation()}
          style={{
            fontSize: '14px',
            color: V.sidebarMuted,
            cursor: 'grab',
            flexShrink: 0,
            lineHeight: 1,
            padding: '4px 2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            borderRadius: '2px',
          }}
          title="Drag to reorder page"
          aria-hidden="true"
        >
          ⠿
        </span>

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
        <SortableContext
          items={pages.flatMap((page) => {
            const pageExpanded = expandedPages?.has(page.id) || activePId === page.id;
            return pageExpanded ? [page.id, ...page.sections.map((s) => s.id)] : [page.id];
          })}
          strategy={verticalListSortingStrategy}
        >
          {pages.flatMap((page) => {
            const pageExpanded = expandedPages?.has(page.id) || activePId === page.id;
            const rows: React.ReactNode[] = [];

            // Page row
            rows.push(
              <SortableItem
                key={page.id}
                id={page.id}
                data={{ kind: 'page', pageId: page.id }}
              >
                {(sortableProps) => (
                  <PageItem
                    page={page}
                    isActivePage={activePId === page.id}
                    activeSectionId={activeSId}
                    onSelectPage={onSelectPage}
                    onSelectSection={onSelectSection}
                    onDeletePage={onDeletePage}
                    onRenamePage={onRenamePage}
                    isOnlyPage={pages.length === 1}
                    columnDrag={columnDrag}
                    isExpanded={pageExpanded}
                    onToggleExpand={onTogglePageExpand}
                    setSortableRef={sortableProps.setNodeRef}
                    sortableAttributes={sortableProps.attributes}
                    sortableListeners={sortableProps.listeners}
                    sortableStyle={sortableProps.style}
                    sortableIsDragging={sortableProps.isDragging}
                  />
                )}
              </SortableItem>
            );

            // Section rows (flat, indented)
            if (pageExpanded) {
              page.sections.forEach((section) => {
                rows.push(
                  <SortableItem
                    key={section.id}
                    id={section.id}
                    data={{ kind: 'section', sectionId: section.id, pageId: page.id }}
                  >
                    {(sortableProps) => (
                      <SectionItem
                        section={section}
                        pageId={page.id}
                        isActive={activeSId === section.id}
                        onSelect={onSelectSection}
                        onDelete={(secId) => onDeleteSection(page.id, secId)}
                        setSortableRef={sortableProps.setNodeRef}
                        sortableAttributes={sortableProps.attributes}
                        sortableListeners={sortableProps.listeners}
                        sortableStyle={sortableProps.style}
                        sortableIsDragging={sortableProps.isDragging}
                        indented
                      />
                    )}
                  </SortableItem>
                );
              });

              rows.push(
                <AddSectionButton
                  key={`add-${page.id}`}
                  pageId={page.id}
                  onAddSection={onAddSection}
                />
              );
            }

            // Sentinel always renders so collapsed pages can receive cross-page drops
            rows.push(
              <SectionDropSentinel key={`sentinel-${page.id}`} pageId={page.id} />
            );

            return rows;
          })}
        </SortableContext>
      </div>
    </div>
  );
}
