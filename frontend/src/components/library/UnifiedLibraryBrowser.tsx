import React from 'react';
import type { LibraryRowDef } from '@fieldsaver/shared';
import { V } from '../../constants/design';
import { useLibraryStore } from '../../stores/useLibraryStore';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UnifiedLibraryBrowserProps {
  mode: 'manage' | 'browse';
  onClose: () => void;
  onAssignKeys?: (selectedRows: LibraryRowDef[]) => void;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function UnifiedLibraryBrowser({ mode, onClose, onAssignKeys }: UnifiedLibraryBrowserProps) {
  const libraries = useLibraryStore((state) => state.libraries);
  const [activeLibId, setActiveLibId] = React.useState<string>(libraries[0]?.id ?? '');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('');
  const [selectedSubCategory, setSelectedSubCategory] = React.useState<string>('');
  const [groupByCategory, setGroupByCategory] = React.useState(false);
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set());

  const activeLib = libraries.find((lib) => lib.id === activeLibId);
  const rows = activeLib?.rows ?? [];

  // Filter rows
  const filteredRows = React.useMemo(() => {
    return rows.filter((row) => {
      const matchesSearch =
        !searchQuery ||
        row.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.exportKey.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = !selectedCategory || row.category === selectedCategory;
      const matchesSubCategory = !selectedSubCategory || row.subCategory === selectedSubCategory;

      return matchesSearch && matchesCategory && matchesSubCategory;
    });
  }, [rows, searchQuery, selectedCategory, selectedSubCategory]);

  // Get unique categories for filter dropdown
  const categories = React.useMemo(() => {
    const cats = new Set(rows.map((r) => r.category));
    return Array.from(cats).sort();
  }, [rows]);

  // Get unique sub-categories for filter dropdown
  const subCategories = React.useMemo(() => {
    const subs = new Set(
      (selectedCategory ? rows.filter((r) => r.category === selectedCategory) : rows).map((r) => r.subCategory),
    );
    return Array.from(subs).sort();
  }, [rows, selectedCategory]);

  const handleSelectRow = (rowId: string) => {
    const next = new Set(selectedRows);
    if (next.has(rowId)) {
      next.delete(rowId);
    } else {
      next.add(rowId);
    }
    setSelectedRows(next);
  };

  const handleAssignKeys = () => {
    const rowsToAssign = filteredRows.filter((r) => selectedRows.has(r.id));
    onAssignKeys?.(rowsToAssign);
  };

  const title = mode === 'manage' ? 'Data Libraries — Manage' : 'Data Libraries — Browse';
  const subtitle = mode === 'manage' ? 'Add, edit and manage library data elements' : 'Select data elements to assign';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: V.bgSurface,
          borderRadius: V.r4,
          width: '90vw',
          height: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: V.shadow3,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: V.s4,
            borderBottom: `1px solid ${V.borderLight}`,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: V.lg, fontWeight: 700, color: V.textPrimary, fontFamily: V.font }}>
              {title}
            </h2>
            <p
              style={{
                margin: `${V.s1} 0 0 0`,
                fontSize: V.sm,
                color: V.textSecondary,
                fontFamily: V.font,
              }}
            >
              {subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: 'none',
              background: 'transparent',
              color: V.textSecondary,
              cursor: 'pointer',
              fontSize: '28px',
              padding: 0,
              lineHeight: 1,
              fontFamily: V.font,
            }}
          >
            ×
          </button>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Left panel: Libraries list */}
          <div
            style={{
              width: '220px',
              borderRight: `1px solid ${V.borderLight}`,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Libraries header */}
            <div
              style={{
                padding: `${V.s3} ${V.s3}`,
                borderBottom: `1px solid ${V.borderLight}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: V.s2,
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: V.xs,
                  fontWeight: 700,
                  color: V.textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontFamily: V.font,
                }}
              >
                Libraries
              </span>
              {mode === 'manage' && (
                <button
                  type="button"
                  title="Create library"
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: V.primary,
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: 0,
                    lineHeight: 1,
                  }}
                >
                  +
                </button>
              )}
            </div>

            {/* Libraries list */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {libraries.map((lib) => (
                <div
                  key={lib.id}
                  onClick={() => setActiveLibId(lib.id)}
                  style={{
                    padding: `${V.s2} ${V.s3}`,
                    borderBottom: `1px solid ${V.borderLight}`,
                    cursor: 'pointer',
                    backgroundColor: activeLibId === lib.id ? V.bgSelected : 'transparent',
                    transition: 'background-color 0.1s',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: V.s2,
                      marginBottom: V.s1,
                    }}
                  >
                    <span style={{ fontSize: V.md }}>{lib.icon}</span>
                    <span
                      style={{
                        fontWeight: 600,
                        color: activeLibId === lib.id ? V.primary : V.textPrimary,
                        fontSize: V.sm,
                        fontFamily: V.font,
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {lib.name}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: V.xs,
                      color: V.textSecondary,
                      fontFamily: V.font,
                    }}
                  >
                    {lib.rows?.length ?? 0} rows
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel: Table */}
          {activeLib ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {/* Table toolbar */}
              <div
                style={{
                  padding: V.s3,
                  borderBottom: `1px solid ${V.borderLight}`,
                  display: 'flex',
                  gap: V.s2,
                  alignItems: 'center',
                  flexShrink: 0,
                  flexWrap: 'wrap',
                }}
              >
                <input
                  type="text"
                  placeholder="Search label, code, key..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    padding: `${V.s2} ${V.s3}`,
                    border: `1px solid ${V.border}`,
                    borderRadius: V.r3,
                    fontSize: V.sm,
                    fontFamily: V.font,
                    color: V.textPrimary,
                    backgroundColor: V.bgSurface,
                    outline: 'none',
                    minWidth: '200px',
                    flex: 1,
                  }}
                />

                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedSubCategory('');
                  }}
                  style={{
                    padding: `${V.s2} ${V.s3}`,
                    border: `1px solid ${V.border}`,
                    borderRadius: V.r3,
                    fontSize: V.sm,
                    fontFamily: V.font,
                    color: V.textPrimary,
                    backgroundColor: V.bgSurface,
                  }}
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedSubCategory}
                  onChange={(e) => setSelectedSubCategory(e.target.value)}
                  style={{
                    padding: `${V.s2} ${V.s3}`,
                    border: `1px solid ${V.border}`,
                    borderRadius: V.r3,
                    fontSize: V.sm,
                    fontFamily: V.font,
                    color: V.textPrimary,
                    backgroundColor: V.bgSurface,
                  }}
                >
                  <option value="">All Sub-Categories</option>
                  {subCategories.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: V.s2,
                    fontSize: V.sm,
                    color: V.textSecondary,
                    fontFamily: V.font,
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={groupByCategory}
                    onChange={(e) => setGroupByCategory(e.target.checked)}
                  />
                  Group by Category
                </label>

                <span
                  style={{
                    fontSize: V.xs,
                    color: V.textSecondary,
                    fontFamily: V.font,
                    marginLeft: 'auto',
                  }}
                >
                  {filteredRows.length} of {rows.length} rows
                </span>

                {mode === 'manage' && (
                  <button
                    type="button"
                    style={{
                      padding: `${V.s2} ${V.s3}`,
                      border: 'none',
                      borderRadius: V.r3,
                      backgroundColor: V.primary,
                      color: V.bgSurface,
                      cursor: 'pointer',
                      fontSize: V.sm,
                      fontWeight: 600,
                      fontFamily: V.font,
                    }}
                  >
                    + Add Row
                  </button>
                )}
              </div>

              {/* Table content */}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: V.sm,
                    fontFamily: V.font,
                  }}
                >
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${V.borderLight}`, backgroundColor: V.bgApp }}>
                      {mode === 'browse' && (
                        <th
                          style={{
                            padding: `${V.s2} ${V.s3}`,
                            textAlign: 'left',
                            fontWeight: 600,
                            color: V.textSecondary,
                            width: '40px',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedRows.size === filteredRows.length && filteredRows.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRows(new Set(filteredRows.map((r) => r.id)));
                              } else {
                                setSelectedRows(new Set());
                              }
                            }}
                          />
                        </th>
                      )}
                      <th style={{ padding: `${V.s2} ${V.s3}`, textAlign: 'left', fontWeight: 600, color: V.primary }}>
                        LABEL
                      </th>
                      <th style={{ padding: `${V.s2} ${V.s3}`, textAlign: 'left', fontWeight: 600, color: V.textSecondary }}>
                        CODE
                      </th>
                      <th style={{ padding: `${V.s2} ${V.s3}`, textAlign: 'left', fontWeight: 600, color: V.textSecondary }}>
                        EXPORT KEY
                      </th>
                      <th style={{ padding: `${V.s2} ${V.s3}`, textAlign: 'left', fontWeight: 600, color: V.textSecondary }}>
                        CATEGORY
                      </th>
                      <th style={{ padding: `${V.s2} ${V.s3}`, textAlign: 'left', fontWeight: 600, color: V.textSecondary }}>
                        SUB-CAT
                      </th>
                      {mode === 'manage' && (
                        <th style={{ padding: `${V.s2} ${V.s3}`, textAlign: 'right', fontWeight: 600, color: V.textSecondary }}>
                          ACTIONS
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row) => (
                      <tr
                        key={row.id}
                        style={{
                          borderBottom: `1px solid ${V.borderLight}`,
                          backgroundColor: mode === 'browse' && selectedRows.has(row.id) ? V.bgSelected : 'transparent',
                          transition: 'background-color 0.1s',
                        }}
                      >
                        {mode === 'browse' && (
                          <td style={{ padding: `${V.s2} ${V.s3}` }}>
                            <input
                              type="checkbox"
                              checked={selectedRows.has(row.id)}
                              onChange={() => handleSelectRow(row.id)}
                            />
                          </td>
                        )}
                        <td style={{ padding: `${V.s2} ${V.s3}`, color: V.textPrimary }}>
                          {row.label}
                        </td>
                        <td style={{ padding: `${V.s2} ${V.s3}`, color: V.textSecondary }}>
                          {row.code || '—'}
                        </td>
                        <td
                          style={{
                            padding: `${V.s2} ${V.s3}`,
                            color: V.primary,
                            fontWeight: 600,
                          }}
                        >
                          {row.exportKey}
                        </td>
                        <td style={{ padding: `${V.s2} ${V.s3}`, color: V.textSecondary }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: `${V.s1} ${V.s2}`,
                              borderRadius: V.r2,
                              backgroundColor: V.bgApp,
                              fontSize: V.xs,
                            }}
                          >
                            {row.category}
                          </span>
                        </td>
                        <td style={{ padding: `${V.s2} ${V.s3}`, color: V.textSecondary }}>
                          {row.subCategory}
                        </td>
                        {mode === 'manage' && (
                          <td style={{ padding: `${V.s2} ${V.s3}`, textAlign: 'right' }}>
                            <button
                              type="button"
                              style={{
                                border: 'none',
                                background: 'transparent',
                                color: V.primary,
                                cursor: 'pointer',
                                fontSize: V.sm,
                                fontFamily: V.font,
                              }}
                            >
                              Edit
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredRows.length === 0 && (
                  <div
                    style={{
                      padding: V.s6,
                      textAlign: 'center',
                      color: V.textSecondary,
                      fontFamily: V.font,
                    }}
                  >
                    No rows match the current filters
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: V.textSecondary,
                fontFamily: V.font,
              }}
            >
              No libraries available
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: V.s4,
            borderTop: `1px solid ${V.borderLight}`,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: V.s2,
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: `${V.s2} ${V.s4}`,
              border: `1px solid ${V.border}`,
              borderRadius: V.r3,
              backgroundColor: V.bgSurface,
              color: V.textPrimary,
              cursor: 'pointer',
              fontSize: V.sm,
              fontWeight: 600,
              fontFamily: V.font,
            }}
          >
            {mode === 'manage' ? 'Done' : 'Cancel'}
          </button>
          {mode === 'browse' && (
            <button
              type="button"
              onClick={handleAssignKeys}
              disabled={selectedRows.size === 0}
              style={{
                padding: `${V.s2} ${V.s4}`,
                border: 'none',
                borderRadius: V.r3,
                backgroundColor: selectedRows.size === 0 ? V.textDisabled : V.primary,
                color: V.bgSurface,
                cursor: selectedRows.size === 0 ? 'not-allowed' : 'pointer',
                fontSize: V.sm,
                fontWeight: 600,
                fontFamily: V.font,
              }}
            >
              Assign {selectedRows.size} Key{selectedRows.size !== 1 ? 's' : ''}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
