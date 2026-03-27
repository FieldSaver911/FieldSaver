import { useCallback, useState } from 'react';
import { DragStartEvent, DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import { useFormStore } from '../stores/useFormStore';
import type { DragItemData } from '../components/dnd/types';

/**
 * Centralized DnD state and handlers for the form builder.
 * Coordinates all drag-and-drop interactions and calls appropriate store actions.
 * Returns handlers to pass to DndContext and activeItem for DragOverlay.
 */
export function useFormDnd() {
  const [activeItem, setActiveItem] = useState<DragItemData | null>(null);

  // Store access
  const form = useFormStore((state) => state.form);
  const activePId = useFormStore((state) => state.activePId);
  const moveRow = useFormStore((state) => state.moveRow);
  const moveSection = useFormStore((state) => state.moveSection);
  const moveColumn = useFormStore((state) => state.moveColumn);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    // Set active item for DragOverlay preview
    const data = event.active.data.current as DragItemData | undefined;
    if (data) {
      setActiveItem(data);
    }
  }, []);

  const handleDragOver = useCallback((_event: DragOverEvent) => {
    // Future: implement auto-expand of sections/pages on hover
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || !form) {
        setActiveItem(null);
        return;
      }

      const activeData = active.data.current as DragItemData | undefined;
      const overData = over.data.current as any;

      if (!activeData) {
        setActiveItem(null);
        return;
      }

      // Row drag handling — within and across sections
      if (activeData.kind === 'row' && (overData?.kind === 'row' || overData?.accepts === 'row')) {
        const fromPageId = activeData.pageId;
        const fromSectionId = activeData.sectionId;
        const fromRowId = activeData.rowId;
        const toPageId = overData.pageId;
        const toSectionId = overData.sectionId;

        // Same section reorder: use over.id (which is a row ID) to determine insert position
        if (fromSectionId === toSectionId && fromPageId === toPageId) {
          const section = form.data.pages
            .find((p) => p.id === fromPageId)
            ?.sections.find((s) => s.id === fromSectionId);

          if (section && over.id !== fromRowId) {
            const fromIndex = section.rows.findIndex((r) => r.id === fromRowId);
            const toIndex = section.rows.findIndex((r) => r.id === over.id);

            // Only move if indices differ
            if (fromIndex !== toIndex) {
              // Insert at the target row position
              const insertIndex = fromIndex < toIndex ? toIndex : toIndex;
              moveRow(fromPageId, fromSectionId, fromRowId, toPageId, toSectionId, insertIndex);
            }
          }
        } else {
          // Cross-section (or cross-page) move — use insertIndex from drop zone
          const targetSection = form.data.pages
            .find((p) => p.id === toPageId)
            ?.sections.find((s) => s.id === toSectionId);
          const toInsertIndex = overData.insertIndex ?? targetSection?.rows.length ?? 0;
          moveRow(fromPageId, fromSectionId, fromRowId, toPageId, toSectionId, toInsertIndex);
        }
      }

      // Section drag handling
      if (activeData.kind === 'section' && (overData?.kind === 'section' || overData?.accepts === 'section')) {
        const fromPageId = activeData.pageId;
        const fromSectionId = activeData.sectionId;
        const toPageId = overData.pageId;

        // Same page reorder: use over.id (which is a section ID) to determine insert position
        if (fromPageId === toPageId) {
          const page = form.data.pages.find((p) => p.id === fromPageId);

          if (page && over.id !== fromSectionId) {
            const fromIndex = page.sections.findIndex((s) => s.id === fromSectionId);
            const toIndex = page.sections.findIndex((s) => s.id === over.id);

            // Only move if indices differ
            if (fromIndex !== toIndex) {
              // Insert at the target section position
              const insertIndex = fromIndex < toIndex ? toIndex : toIndex;
              moveSection(fromPageId, fromSectionId, toPageId, insertIndex);
            }
          }
        } else {
          // Cross-page move — use insertIndex from drop zone (Page level sentinel)
          const toInsertIndex = overData.insertIndex ?? 0;
          moveSection(fromPageId, fromSectionId, toPageId, toInsertIndex);
        }
      }

      // Column (cell) drag handling
      if (activeData.kind === 'column' && overData?.accepts === 'column') {
        const fromPageId = activeData.pageId;
        const fromSectionId = activeData.sectionId;
        const fromRowId = activeData.rowId;
        const fromCellId = activeData.cellId;
        const toPageId = overData.pageId;
        const toSectionId = overData.sectionId;

        moveColumn(fromPageId, fromSectionId, fromRowId, fromCellId, toPageId, toSectionId);

        // If moving to a different page, switch active page
        if (fromPageId !== toPageId && activePId !== toPageId) {
          useFormStore.getState().setActivePage(toPageId);
        }
      }

      // Field drag handling (within-section field reorder will be handled by Canvas dragState for now)
      // This is a placeholder for future @dnd-kit field drag integration

      setActiveItem(null);
    },
    [form, activePId, moveRow, moveSection, moveColumn]
  );

  const handleDragCancel = useCallback(() => {
    setActiveItem(null);
  }, []);

  return {
    activeItem,
    setActiveItem,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  };
}
