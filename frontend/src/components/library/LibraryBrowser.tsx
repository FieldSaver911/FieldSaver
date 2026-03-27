import React from 'react';
import { V, categoryColor } from '../../constants/design';
import { useLibraries } from '../../hooks/useLibraries';
import { librariesApi } from '../../api/libraries';
import { LibraryFilter } from './LibraryFilter';
import type { LibraryFilterValues } from './LibraryFilter';
import type { Library, LibraryRowDef, AssignedLibraryRow } from '@fieldsaver/shared';
import type { CreateLibraryInput, CreateLibraryRowInput } from '@fieldsaver/shared';
import { useLibraryStore } from '../../stores/useLibraryStore';

// ─── Types ───────────────────────────────────────────────────────────────────

export type BrowserMode = 'browse' | 'manage';

export interface LibraryBrowserProps {
  /** Already-assigned rows for the active field (browse mode) */
  assignedRows?: AssignedLibraryRow[];
  /** Called when the user confirms their selection in browse mode */
  onAssign?: (rows: AssignedLibraryRow[]) => void;
  /** Called to close the modal */
  onClose: () => void;
  /** Initial mode — defaults to 'browse' */
  initialMode?: BrowserMode;
}

type SortCol = 'label' | 'code' | 'exportKey' | 'category' | 'subCategory' | null;
type SortDir = 'asc' | 'desc';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sortRows(
  rows: LibraryRowDef[],
  col: SortCol,
  dir: SortDir,
  filterSortBy: LibraryFilterValues['sortBy'],
): LibraryRowDef[] {
  const effectiveCol: SortCol =
    col ??
    (filterSortBy === 'none'
      ? null
      : filterSortBy === 'category'
        ? 'category'
        : filterSortBy === 'subCategory'
          ? 'subCategory'
          : filterSortBy === 'label'
            ? 'label'
            : null);

  if (!effectiveCol) return [...rows];

  return [...rows].sort((a, b) => {
    const av = String(a[effectiveCol] ?? '').toLowerCase();
    const bv = String(b[effectiveCol] ?? '').toLowerCase();
    const cmp = av.localeCompare(bv);
    return dir === 'asc' ? cmp : -cmp;
  });
}

function filterRows(rows: LibraryRowDef[], filters: LibraryFilterValues): LibraryRowDef[] {
  const q = filters.search.toLowerCase().trim();
  return rows.filter((row) => {
    if (filters.categories.length > 0 && !filters.categories.includes(row.category)) {
      return false;
    }
    if (q.length > 0) {
      return (
        row.label.toLowerCase().includes(q) ||
        row.code.toLowerCase().includes(q) ||
        row.exportKey.toLowerCase().includes(q)
      );
    }
    return true;
  });
}

function collectCategories(rows: LibraryRowDef[]): string[] {
  const seen = new Set<string>();
  rows.forEach((r) => { if (r.category) seen.add(r.category); });
  return Array.from(seen).sort();
}

// ─── Sub-components ──────────────────────────────────────────────────────────

interface LibSidebarItemProps {
  lib: Library;
  selected: boolean;
  onSelect: (id: string) => void;
}

function LibSidebarItem({ lib, selected, onSelect }: LibSidebarItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(lib.id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: V.s2,
        width: '100%',
        padding: `${V.s2} ${V.s3}`,
        border: 'none',
        borderRadius: V.r2,
        backgroundColor: selected ? V.bgSelected : 'transparent',
        color: selected ? V.primary : V.textPrimary,
        cursor: 'pointer',
        textAlign: 'left',
        fontSize: V.sm,
        fontWeight: selected ? 600 : 400,
        transition: 'background 0.1s',
      }}
    >
      <span style={{ fontSize: '16px', flexShrink: 0 }}>{lib.icon}</span>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {lib.name}
      </span>
      <span
        style={{
          marginLeft: 'auto',
          fontSize: V.xs,
          color: V.textSecondary,
          flexShrink: 0,
        }}
      >
        {lib.rows?.length ?? 0}
      </span>
    </button>
  );
}

