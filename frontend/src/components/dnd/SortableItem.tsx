import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { DragItemData } from './types';

export interface SortableItemRenderProps {
  setNodeRef: (element: HTMLElement | null) => void;
  attributes: Record<string, any>;
  listeners?: Record<string, any>;
  style: React.CSSProperties;
  isDragging: boolean;
}

export interface SortableItemProps {
  id: string;
  data: DragItemData;
  disabled?: boolean;
  children: (props: SortableItemRenderProps) => React.ReactNode;
}

/**
 * Generic wrapper around useSortable from @dnd-kit/sortable.
 * Used for any reorderable list item: rows, sections, fields, etc.
 * The data prop carries the discriminated union type so handlers can dispatch correctly.
 */
export function SortableItem({ id, data, disabled, children }: SortableItemProps) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } =
    useSortable({ id, data, disabled });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return children({
    setNodeRef,
    attributes,
    listeners: listeners ?? {},
    style,
    isDragging,
  });
}
