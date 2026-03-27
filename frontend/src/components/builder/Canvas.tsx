import React from 'react';
import type { Row, Section, Cell, Field, ColPreset, Page } from '@fieldsaver/shared';
import { V } from '../../constants/design';
import { COL_PRESETS, spanLabel } from '../../constants/fieldTypes';
import { FieldCard } from './FieldCard';
import { LayoutPicker } from './LayoutPicker';

// ─── Drag state (module-level, simple approach) ───────────────────────────────

interface DragState {
  sourceCellId: string;
  sourceIndex: number;
}

interface ColumnDrag {
  cellId: string;
  rowId: string;
  fields: Field[];
  span: number;
}

// ─── Palette drag tracking (module-level signal) ────────────────────────────────
let paletteDragActive = false;
export function setPaletteDragActive(active: boolean): void {
  paletteDragActive = active;
}
const PALETTE_KEY = 'application/x-fieldsaver-palette-type';

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function IconGrid() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="1.5" y="1.5" width="5" height="5" rx="1"/>
      <rect x="9.5" y="1.5" width="5" height="5" rx="1"/>
      <rect x="1.5" y="9.5" width="5" height="5" rx="1"/>
      <rect x="9.5" y="9.5" width="5" height="5" rx="1"/>
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="8" y1="2" x2="8" y2="14"/>
      <line x1="2" y1="8" x2="14" y2="8"/>
    </svg>
  );
}

function IconX({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="3" x2="13" y2="13"/>
      <line x1="13" y1="3" x2="3" y2="13"/>
    </svg>
  );
}

function IconChevronDown({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4 6l4 4 4-4"/>
    </svg>
  );
}

function IconChevronRight({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M6 4l4 4-4 4"/>
    </svg>
  );
}

function IconDragHandle() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="5.5" cy="4" r="1.2"/>
      <circle cx="10.5" cy="4" r="1.2"/>
      <circle cx="5.5" cy="8" r="1.2"/>
      <circle cx="10.5" cy="8" r="1.2"/>
      <circle cx="5.5" cy="12" r="1.2"/>
      <circle cx="10.5" cy="12" r="1.2"/>
    </svg>
  );
}

function IconRepeat() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4h10v3l2-2-2-2v3"/>
      <path d="M13 12H3v-3l-2 2 2 2v-3"/>
    </svg>
  );
}

// ─── FieldDropZone ────────────────────────────────────────────────────────────

interface FieldDropZoneProps {
  cellId: string;
  index: number;
  onDrop: (targetCellId: string, targetIndex: number) => void;
  onPaletteDrop: (cellId: string, index: number, type: Field['type']) => void;
  dragState: DragState | null;
}

function FieldDropZone({ cellId, index, onDrop, onPaletteDrop, dragState }: FieldDropZoneProps) {
  const [isOver, setIsOver] = React.useState(false);

  const isActive = !!dragState || paletteDragActive;
  const isSuppressed = !!dragState &&
    dragState.sourceCellId === cellId &&
    Math.abs(dragState.sourceIndex - index) <= 1;

  if (!isActive || isSuppressed) {
    return <div style={{ height: '4px' }} />;
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsOver(true); }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOver(false);
        const paletteType = e.dataTransfer.getData(PALETTE_KEY) as Field['type'] | '';
        if (paletteType) {
          onPaletteDrop(cellId, index, paletteType);
        } else {
          onDrop(cellId, index);
        }
      }}
      style={{
        height: isOver ? '32px' : '4px',
        borderRadius: V.r2,
        backgroundColor: isOver ? V.bgSelected : 'transparent',
        border: isOver ? `2px dashed ${V.primary}` : '2px solid transparent',
        transition: 'height 0.12s, background-color 0.12s',
        margin: `${V.s1} 0`,
      }}
    />
  );
}

// ─── CellView ─────────────────────────────────────────────────────────────────

interface CellViewProps {
  cell: Cell;
  colSpan: number;
  totalCols: number;
  selectedFieldId: string | null;
  onSelectField: (id: string) => void;
  onDeleteField: (id: string) => void;
  onDropField: (toCellId: string, toIndex: number) => void;
  onPaletteDropToCell: (cellId: string, index: number, type: Field['type']) => void;
  onDeleteCell: () => void;
  dragState: DragState | null;
  onDragStartField: (cellId: string, index: number) => void;
  cellId?: string;
  rowId?: string;
  onColumnDragStart?: (payload: ColumnDrag) => void;
  onColumnDropToSection?: (pageId: string, secId: string) => void;
}

