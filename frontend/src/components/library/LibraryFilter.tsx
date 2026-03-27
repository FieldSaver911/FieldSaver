import React from 'react';
import { V } from '../../constants/design';

export interface LibraryFilterValues {
  search: string;
  categories: string[];
  sortBy: 'category' | 'subCategory' | 'label' | 'none';
}

export interface LibraryFilterProps {
  availableCategories: string[];
  filters: LibraryFilterValues;
  onChange: (filters: LibraryFilterValues) => void;
}

const SORT_OPTIONS: { value: LibraryFilterValues['sortBy']; label: string }[] = [
  { value: 'none', label: 'Default Order' },
  { value: 'label', label: 'Sort by Label' },
  { value: 'category', label: 'Sort by Category' },
  { value: 'subCategory', label: 'Sort by Sub-Category' },
];

// ── CategoryCheckbox ─────────────────────────────────────────────────────────

interface CategoryCheckboxProps {
  category: string;
  checked: boolean;
  onToggle: (category: string) => void;
}

function CategoryCheckbox({ category, checked, onToggle }: CategoryCheckboxProps) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: V.s1,
        padding: `${V.s1} ${V.s2}`,
        cursor: 'pointer',
        borderRadius: V.r2,
        backgroundColor: checked ? V.bgSelected : 'transparent',
        color: checked ? V.primary : V.textPrimary,
        fontSize: V.sm,
        whiteSpace: 'nowrap',
        userSelect: 'none',
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onToggle(category)}
        style={{ accentColor: V.primary, cursor: 'pointer' }}
      />
      {category}
    </label>
  );
}

// ── CategoryDropdown ─────────────────────────────────────────────────────────

interface CategoryDropdownProps {
  availableCategories: string[];
  selectedCategories: string[];
  onToggle: (category: string) => void;
  onClear: () => void;
}

function CategoryDropdown({
  availableCategories,
  selectedCategories,
  onToggle,
  onClear,
}: CategoryDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const label =
    selectedCategories.length === 0
      ? 'All Categories'
      : selectedCategories.length === 1
        ? selectedCategories[0]
        : `${selectedCategories.length} selected`;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: V.s1,
          padding: `6px ${V.s2}`,
          border: `1px solid ${open ? V.borderFocus : V.border}`,
          borderRadius: V.r2,
          backgroundColor: V.bgSurface,
          color: V.textPrimary,
          fontSize: V.sm,
          cursor: 'pointer',
          minWidth: '140px',
          justifyContent: 'space-between',
          outline: 'none',
        }}
      >
        <span>{label}</span>
        <span style={{ color: V.textSecondary, fontSize: '10px' }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            zIndex: 200,
            backgroundColor: V.bgSurface,
            border: `1px solid ${V.border}`,
            borderRadius: V.r3,
            boxShadow: V.shadow2,
            padding: V.s1,
            minWidth: '180px',
          }}
        >
          {availableCategories.map((cat) => (
            <CategoryCheckbox
              key={cat}
              category={cat}
              checked={selectedCategories.includes(cat)}
              onToggle={onToggle}
            />
          ))}
          {selectedCategories.length > 0 && (
            <>
              <div
                style={{
                  borderTop: `1px solid ${V.borderLight}`,
                  margin: `${V.s1} 0`,
                }}
              />
              <button
                type="button"
                onClick={onClear}
                style={{
                  width: '100%',
                  padding: `${V.s1} ${V.s2}`,
                  border: 'none',
                  background: 'none',
                  color: V.negative,
                  fontSize: V.sm,
                  cursor: 'pointer',
                  textAlign: 'left',
                  borderRadius: V.r2,
                }}
              >
                Clear filters
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── LibraryFilter ────────────────────────────────────────────────────────────

export function LibraryFilter({ availableCategories, filters, onChange }: LibraryFilterProps) {
  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange({ ...filters, search: e.target.value });
  }

  function handleCategoryToggle(category: string) {
    const next = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onChange({ ...filters, categories: next });
  }

  function handleCategoryClear() {
    onChange({ ...filters, categories: [] });
  }

  function handleSortChange(e: React.ChangeEvent<HTMLSelectElement>) {
    onChange({ ...filters, sortBy: e.target.value as LibraryFilterValues['sortBy'] });
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: V.s2,
        padding: `${V.s2} ${V.s3}`,
        borderBottom: `1px solid ${V.borderLight}`,
        backgroundColor: V.bgApp,
        flexWrap: 'wrap',
      }}
    >
      {/* Search input */}
      <div style={{ position: 'relative', flex: '1 1 180px', minWidth: '140px' }}>
        <span
          style={{
            position: 'absolute',
            left: V.s2,
            top: '50%',
            transform: 'translateY(-50%)',
            color: V.textDisabled,
            fontSize: V.md,
            pointerEvents: 'none',
          }}
        >
          🔍
        </span>
        <input
          type="text"
          placeholder="Search label or code…"
          value={filters.search}
          onChange={handleSearchChange}
          style={{
            width: '100%',
            paddingLeft: '28px',
            paddingRight: V.s2,
            paddingTop: '6px',
            paddingBottom: '6px',
            border: `1px solid ${V.border}`,
            borderRadius: V.r2,
            fontSize: V.sm,
            color: V.textPrimary,
            backgroundColor: V.bgSurface,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Category filter */}
      <CategoryDropdown
        availableCategories={availableCategories}
        selectedCategories={filters.categories}
        onToggle={handleCategoryToggle}
        onClear={handleCategoryClear}
      />

      {/* Sort picker */}
      <select
        value={filters.sortBy}
        onChange={handleSortChange}
        style={{
          padding: `6px ${V.s2}`,
          border: `1px solid ${V.border}`,
          borderRadius: V.r2,
          backgroundColor: V.bgSurface,
          color: V.textPrimary,
          fontSize: V.sm,
          cursor: 'pointer',
          outline: 'none',
        }}
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