// ── Column header ─────────────────────────────────────────────────────────────

interface ColHeaderProps {
  col: SortCol;
  label: string;
  sortCol: SortCol;
  sortDir: SortDir;
  onSort: (col: SortCol) => void;
  minWidth?: string;
}

function ColHeader({ col, label, sortCol, sortDir, onSort, minWidth }: ColHeaderProps) {
  const active = sortCol === col;
  return (
    <th
      onClick={() => col && onSort(col)}
      style={{
        padding: `${V.s1} ${V.s2}`,
        textAlign: 'left',
        fontSize: V.xs,
        fontWeight: 600,
        color: active ? V.primary : V.textSecondary,
        cursor: col ? 'pointer' : 'default',
        userSelect: 'none',
        borderBottom: `1px solid ${V.border}`,
        whiteSpace: 'nowrap',
        width: minWidth,
        minWidth,
      }}
    >
      {label}
      {active && (
        <span style={{ marginLeft: V.s1, fontSize: '9px' }}>
          {sortDir === 'asc' ? '▲' : '▼'}
        </span>
      )}
    </th>
  );
}

// ── Row chip ──────────────────────────────────────────────────────────────────

interface CategoryBadgeProps {
  category: string;
}

function CategoryBadge({ category }: CategoryBadgeProps) {
  const colors = categoryColor(category);
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px',
        padding: `1px ${V.s1}`,
        borderRadius: V.rFull,
        backgroundColor: colors.bg,
        fontSize: V.xs,
        color: colors.text,
        fontWeight: 500,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          backgroundColor: colors.dot,
          flexShrink: 0,
        }}
      />
      {category || '—'}
    </span>
  );
}

// ── Inline editable row ────────────────────────────────────────────────────────

interface EditableRowProps {
  row: LibraryRowDef;
  onSave: (rowId: string, patch: Partial<LibraryRowDef>) => Promise<void>;
  onDelete: (rowId: string) => Promise<void>;
}

