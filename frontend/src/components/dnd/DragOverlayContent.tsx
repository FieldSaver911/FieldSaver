import type { DragItemData } from './types';
import { V } from '../../constants/design';

export interface DragOverlayContentProps {
  activeItem: DragItemData | null;
  rowLabel?: string;
}

/**
 * Renders the visual ghost that floats under the pointer during drag.
 * Reads the active item's kind and renders an appropriate preview.
 */
export function DragOverlayContent({
  activeItem,
  rowLabel = 'Row',
}: DragOverlayContentProps) {
  if (!activeItem) return null;

  const baseStyle: React.CSSProperties = {
    backgroundColor: V.primary,
    color: V.textPrimary,
    padding: '12px',
    borderRadius: '4px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    width: '140px',
    cursor: 'grabbing',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };


  if (activeItem.kind === 'row') {
    return (
      <div style={baseStyle}>
        <div style={{ fontSize: '12px', fontWeight: 'bold' }}>Dragging Row</div>
        <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.8 }}>{rowLabel}</div>
      </div>
    );
  }

  if (activeItem.kind === 'section') {
    return (
      <div style={baseStyle}>
        <div style={{ fontSize: '12px', fontWeight: 'bold' }}>Moving Section</div>
      </div>
    );
  }

  if (activeItem.kind === 'page') {
    return (
      <div style={baseStyle}>
        <div style={{ fontSize: '12px', fontWeight: 'bold' }}>Moving Page</div>
      </div>
    );
  }

  if (activeItem.kind === 'column') {
    return (
      <div style={baseStyle}>
        <div style={{ fontSize: '12px', fontWeight: 'bold' }}>Moving Column</div>
        <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.8 }}>
          {activeItem.fields.length} field{activeItem.fields.length !== 1 ? 's' : ''}
        </div>
      </div>
    );
  }

  if (activeItem.kind === 'field') {
    return (
      <div style={baseStyle}>
        <div style={{ fontSize: '12px', fontWeight: 'bold' }}>Dragging Field</div>
      </div>
    );
  }

  return null;
}