function CellView({
  cell,
  colSpan,
  totalCols,
  selectedFieldId,
  onSelectField,
  onDeleteField,
  onDropField,
  onPaletteDropToCell,
  onDeleteCell,
  dragState,
  onDragStartField,
  cellId,
  rowId,
  onColumnDragStart,
  onColumnDropToSection,
}: CellViewProps) {
  const [isOver, setIsOver] = React.useState(false);
  const [headerHovered, setHeaderHovered] = React.useState(false);

  const handleCellDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleCellDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const paletteType = e.dataTransfer.getData(PALETTE_KEY) as Field['type'] | '';
    if (paletteType) {
      onPaletteDropToCell(cell.id, cell.fields.length, paletteType);
    } else {
      onDropField(cell.id, cell.fields.length);
    }
  };

  const handleColumnDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!rowId || !cellId || !onColumnDragStart) return;

    // Notify parent of drag start
    onColumnDragStart({
      cellId,
      rowId,
      fields: cell.fields,
      span: colSpan,
    });

    // Create ghost element
    const ghost = document.createElement('div');
    ghost.id = '__col_drag_ghost__';
    const fieldCount = cell.fields.length;
    const ghostText = `▣ ${fieldCount} field${fieldCount !== 1 ? 's' : ''} — drop on section`;

    ghost.style.cssText = `
      position: fixed;
      z-index: 9999;
      pointer-events: none;
      background: ${V.primary};
      color: #fff;
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      font-family: ${V.font};
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
      opacity: 0.92;
      transform: translate(-50%, -50%);
      white-space: nowrap;
    `;
    ghost.textContent = ghostText;
    document.body.appendChild(ghost);

    const onMove = (ev: MouseEvent) => {
      ghost.style.left = ev.clientX + 'px';
      ghost.style.top = ev.clientY + 'px';
    };
    onMove(e as unknown as MouseEvent);

    const onUp = (ev: MouseEvent) => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      if (document.getElementById('__col_drag_ghost__')) {
        document.body.removeChild(ghost);
      }

      // Hit-test for sidebar section drop
      const els = document.elementsFromPoint(ev.clientX, ev.clientY);
      let dropped = false;
      for (const el of els) {
        const pgId = (el as HTMLElement).dataset.dropPageId;
        const secId = (el as HTMLElement).dataset.dropSecId;
        if (pgId && secId && !dropped) {
          dropped = true;
          if (onColumnDropToSection) {
            onColumnDropToSection(pgId, secId);
          }
        }
      }
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const isEmpty = cell.fields.length === 0;
  const badgeLabel = `${spanLabel(colSpan)} \u2022 ${colSpan}/${totalCols}`;

  return (
    <div
      onDragOver={handleCellDragOver}
      onDragLeave={() => setIsOver(false)}
      onDrop={handleCellDrop}
      style={{
        minHeight: '130px',
        borderRadius: V.r4,
        backgroundColor: isOver ? V.bgHighlight : V.bgSurface,
        border: `1px solid ${isOver ? V.primary : V.borderLight}`,
        transition: 'border-color 0.12s, background-color 0.12s',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Cell header: pill badge + delete */}
      <div
        onMouseEnter={() => setHeaderHovered(true)}
        onMouseLeave={() => setHeaderHovered(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${V.s2} ${V.s2} ${V.s2} ${V.s2}`,
          borderBottom: `1px solid ${V.borderLight}`,
          backgroundColor: V.bgApp,
          gap: V.s1,
        }}
      >
        {/* Column drag handle — far left */}
        <button
          type="button"
          onMouseDown={handleColumnDragStart}
          title="Drag to move column to another section"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '20px',
            height: '20px',
            border: 'none',
            borderRadius: V.r2,
            backgroundColor: headerHovered ? V.bgHover : 'transparent',
            color: headerHovered ? V.textSecondary : V.textDisabled,
            cursor: 'grab',
            padding: 0,
            flexShrink: 0,
            transition: 'all 0.12s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = V.bgHover;
            (e.currentTarget as HTMLButtonElement).style.color = V.primary;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = headerHovered ? V.bgHover : 'transparent';
            (e.currentTarget as HTMLButtonElement).style.color = headerHovered ? V.textSecondary : V.textDisabled;
          }}
        >
          ⠿
        </button>

        {/* Pill badge */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 8px',
            borderRadius: V.rFull,
            backgroundColor: V.bgSurface,
            border: `1px solid ${V.borderLight}`,
            fontSize: V.xs,
            color: V.textSecondary,
            fontFamily: V.font,
            fontWeight: 500,
            lineHeight: '18px',
            cursor: 'default',
            userSelect: 'none',
          }}
        >
          <span style={{ color: V.textDisabled, display: 'flex', alignItems: 'center' }}>
            <IconGrid />
          </span>
          {badgeLabel}
        </span>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Delete cell button */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDeleteCell(); }}
          title="Remove column"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '20px',
            height: '20px',
            border: 'none',
            borderRadius: V.r2,
            backgroundColor: headerHovered ? V.bgHover : 'transparent',
            color: headerHovered ? V.textSecondary : V.textDisabled,
            cursor: 'pointer',
            padding: 0,
            flexShrink: 0,
            transition: 'all 0.12s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = V.negativeBg;
            (e.currentTarget as HTMLButtonElement).style.color = V.negative;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = headerHovered ? V.bgHover : 'transparent';
            (e.currentTarget as HTMLButtonElement).style.color = headerHovered ? V.textSecondary : V.textDisabled;
          }}
        >
          <IconX size={10} />
        </button>
      </div>

      {/* Cell body */}
      <div
        style={{
          flex: 1,
          padding: V.s3,
          display: 'flex',
          flexDirection: 'column',
          gap: V.s2,
        }}
      >
        {/* Empty drop zone */}
        {isEmpty && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: V.s1,
              border: `1.5px dashed ${V.borderLight}`,
              borderRadius: V.r3,
              padding: `${V.s4} ${V.s3}`,
              backgroundColor: isOver ? V.bgHighlight : 'transparent',
              transition: 'background-color 0.12s',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={V.textDisabled} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            <span style={{ fontSize: V.sm, color: V.textDisabled, fontFamily: V.font }}>
              Drop field here
            </span>
            <span style={{ fontSize: V.xs, color: V.textDisabled, opacity: 0.7, fontFamily: V.font }}>
              + Add field
            </span>
          </div>
        )}

        {/* Fields */}
        {cell.fields.map((field: Field, idx: number) => (
          <React.Fragment key={field.id}>
            <FieldDropZone
              cellId={cell.id}
              index={idx}
              onDrop={onDropField}
              onPaletteDrop={onPaletteDropToCell}
              dragState={dragState}
            />
            <FieldCard
              field={field}
              isSelected={selectedFieldId === field.id}
              onSelect={onSelectField}
              onDelete={onDeleteField}
              index={idx}
              cellId={cell.id}
              onDragStart={onDragStartField}
              onDrop={() => onDropField(cell.id, idx)}
            />
          </React.Fragment>
        ))}
        {cell.fields.length > 0 && (
          <FieldDropZone
            cellId={cell.id}
            index={cell.fields.length}
            onDrop={onDropField}
            onPaletteDrop={onPaletteDropToCell}
            dragState={dragState}
          />
        )}
      </div>
    </div>
  );
}

// ─── RowView ──────────────────────────────────────────────────────────────────

interface RowViewProps {
  row: Row;
  selectedFieldId: string | null;
  onSelectField: (id: string) => void;
  onDeleteField: (id: string) => void;
  onDeleteRow: (rowId: string) => void;
  onUpdateRow: (rowId: string, patch: Partial<Row>) => void;
  onAddFieldToCell: (type: Field['type'], cellId: string, insertBeforeIndex: number) => void;
  dragState: DragState | null;
  onCanvasDragStart: (cellId: string, index: number) => void;
  onCanvasDrop: (toCellId: string, toIndex: number) => void;
  onCanvasDragEnd: () => void;
  onColumnDragStart?: (payload: ColumnDrag) => void;
  onColumnDropToSection?: (pageId: string, secId: string) => void;
}

function RowView({
  row,
  selectedFieldId,
  onSelectField,
  onDeleteField,
  onDeleteRow,
  onUpdateRow,
  onAddFieldToCell,
  dragState,
  onCanvasDragStart,
  onCanvasDrop,
  onCanvasDragEnd,
  onColumnDragStart,
  onColumnDropToSection,
}: RowViewProps) {
  const [showLayoutPicker, setShowLayoutPicker] = React.useState(false);
  const [addColHovered, setAddColHovered] = React.useState(false);
  const [delRowHovered, setDelRowHovered] = React.useState(false);
  const [buttonPosition, setButtonPosition] = React.useState<{ top: number; left: number; width: number } | null>(null);

  // Resize state and refs
  const rowRef = React.useRef<HTMLDivElement>(null);
  const layoutButtonRef = React.useRef<HTMLButtonElement>(null);
  const draggingRef = React.useRef<{ handleIdx: number; startX: number; startCols: number[] } | null>(null);
  const finalColsRef = React.useRef<number[]>(row.preset.cols);
  const [liveCols, setLiveCols] = React.useState<number[]>(row.preset.cols);
  const [activeHandle, setActiveHandle] = React.useState<number | null>(null);

  const GRID_COLS = 12;
  const MIN_SPAN = 1;
  const GUTTER = 8; // V.s2 = 8px

  // Sync liveCols when row.preset.cols changes externally (e.g., layout picker)
  const presetKey = row.preset.cols.join(',');
  const prevPresetKey = React.useRef(presetKey);
  if (prevPresetKey.current !== presetKey) {
    prevPresetKey.current = presetKey;
    Promise.resolve().then(() => setLiveCols(row.preset.cols));
  }
  finalColsRef.current = liveCols;

  const totalCols = liveCols.reduce((a, b) => a + b, 0);

  const handleDragStart = (cellId: string, index: number) => {
    onCanvasDragStart(cellId, index);
  };

  const handleDrop = (toCellId: string, toIndex: number) => {
    onCanvasDrop(toCellId, toIndex);
  };

  const handleDragEnd = () => {
    onCanvasDragEnd();
  };

  const handlePaletteDropToCell = (cellId: string, index: number, type: Field['type']) => {
    onAddFieldToCell(type, cellId, index);
  };

  // Delete a cell by index — remap preset cols and rebuild cells list
  const handleDeleteCell = (cellIdx: number) => {
    if (row.cells.length <= 1) return; // cannot remove last cell
    const newCols = row.preset.cols.filter((_, i) => i !== cellIdx);
    const newCells = row.cells.filter((_, i) => i !== cellIdx);
    onUpdateRow(row.id, {
      preset: { ...row.preset, cols: newCols },
      cells: newCells,
    });
  };

  // Column resize handler
  const startResize = (e: React.MouseEvent, handleIdx: number) => {
    // Guard: only trigger from the grip dots element
    if ((e.target as HTMLElement).dataset.resizegrip !== 'true') return;
    e.preventDefault();
    e.stopPropagation();

    const cols = [...liveCols];
    draggingRef.current = { handleIdx, startX: e.clientX, startCols: [...cols] };
    setActiveHandle(handleIdx);

    const onMove = (ev: MouseEvent) => {
      const drag = draggingRef.current;
      if (!drag) return;

      const rowEl = rowRef.current;
      if (!rowEl) return;

      // Total row width excluding gutters
      const totalGutters = GUTTER * (drag.startCols.length - 1);
      const rowW = rowEl.offsetWidth - totalGutters;

      // Delta in pixels → delta in 12-col units
      const dx = ev.clientX - drag.startX;
      const pxPerUnit = rowW / GRID_COLS;
      const rawDelta = dx / pxPerUnit;

      // Snap delta to nearest integer
      const snappedDelta = Math.round(rawDelta);
      if (snappedDelta === 0) return;

      const next = [...drag.startCols];
      const leftCol = drag.handleIdx;
      const rightCol = drag.handleIdx + 1;

      const newLeft = drag.startCols[leftCol] + snappedDelta;
      const newRight = drag.startCols[rightCol] - snappedDelta;

      // Clamp — neither side goes below MIN_SPAN
      const maxLeft = GRID_COLS - (drag.startCols.length - 1) * MIN_SPAN - MIN_SPAN;
      const maxRight = GRID_COLS - (drag.startCols.length - 1) * MIN_SPAN - MIN_SPAN;

      if (newLeft < MIN_SPAN || newLeft > maxLeft) return;
      if (newRight < MIN_SPAN || newRight > maxRight) return;

      next[leftCol] = newLeft;
      next[rightCol] = newRight;
      setLiveCols(next);
    };

    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      setActiveHandle(null);

      // Commit final cols to parent
      if (finalColsRef.current) {
        onUpdateRow(row.id, {
          preset: { ...row.preset, cols: finalColsRef.current, label: 'Custom' },
        });
      }
      draggingRef.current = null;
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const ghostBtn: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: `5px 10px`,
    border: `1px solid ${V.borderLight}`,
    borderRadius: V.r3,
    backgroundColor: 'transparent',
    color: V.textDisabled,
    cursor: 'pointer',
    fontSize: V.sm,
    fontFamily: V.font,
    fontWeight: 400,
    whiteSpace: 'nowrap' as const,
    transition: 'all 0.12s',
    lineHeight: '1.4',
  };

  return (
    <div
      onDragEnd={handleDragEnd}
      style={{
        marginBottom: V.s3,
      }}
    >
      {/* White card containing the row */}
      <div
        style={{
          backgroundColor: V.bgSurface,
          borderRadius: V.r4,
          border: `1px solid ${V.borderLight}`,
          boxShadow: V.shadow1,
          overflow: 'visible',
        }}
      >
        {/* Row toolbar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: V.s2,
            padding: `${V.s2} ${V.s3}`,
            borderBottom: `1px solid ${V.borderLight}`,
            backgroundColor: V.bgApp,
            borderRadius: `${V.r4} ${V.r4} 0 0`,
          }}
        >
          {/* Drag handle */}
          <span
            style={{
              color: V.textDisabled,
              cursor: 'grab',
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
            }}
            title="Drag to reorder row"
          >
            <IconDragHandle />
          </span>

          {/* Layout selector - with dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              ref={layoutButtonRef}
              type="button"
              onClick={() => {
                if (!showLayoutPicker && layoutButtonRef.current) {
                  const rect = layoutButtonRef.current.getBoundingClientRect();
                  setButtonPosition({
                    top: rect.bottom,
                    left: rect.left,
                    width: rect.width,
                  });
                }
                setShowLayoutPicker(!showLayoutPicker);
              }}
              title="Change column layout"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: V.r3,
                border: `1px solid ${showLayoutPicker ? V.primary : V.border}`,
                backgroundColor: V.bgSurface,
                color: showLayoutPicker ? V.primary : V.textPrimary,
                cursor: 'pointer',
                fontSize: V.sm,
                fontWeight: 500,
                fontFamily: V.font,
                whiteSpace: 'nowrap',
                transition: 'all 0.12s',
              }}
              onMouseEnter={(e) => {
                if (!showLayoutPicker) {
                  e.currentTarget.style.borderColor = V.primary;
                  e.currentTarget.style.color = V.primary;
                }
              }}
              onMouseLeave={(e) => {
                if (!showLayoutPicker) {
                  e.currentTarget.style.borderColor = V.border;
                  e.currentTarget.style.color = V.textPrimary;
                }
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', color: 'inherit' }}>
                <IconGrid />
              </span>
              <span>{row.preset.label}</span>
              <span style={{ display: 'flex', alignItems: 'center', color: 'inherit', opacity: 0.6 }}>
                <IconChevronDown size={10} />
              </span>
            </button>

            {/* Layout picker dropdown */}
            {showLayoutPicker && buttonPosition && (
              <LayoutPicker
                position={buttonPosition}
                onSelect={(preset) => {
                  onUpdateRow(row.id, { preset });
                  setShowLayoutPicker(false);
                }}
                onClose={() => setShowLayoutPicker(false)}
              />
            )}
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* + Column ghost button */}
          <button
            type="button"
            title="Add column"
            style={{
              ...ghostBtn,
              color: addColHovered ? V.textSecondary : V.textDisabled,
              borderColor: addColHovered ? V.border : V.borderLight,
            }}
            onMouseEnter={() => setAddColHovered(true)}
            onMouseLeave={() => setAddColHovered(false)}
          >
            <IconPlus />
            Column
          </button>

          {/* x Row ghost button */}
          <button
            type="button"
            onClick={() => onDeleteRow(row.id)}
            title="Delete row"
            style={{
              ...ghostBtn,
              color: delRowHovered ? V.negative : V.textDisabled,
              borderColor: delRowHovered ? V.negative : V.borderLight,
            }}
            onMouseEnter={() => setDelRowHovered(true)}
            onMouseLeave={() => setDelRowHovered(false)}
          >
            <IconX size={10} />
            Row
          </button>
        </div>

        {/* Cells */}
        <div
          ref={rowRef}
          style={{
            display: 'flex',
            gap: V.s2,
            padding: V.s3,
          }}
        >
          {row.cells.map((cell, idx) => {
            const flexPct = `${(liveCols[idx] / totalCols) * 100}%`;
            return (
            <div
              key={cell.id}
              style={{
                position: 'relative',
                flex: `0 0 ${flexPct}`,
                maxWidth: flexPct,
                minWidth: 0,
              }}
            >
              <CellView
                cell={cell}
                colSpan={liveCols[idx] ?? 12}
                totalCols={totalCols}
                selectedFieldId={selectedFieldId}
                onSelectField={onSelectField}
                onDeleteField={onDeleteField}
                onDropField={handleDrop}
                onPaletteDropToCell={handlePaletteDropToCell}
                onDeleteCell={() => handleDeleteCell(idx)}
                dragState={dragState}
                onDragStartField={handleDragStart}
                cellId={cell.id}
                rowId={row.id}
                onColumnDragStart={onColumnDragStart}
                onColumnDropToSection={onColumnDropToSection}
              />

              {/* Resize handle — between cells, not after last */}
              {idx < row.cells.length - 1 && (
                <div
                  onMouseDown={(e) => startResize(e, idx)}
                  title="Drag to resize columns (snaps to 1/12 grid)"
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: GUTTER,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'col-resize',
                    zIndex: 10,
                    transform: 'translateX(50%)',
                  }}
                >
                  {/* Visual grip pill */}
                  <div
                    data-resizegrip="true"
                    style={{
                      width: activeHandle === idx ? 6 : 4,
                      height: activeHandle === idx ? 40 : 28,
                      borderRadius: V.rFull,
                      background: activeHandle === idx ? V.primary : V.border,
                      opacity: activeHandle === idx ? 1 : 0.5,
                      transition: 'all 0.12s',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 2,
                      boxShadow: activeHandle === idx ? V.shadow2 : 'none',
                      pointerEvents: 'auto',
                    }}
                  >
                    {/* Three grip dots */}
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        data-resizegrip="true"
                        style={{
                          width: 2,
                          height: 2,
                          borderRadius: '50%',
                          background: '#fff',
                          opacity: 0.7,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

// ─── SectionView ──────────────────────────────────────────────────────────────

interface SectionViewProps {
  section: Section;
  pageId: string;
  selectedFieldId: string | null;
  onSelectSection: (secId: string) => void;
  onSelectField: (id: string) => void;
  onDeleteField: (id: string) => void;
  onDeleteRow: (sectionId: string, rowId: string) => void;
  onDeleteSection: (secId: string) => void;
  onAddRow: (sectionId: string, preset: ColPreset) => void;
  onAddFieldToCell: (type: Field['type'], cellId: string, insertBeforeIndex: number) => void;
  onUpdateSection: (secId: string, patch: Partial<Section>) => void;
  onUpdateRow: (sectionId: string, rowId: string, patch: Partial<Row>) => void;
  dragState: DragState | null;
  onCanvasDragStart: (cellId: string, index: number) => void;
  onCanvasDrop: (toCellId: string, toIndex: number) => void;
  onCanvasDragEnd: () => void;
  onColumnDragStart?: (payload: ColumnDrag) => void;
  onColumnDropToSection?: (pageId: string, secId: string) => void;
}

function SectionView({
  section,
  selectedFieldId,
  onSelectSection,
  onSelectField,
  onDeleteField,
  onDeleteRow,
  onDeleteSection,
  onAddRow,
  onAddFieldToCell,
  onUpdateSection,
  onUpdateRow,
  dragState,
  onCanvasDragStart,
  onCanvasDrop,
  onCanvasDragEnd,
  onColumnDragStart,
  onColumnDropToSection,
}: SectionViewProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [showRowMenu, setShowRowMenu] = React.useState(false);
  const [addRowHovered, setAddRowHovered] = React.useState(false);
  const [buttonPos, setButtonPos] = React.useState<{ top: number; left: number; width: number } | null>(null);
  const addRowButtonRef = React.useRef<HTMLButtonElement>(null);

  const totalFields = section.rows.reduce(
    (acc, r) => acc + r.cells.reduce((a, c) => a + c.fields.length, 0),
    0,
  );

  return (
    <div
      style={{
        marginBottom: V.s4,
        border: `1.5px solid ${V.borderLight}`,
        borderRadius: V.r5,
        backgroundColor: V.bgSurface,
        boxShadow: V.shadow1,
        overflow: 'hidden',
      }}
      onClick={() => onSelectSection(section.id)}
    >
      {/* Section header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: `${V.s3} ${V.s4}`,
          borderBottom: collapsed ? 'none' : `1px solid ${V.borderLight}`,
          gap: V.s2,
          cursor: 'pointer',
          userSelect: 'none',
          backgroundColor: V.bgSurface,
        }}
        onClick={(e) => { e.stopPropagation(); setCollapsed((c) => !c); }}
      >
        {/* Chevron */}
        <span
          style={{
            color: V.textDisabled,
            display: 'flex',
            alignItems: 'center',
            transition: 'transform 0.15s',
            transform: collapsed ? 'rotate(0deg)' : 'rotate(0deg)',
            flexShrink: 0,
          }}
        >
          {collapsed ? <IconChevronRight size={14} /> : <IconChevronDown size={14} />}
        </span>

        {/* Section title input */}
        <input
          value={section.title}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onUpdateSection(section.id, { title: e.target.value })}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: V.md,
            fontWeight: 600,
            fontFamily: V.font,
            color: V.textPrimary,
            backgroundColor: 'transparent',
            cursor: 'text',
            minWidth: 0,
          }}
        />

        {/* Field count badge */}
        <span
          style={{
            fontSize: V.xs,
            color: V.textDisabled,
            fontFamily: V.font,
            backgroundColor: V.bgApp,
            border: `1px solid ${V.borderLight}`,
            borderRadius: V.rFull,
            padding: '2px 8px',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {totalFields} field{totalFields !== 1 ? 's' : ''}
        </span>

        {/* Repeatable toggle */}
        <button
          type="button"
          title={section.settings.repeatable ? 'Repeatable (click to disable)' : 'Make repeatable'}
          onClick={(e) => {
            e.stopPropagation();
            onUpdateSection(section.id, {
              settings: { ...section.settings, repeatable: !section.settings.repeatable },
            });
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: section.settings.repeatable ? V.primary : V.textDisabled,
            padding: `0 ${V.s1}`,
            transition: 'color 0.12s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = V.primary; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = section.settings.repeatable ? V.primary : V.textDisabled; }}
        >
          <IconRepeat />
        </button>

        {/* Delete section */}
        <button
          type="button"
          title="Delete section"
          onClick={(e) => { e.stopPropagation(); onDeleteSection(section.id); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: V.textDisabled,
            padding: `0 ${V.s1}`,
            transition: 'color 0.12s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = V.negative; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = V.textDisabled; }}
        >
          <IconX size={13} />
        </button>
      </div>

      {/* Section body */}
      {!collapsed && (
        <div
          style={{
            padding: V.s4,
            backgroundColor: V.bgApp,
          }}
        >
          {/* Rows */}
          {section.rows.map((row) => (
            <RowView
              key={row.id}
              row={row}
              selectedFieldId={selectedFieldId}
              onSelectField={onSelectField}
              onDeleteField={onDeleteField}
              onDeleteRow={(rowId) => onDeleteRow(section.id, rowId)}
              onUpdateRow={(rowId, patch) => onUpdateRow(section.id, rowId, patch)}
              onAddFieldToCell={onAddFieldToCell}
              dragState={dragState}
              onCanvasDragStart={onCanvasDragStart}
              onCanvasDrop={onCanvasDrop}
              onCanvasDragEnd={onCanvasDragEnd}
              onColumnDragStart={onColumnDragStart}
              onColumnDropToSection={onColumnDropToSection}
            />
          ))}

          {/* Add Row button + preset menu */}
          <div style={{ position: 'relative', marginTop: section.rows.length > 0 ? V.s2 : 0 }}>
            <button
              ref={addRowButtonRef}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!showRowMenu && addRowButtonRef.current) {
                  const rect = addRowButtonRef.current.getBoundingClientRect();
                  setButtonPos({
                    top: rect.bottom + 8,
                    left: rect.left,
                    width: rect.width,
                  });
                }
                setShowRowMenu((v) => !v);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: V.s2,
                width: '100%',
                padding: `${V.s3} ${V.s4}`,
                border: `1.5px dashed ${addRowHovered ? V.primary : V.primary}`,
                borderRadius: V.r4,
                backgroundColor: addRowHovered ? V.primaryBg : V.bgHighlight,
                color: V.primary,
                cursor: 'pointer',
                fontSize: V.sm,
                fontFamily: V.font,
                fontWeight: 500,
                transition: 'all 0.12s',
              }}
              onMouseEnter={() => setAddRowHovered(true)}
              onMouseLeave={() => setAddRowHovered(false)}
            >
              <IconPlus />
              Add Row
            </button>

            {showRowMenu && buttonPos && (
              <LayoutPicker
                position={buttonPos}
                fullWidth={true}
                onSelect={(preset) => {
                  onAddRow(section.id, preset);
                  setShowRowMenu(false);
                }}
                onClose={() => setShowRowMenu(false)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Canvas ───────────────────────────────────────────────────────────────────

export interface CanvasProps {
  selectedFieldId: string | null;
  onSelectField: (id: string) => void;
  onDeleteField: (id: string) => void;
  onDeleteRow: (sectionId: string, rowId: string) => void;
  onMoveField: (fromCellId: string, fromIdx: number, toCellId: string, toIdx: number) => void;
  onDeleteSection: (secId: string) => void;
  onAddRow: (sectionId: string, preset: ColPreset) => void;
  onAddFieldToCell: (type: Field['type'], cellId: string, insertBeforeIndex: number) => void;
  onUpdateSection: (secId: string, patch: Partial<Section>) => void;
  onUpdateRow: (sectionId: string, rowId: string, patch: Partial<Row>) => void;
  onAddSection: (pageId?: string) => void;
  activePage: Page | null;
  activeSId: string | null;
  onSelectSection: (secId: string) => void;
  activePageId: string | null;
  onColumnDragStart?: (payload: ColumnDrag) => void;
  onColumnDropToSection?: (pageId: string, secId: string) => void;
  columnDrag?: ColumnDrag | null;
}

export function Canvas({
  selectedFieldId,
  onSelectField,
  onDeleteField,
  onDeleteRow,
  onMoveField,
  onDeleteSection,
  onAddRow,
  onAddFieldToCell,
  onUpdateSection,
  onUpdateRow,
  onAddSection,
  activePage,
  onSelectSection,
  activePageId,
  onColumnDragStart,
  onColumnDropToSection,
}: CanvasProps) {
  const [addSectionHovered, setAddSectionHovered] = React.useState(false);
  const [dragState, setDragState] = React.useState<DragState | null>(null);

  const handleCanvasDragStart = React.useCallback((cellId: string, index: number) => {
    setDragState({ sourceCellId: cellId, sourceIndex: index });
  }, []);

  const handleCanvasDrop = React.useCallback(
    (toCellId: string, toIndex: number) => {
      if (!dragState) return;
      onMoveField(dragState.sourceCellId, dragState.sourceIndex, toCellId, toIndex);
      setDragState(null);
    },
    [dragState, onMoveField],
  );

  const handleCanvasDragEnd = React.useCallback(() => {
    setDragState(null);
  }, []);

  if (!activePage) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: V.textDisabled,
          fontFamily: V.font,
          fontSize: V.md,
          backgroundColor: V.bgApp,
        }}
      >
        No page selected
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: V.bgApp,
      }}
      onClick={() => onSelectField('')}
    >
      {/* Canvas toolbar header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '52px',
          paddingLeft: V.s3,
          paddingRight: V.s3,
          borderBottom: `1px solid ${V.borderLight}`,
          flexShrink: 0,
          backgroundColor: V.bgSurface,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Page label */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: V.s2,
            fontSize: V.md,
            fontFamily: V.font,
            color: V.textSecondary,
          }}
        >
          <span style={{ color: V.textDisabled, fontWeight: 400 }}>{activePage?.title || 'Page'}</span>
          <span style={{ color: V.textDisabled }}>/</span>
          <span style={{ fontWeight: 600, color: V.textPrimary }}>Sections</span>
        </div>

        {/* Add section */}
        <button
          type="button"
          onClick={() => onAddSection(activePageId ?? undefined)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: V.s1,
            padding: `${V.s2} ${V.s4}`,
            border: `1.5px dashed ${addSectionHovered ? V.primary : V.border}`,
            borderRadius: V.r3,
            backgroundColor: addSectionHovered ? V.bgHighlight : 'transparent',
            color: addSectionHovered ? V.primary : V.textSecondary,
            cursor: 'pointer',
            fontSize: V.sm,
            fontFamily: V.font,
            fontWeight: 500,
            transition: 'all 0.12s',
            height: 'fit-content',
          }}
          onMouseEnter={() => setAddSectionHovered(true)}
          onMouseLeave={() => setAddSectionHovered(false)}
          title="Add section"
        >
          <IconPlus />
          Add Section
        </button>
      </div>

      {/* Content area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: `${V.s5} ${V.s6}`,
        }}
      >
        <div
          style={{
            maxWidth: '1000px',
            margin: '0 auto',
          }}
        >
          {/* Sections */}
        {activePage.sections.length === 0 ? (
          <div
            style={{
              padding: V.s6,
              textAlign: 'center',
              border: `2px dashed ${V.borderLight}`,
              borderRadius: V.r5,
              color: V.textDisabled,
              fontFamily: V.font,
              fontSize: V.md,
              backgroundColor: V.bgSurface,
            }}
          >
            <div style={{ marginBottom: V.s3, fontSize: '28px', opacity: 0.4 }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke={V.textDisabled} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="8" width="24" height="6" rx="2"/>
                <rect x="4" y="18" width="24" height="6" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="13" y1="4" x2="19" y2="4"/>
              </svg>
            </div>
            <div style={{ fontWeight: 500, color: V.textSecondary, marginBottom: V.s1 }}>
              No sections yet
            </div>
            <div style={{ fontSize: V.sm }}>
              Click "+ Add Section" above to get started
            </div>
          </div>
        ) : (
          activePage.sections.map((section) => (
            <SectionView
              key={section.id}
              section={section}
              pageId={activePageId ?? ''}
              selectedFieldId={selectedFieldId}
              onSelectSection={onSelectSection}
              onSelectField={onSelectField}
              onDeleteField={onDeleteField}
              onDeleteRow={onDeleteRow}
              onDeleteSection={onDeleteSection}
              onAddRow={onAddRow}
              onAddFieldToCell={onAddFieldToCell}
              onUpdateSection={onUpdateSection}
              onUpdateRow={onUpdateRow}
              dragState={dragState}
              onCanvasDragStart={handleCanvasDragStart}
              onCanvasDrop={handleCanvasDrop}
              onCanvasDragEnd={handleCanvasDragEnd}
              onColumnDragStart={onColumnDragStart}
              onColumnDropToSection={onColumnDropToSection}
            />
          ))
        )}
      </div>
    </div>
    </div>
  );
}