function EditableRow({ row, onSave, onDelete }: EditableRowProps) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState({
    label: row.label,
    code: row.code,
    exportKey: row.exportKey,
    category: row.category,
    subCategory: row.subCategory,
  });
  const [saving, setSaving] = React.useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(row.id, draft);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setDraft({
      label: row.label,
      code: row.code,
      exportKey: row.exportKey,
      category: row.category,
      subCategory: row.subCategory,
    });
    setEditing(false);
  }

  const cellStyle: React.CSSProperties = {
    padding: `${V.s1} ${V.s2}`,
    fontSize: V.sm,
    color: V.textPrimary,
    verticalAlign: 'middle',
    borderBottom: `1px solid ${V.borderLight}`,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '3px 6px',
    border: `1px solid ${V.borderFocus}`,
    borderRadius: V.r2,
    fontSize: V.sm,
    color: V.textPrimary,
    outline: 'none',
    boxSizing: 'border-box',
  };

  if (editing) {
    return (
      <tr>
        <td style={cellStyle}>
          <input
            style={inputStyle}
            value={draft.label}
            onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
          />
        </td>
        <td style={cellStyle}>
          <input
            style={inputStyle}
            value={draft.code}
            onChange={(e) => setDraft((d) => ({ ...d, code: e.target.value }))}
          />
        </td>
        <td style={cellStyle}>
          <input
            style={inputStyle}
            value={draft.exportKey}
            onChange={(e) => setDraft((d) => ({ ...d, exportKey: e.target.value }))}
          />
        </td>
        <td style={cellStyle}>
          <input
            style={inputStyle}
            value={draft.category}
            onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
          />
        </td>
        <td style={cellStyle}>
          <input
            style={inputStyle}
            value={draft.subCategory}
            onChange={(e) => setDraft((d) => ({ ...d, subCategory: e.target.value }))}
          />
        </td>
        <td style={{ ...cellStyle, whiteSpace: 'nowrap' }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              marginRight: V.s1,
              padding: `2px ${V.s2}`,
              border: 'none',
              borderRadius: V.r2,
              backgroundColor: V.positive,
              color: '#fff',
              fontSize: V.xs,
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? '…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            style={{
              padding: `2px ${V.s2}`,
              border: `1px solid ${V.border}`,
              borderRadius: V.r2,
              backgroundColor: V.bgSurface,
              color: V.textSecondary,
              fontSize: V.xs,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr
      style={{ cursor: 'default' }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLTableRowElement).style.backgroundColor = V.bgHover;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'transparent';
      }}
    >
      <td style={cellStyle}>{row.label}</td>
      <td style={{ ...cellStyle, color: V.textSecondary }}>{row.code || '—'}</td>
      <td style={{ ...cellStyle, fontFamily: 'monospace', fontSize: V.xs }}>{row.exportKey}</td>
      <td style={cellStyle}>
        <CategoryBadge category={row.category} />
      </td>
      <td style={{ ...cellStyle, color: V.textSecondary }}>{row.subCategory || '—'}</td>
      <td style={{ ...cellStyle, whiteSpace: 'nowrap' }}>
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label="Edit row"
          style={{
            marginRight: V.s1,
            padding: `2px ${V.s1}`,
            border: `1px solid ${V.border}`,
            borderRadius: V.r2,
            backgroundColor: V.bgSurface,
            color: V.textSecondary,
            fontSize: V.xs,
            cursor: 'pointer',
          }}
        >
          ✏️
        </button>
        <button
          type="button"
          onClick={() => onDelete(row.id)}
          aria-label="Delete row"
          style={{
            padding: `2px ${V.s1}`,
            border: `1px solid ${V.negativeBg}`,
            borderRadius: V.r2,
            backgroundColor: V.negativeBg,
            color: V.negative,
            fontSize: V.xs,
            cursor: 'pointer',
          }}
        >
          🗑️
        </button>
      </td>
    </tr>
  );
}

// ── Browse row ────────────────────────────────────────────────────────────────

interface BrowseRowProps {
  row: LibraryRowDef;
  checked: boolean;
  onToggle: (row: LibraryRowDef) => void;
}

function BrowseRow({ row, checked, onToggle }: BrowseRowProps) {
  const cellStyle: React.CSSProperties = {
    padding: `${V.s1} ${V.s2}`,
    fontSize: V.sm,
    color: V.textPrimary,
    verticalAlign: 'middle',
    borderBottom: `1px solid ${V.borderLight}`,
  };

  return (
    <tr
      onClick={() => onToggle(row)}
      style={{
        cursor: 'pointer',
        backgroundColor: checked ? V.bgSelected : 'transparent',
      }}
      onMouseEnter={(e) => {
        if (!checked) (e.currentTarget as HTMLTableRowElement).style.backgroundColor = V.bgHover;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLTableRowElement).style.backgroundColor = checked ? V.bgSelected : 'transparent';
      }}
    >
      <td style={{ ...cellStyle, width: '36px', textAlign: 'center' }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onToggle(row)}
          onClick={(e) => e.stopPropagation()}
          style={{ accentColor: V.primary, cursor: 'pointer' }}
        />
      </td>
      <td style={cellStyle}>{row.label}</td>
      <td style={{ ...cellStyle, color: V.textSecondary }}>{row.code || '—'}</td>
      <td style={{ ...cellStyle, fontFamily: 'monospace', fontSize: V.xs }}>{row.exportKey}</td>
      <td style={cellStyle}>
        <CategoryBadge category={row.category} />
      </td>
      <td style={{ ...cellStyle, color: V.textSecondary }}>{row.subCategory || '—'}</td>
    </tr>
  );
}

// ── New row form ──────────────────────────────────────────────────────────────

