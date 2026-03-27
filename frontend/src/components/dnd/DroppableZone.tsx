import { useDroppable } from '@dnd-kit/core';
import type { DropTargetData } from './types';

export interface DroppableZoneProps {
  id: string;
  data: DropTargetData;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Wrapper around useDroppable for non-sortable drop targets.
 * Used for sidebar page/section items, trash zones, "copy to library" areas, etc.
 */
export function DroppableZone({
  id,
  data,
  children,
  className,
  style,
}: DroppableZoneProps) {
  const { setNodeRef } = useDroppable({
    id,
    data,
  });

  return (
    <div ref={setNodeRef} className={className} style={style}>
      {children}
    </div>
  );
}
