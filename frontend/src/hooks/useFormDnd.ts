import { useCallback, useState } from 'react';
import { DragEndEvent, DragOverEvent } from '@dnd-kit/core';
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

  const handleDragStart = useCallback(() => {
    // This is called by DndContext; we set activeItem on dragStart event
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

      const activeData = active.data.current as DragItemData;
      const overData = over.data.current as any;

      // Row drag handling
      if (activeData.kind === 'row' && overData?.accepts === 'row') {
        const fromPageId = activeData.pageId;
        const fromSectionId = activeData.sectionId;
        const fromRowId = activeData.rowId;
        const toPageId = overData.pageId;
        const toSectionId = overData.sectionId;
        const toInsertIndex = overData.insertIndex ?? 0;

        moveRow(fromPageId, fromSectionId, fromRowId, toPageId, toSectionId, toInsertIndex);
      }

      // Section drag handling
      if (activeData.kind === 'section' && overData?.accepts === 'section') {
        const fromPageId = activeData.pageId;
        const fromSectionId = activeData.sectionId;
        const toPageId = overData.pageId;
        const toInsertIndex = overData.insertIndex ?? 0;

        moveSection(fromPageId, fromSectionId, toPageId, toInsertIndex);
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