interface NewRowFormProps {
  onAdd: (input: CreateLibraryRowInput) => Promise<void>;
}

function NewRowForm({ onAdd }: NewRowFormProps) {
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [draft, setDraft] = React.useState<CreateLibraryRowInput>({
    label: '',
    code: '',
    exportKey: '',
    description: '',
    category: '',
    subCategory: '',
    usage: 'Optional',
    elementId: '',
    sortOrder: 0,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.label || !draft.exportKey) return;
    setSaving(true);
    try {
      await onAdd(draft);
      setDraft({
        label: '',
        code: '',
        exportKey: '',
        description: '',
        category: '',
        subCategory: '',
        usage: 'Optional',
        elementId: '',
        sortOrder: 0,
      });
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    flex: '1 1 120px',
    padding: `5px ${V.s2}`,
    border: `1px solid ${V.border}`,
    borderRadius: V.r2,
    fontSize: V.sm,
    color: V.textPrimary,
    outline: 'none',
    minWidth: '80px',
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: V.s1,
          padding: `${V.s1} ${V.s3}`,
          border: `1px dashed ${V.border}`,
          borderRadius: V.r2,
          backgroundColor: 'transparent',
          color: V.textSecondary,
          fontSize: V.sm,
          cursor: 'pointer',
          margin: `${V.s2} ${V.s3}`,
        }}
      >
        + Add Row
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: V.s2,
        padding: `${V.s2} ${V.s3}`,
        backgroundColor: V.bgHighlight,
        borderTop: `1px solid ${V.borderLight}`,
      }}
    >
      <input style={inputStyle} placeholder="Label *" value={draft.label} onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))} />
      <input style={inputStyle} placeholder="Export Key *" value={draft.exportKey} onChange={(e) => setDraft((d) => ({ ...d, exportKey: e.target.value }))} />
      <input style={inputStyle} placeholder="Code" value={draft.code} onChange={(e) => setDraft((d) => ({ ...d, code: e.target.value }))} />
      <input style={inputStyle} placeholder="Category" value={draft.category} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))} />
      <input style={inputStyle} placeholder="Sub-Category" value={draft.subCategory} onChange={(e) => setDraft((d) => ({ ...d, subCategory: e.target.value }))} />
      <div style={{ display: 'flex', gap: V.s1, alignItems: 'center' }}>
        <button
          type="submit"
          disabled={saving || !draft.label || !draft.exportKey}
          style={{
            padding: `5px ${V.s3}`,
            border: 'none',
            borderRadius: V.r2,
            backgroundColor: V.primary,
            color: '#fff',
            fontSize: V.sm,
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: !draft.label || !draft.exportKey ? 0.5 : 1,
          }}
        >
          {saving ? 'Adding…' : 'Add'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          style={{
            padding: `5px ${V.s3}`,
            border: `1px solid ${V.border}`,
            borderRadius: V.r2,
            backgroundColor: V.bgSurface,
            color: V.textSecondary,
            fontSize: V.sm,
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── New library form ──────────────────────────────────────────────────────────

interface NewLibraryFormProps {
  onAdd: (input: CreateLibraryInput) => Promise<void>;
}

function NewLibraryForm({ onAdd }: NewLibraryFormProps) {
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [name, setName] = React.useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onAdd({
        name: name.trim(),
        icon: '📋',
        description: '',
        color: V.primary,
        version: '1.0',
        source: 'custom',
        mondayBoardId: null,
        categories: [],
        subCategories: [],
      });
      setName('');
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: V.s1,
          width: '100%',
          padding: `${V.s2} ${V.s3}`,
          border: `1px dashed ${V.sidebarBorder}`,
          borderRadius: V.r2,
          backgroundColor: 'transparent',
          color: V.sidebarMuted,
          cursor: 'pointer',
          fontSize: V.sm,
          marginTop: V.s2,
        }}
      >
        + New Library
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: V.s1,
        padding: `${V.s2} ${V.s3}`,
        marginTop: V.s2,
        backgroundColor: V.sidebarHover,
        borderRadius: V.r2,
      }}
    >
      <input
        autoFocus
        placeholder="Library name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{
          padding: `5px ${V.s2}`,
          border: `1px solid ${V.sidebarBorder}`,
          borderRadius: V.r2,
          backgroundColor: 'rgba(255,255,255,0.1)',
          color: V.sidebarText,
          fontSize: V.sm,
          outline: 'none',
        }}
      />
      <div style={{ display: 'flex', gap: V.s1 }}>
        <button
          type="submit"
          disabled={saving || !name.trim()}
          style={{
            flex: 1,
            padding: `4px 0`,
            border: 'none',
            borderRadius: V.r2,
            backgroundColor: V.primary,
            color: '#fff',
            fontSize: V.sm,
            cursor: 'pointer',
            opacity: !name.trim() ? 0.5 : 1,
          }}
        >
          {saving ? '…' : 'Create'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          style={{
            padding: `4px ${V.s2}`,
            border: `1px solid ${V.sidebarBorder}`,
            borderRadius: V.r2,
            backgroundColor: 'transparent',
            color: V.sidebarMuted,
            fontSize: V.sm,
            cursor: 'pointer',
          }}
        >
          ✕
        </button>
      </div>
    </form>
  );
}

// ─── Main LibraryBrowser ─────────────────────────────────────────────────────

export function LibraryBrowser({
  assignedRows = [],
  onAssign,
  onClose,
  initialMode = 'browse',
}: LibraryBrowserProps) {
  const { libraries, loading, error, addRow, updateRow, deleteRow } = useLibraries();
  const storeAddLibrary = useLibraryStore((state) => state.addLibrary);

  const [mode, setMode] = React.useState<BrowserMode>(initialMode);
  const [activeLibId, setActiveLibId] = React.useState<string | null>(null);
  const [filters, setFilters] = React.useState<LibraryFilterValues>({
    search: '',
    categories: [],
    sortBy: 'none',
  });
  const [sortCol, setSortCol] = React.useState<SortCol>(null);
  const [sortDir, setSortDir] = React.useState<SortDir>('asc');
  const [selected, setSelected] = React.useState<Set<string>>(
    () => new Set(assignedRows.map((r) => r.rowId)),
  );

  // Select first library when libraries load
  React.useEffect(() => {
    if (libraries.length > 0 && activeLibId === null) {
      setActiveLibId(libraries[0].id);
    }
  }, [libraries, activeLibId]);

  const activeLib: Library | undefined = libraries.find((l) => l.id === activeLibId);
  const allRows: LibraryRowDef[] = activeLib?.rows ?? [];
  const availableCategories = collectCategories(allRows);

  const filteredRows = sortRows(
    filterRows(allRows, filters),
    sortCol,
    sortDir,
    filters.sortBy,
  );

  function handleSortCol(col: SortCol) {
    if (col === null) return;
    if (sortCol === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  }

  function handleBrowseToggle(row: LibraryRowDef) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(row.id)) {
        next.delete(row.id);
      } else {
        next.add(row.id);
      }
      return next;
    });
  }

  function handleConfirmBrowse() {
    if (!onAssign) return;
    // Build AssignedLibraryRow list from selected IDs across all libraries
    const all = libraries.flatMap((lib) => (lib.rows ?? []).map((r) => ({ lib, row: r })));
    const result: AssignedLibraryRow[] = all
      .filter(({ row }) => selected.has(row.id))
      .map(({ lib, row }) => ({
        libraryId: lib.id,
        rowId: row.id,
        label: row.label,
        exportKey: row.exportKey,
        code: row.code,
        category: row.category,
        subCategory: row.subCategory,
      }));
    onAssign(result);
    onClose();
  }

  async function handleSaveRow(rowId: string, patch: Partial<LibraryRowDef>) {
    if (!activeLibId) return;
    await updateRow(activeLibId, rowId, patch);
  }

  async function handleDeleteRow(rowId: string) {
    if (!activeLibId) return;
    await deleteRow(activeLibId, rowId);
  }

  async function handleAddRow(input: CreateLibraryRowInput) {
    if (!activeLibId) return;
    await addRow(activeLibId, input);
  }

  async function handleCreateLibrary(input: CreateLibraryInput) {
    const lib = await librariesApi.create(input);
    storeAddLibrary(lib);
    setActiveLibId(lib.id);
  }

  const selectedCount = selected.size;
  const initiallyAssignedCount = assignedRows.length;
  const browseSelectionDiff = selectedCount - initiallyAssignedCount;

  return (
    // Backdrop
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Dialog */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '900px',
          maxWidth: '95vw',
          height: '680px',
          maxHeight: '90vh',
          backgroundColor: V.bgSurface,
          borderRadius: V.r4,
          boxShadow: V.shadow3,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: V.s3,
            padding: `${V.s3} ${V.s4}`,
            borderBottom: `1px solid ${V.border}`,
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: '20px' }}>📚</span>
          <span
            style={{
              fontSize: V.lg,
              fontWeight: 600,
              color: V.textPrimary,
              fontFamily: V.font,
              flex: 1,
            }}
          >
            Library Browser
          </span>

          {/* Mode toggle */}
          <div
            style={{
              display: 'flex',
              border: `1px solid ${V.border}`,
              borderRadius: V.r2,
              overflow: 'hidden',
            }}
          >
            {(['browse', 'manage'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                style={{
                  padding: `5px ${V.s3}`,
                  border: 'none',
                  backgroundColor: mode === m ? V.primary : V.bgSurface,
                  color: mode === m ? '#fff' : V.textSecondary,
                  fontSize: V.sm,
                  fontWeight: mode === m ? 600 : 400,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {m === 'browse' ? '🔎 Browse' : '⚙️ Manage'}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close library browser"
            style={{
              padding: `${V.s1} ${V.s2}`,
              border: 'none',
              borderRadius: V.r2,
              backgroundColor: 'transparent',
              color: V.textSecondary,
              fontSize: V.lg,
              cursor: 'pointer',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Sidebar */}
          <div
            style={{
              width: '200px',
              flexShrink: 0,
              backgroundColor: V.sidebarBg,
              borderRight: `1px solid ${V.sidebarBorder}`,
              display: 'flex',
              flexDirection: 'column',
              padding: V.s2,
              overflowY: 'auto',
            }}
          >
            <p
              style={{
                fontSize: V.xs,
                fontWeight: 600,
                color: V.sidebarMuted,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                margin: `0 0 ${V.s2} ${V.s1}`,
              }}
            >
              Libraries
            </p>

            {loading && (
              <p style={{ fontSize: V.sm, color: V.sidebarMuted, padding: V.s2 }}>
                Loading…
              </p>
            )}
            {error && (
              <p style={{ fontSize: V.sm, color: V.negative, padding: V.s2 }}>
                {error}
              </p>
            )}

            {libraries.map((lib) => (
              <LibSidebarItem
                key={lib.id}
                lib={lib}
                selected={lib.id === activeLibId}
                onSelect={setActiveLibId}
              />
            ))}

            {mode === 'manage' && (
              <NewLibraryForm onAdd={handleCreateLibrary} />
            )}
          </div>

          {/* Main panel */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Filter bar */}
            <LibraryFilter
              availableCategories={availableCategories}
              filters={filters}
              onChange={setFilters}
            />

            {/* Table */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {!activeLib ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: V.textSecondary,
                    fontSize: V.sm,
                  }}
                >
                  Select a library to browse its rows.
                </div>
              ) : filteredRows.length === 0 ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '80px',
                    color: V.textSecondary,
                    fontSize: V.sm,
                  }}
                >
                  No rows match the current filters.
                </div>
              ) : (
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    tableLayout: 'fixed',
                  }}
                >
                  <thead
                    style={{
                      position: 'sticky',
                      top: 0,
                      backgroundColor: V.bgApp,
                      zIndex: 10,
                    }}
                  >
                    <tr>
                      {mode === 'browse' && (
                        <th
                          style={{
                            width: '36px',
                            padding: `${V.s1} ${V.s2}`,
                            borderBottom: `1px solid ${V.border}`,
                          }}
                        />
                      )}
                      <ColHeader
                        col="label"
                        label="Label"
                        sortCol={sortCol}
                        sortDir={sortDir}
                        onSort={handleSortCol}
                        minWidth="160px"
                      />
                      <ColHeader
                        col="code"
                        label="Code"
                        sortCol={sortCol}
                        sortDir={sortDir}
                        onSort={handleSortCol}
                        minWidth="80px"
                      />
                      <ColHeader
                        col="exportKey"
                        label="Export Key"
                        sortCol={sortCol}
                        sortDir={sortDir}
                        onSort={handleSortCol}
                        minWidth="140px"
                      />
                      <ColHeader
                        col="category"
                        label="Category"
                        sortCol={sortCol}
                        sortDir={sortDir}
                        onSort={handleSortCol}
                        minWidth="130px"
                      />
                      <ColHeader
                        col="subCategory"
                        label="Sub-Category"
                        sortCol={sortCol}
                        sortDir={sortDir}
                        onSort={handleSortCol}
                        minWidth="110px"
                      />
                      {mode === 'manage' && (
                        <th
                          style={{
                            padding: `${V.s1} ${V.s2}`,
                            borderBottom: `1px solid ${V.border}`,
                            width: '80px',
                          }}
                        />
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row) =>
                      mode === 'manage' ? (
                        <EditableRow
                          key={row.id}
                          row={row}
                          onSave={handleSaveRow}
                          onDelete={handleDeleteRow}
                        />
                      ) : (
                        <BrowseRow
                          key={row.id}
                          row={row}
                          checked={selected.has(row.id)}
                          onToggle={handleBrowseToggle}
                        />
                      ),
                    )}
                  </tbody>
                </table>
              )}

              {mode === 'manage' && activeLib && (
                <NewRowForm onAdd={handleAddRow} />
              )}
            </div>

            {/* Footer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: `${V.s2} ${V.s4}`,
                borderTop: `1px solid ${V.border}`,
                backgroundColor: V.bgApp,
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: V.sm, color: V.textSecondary }}>
                {filteredRows.length} row{filteredRows.length !== 1 ? 's' : ''}
                {filters.search || filters.categories.length > 0 ? ' (filtered)' : ''}
              </span>

              <div style={{ display: 'flex', gap: V.s2 }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: `${V.s1} ${V.s4}`,
                    border: `1px solid ${V.border}`,
                    borderRadius: V.r2,
                    backgroundColor: V.bgSurface,
                    color: V.textSecondary,
                    fontSize: V.sm,
                    cursor: 'pointer',
                  }}
                >
                  {mode === 'manage' ? 'Done' : 'Cancel'}
                </button>

                {mode === 'browse' && onAssign && (
                  <button
                    type="button"
                    onClick={handleConfirmBrowse}
                    style={{
                      padding: `${V.s1} ${V.s4}`,
                      border: 'none',
                      borderRadius: V.r2,
                      backgroundColor: V.primary,
                      color: '#fff',
                      fontSize: V.sm,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Assign {selectedCount > 0 ? `${selectedCount} row${selectedCount !== 1 ? 's' : ''}` : ''}
                    {browseSelectionDiff !== 0 && (
                      <span style={{ fontWeight: 400, opacity: 0.85 }}>
                        {' '}({browseSelectionDiff > 0 ? `+${browseSelectionDiff}` : browseSelectionDiff})
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
