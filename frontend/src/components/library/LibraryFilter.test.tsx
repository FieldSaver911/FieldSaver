/**
 * Component tests for LibraryFilter.
 *
 * LibraryFilter is a controlled component — it receives filter state and
 * calls onChange when any control is updated. No store or API dependencies.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LibraryFilter } from './LibraryFilter';
import type { LibraryFilterValues } from './LibraryFilter';

const defaultFilters: LibraryFilterValues = {
  search: '',
  categories: [],
  sortBy: 'none',
};

// ─── Search input ─────────────────────────────────────────────────────────────

describe('LibraryFilter — search input', () => {
  it('should render a search input', () => {
    render(
      <LibraryFilter
        availableCategories={['Data Element', 'NOT Value']}
        filters={defaultFilters}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByPlaceholderText(/search label or code/i)).toBeInTheDocument();
  });

  it('should call onChange with the updated search value when the user types', () => {
    const onChange = vi.fn();
    render(
      <LibraryFilter
        availableCategories={[]}
        filters={defaultFilters}
        onChange={onChange}
      />,
    );
    fireEvent.change(screen.getByPlaceholderText(/search label or code/i), {
      target: { value: 'systolic' },
    });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'systolic' }),
    );
  });

  it('should preserve the current categories and sortBy when search changes', () => {
    const onChange = vi.fn();
    const filters: LibraryFilterValues = { search: '', categories: ['Data Element'], sortBy: 'label' };
    render(
      <LibraryFilter availableCategories={['Data Element']} filters={filters} onChange={onChange} />,
    );
    fireEvent.change(screen.getByPlaceholderText(/search label or code/i), {
      target: { value: 'heart' },
    });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ categories: ['Data Element'], sortBy: 'label' }),
    );
  });

  it('should reflect the current search value from the filters prop', () => {
    const filters: LibraryFilterValues = { search: 'pre-filled', categories: [], sortBy: 'none' };
    render(
      <LibraryFilter availableCategories={[]} filters={filters} onChange={vi.fn()} />,
    );
    const input = screen.getByPlaceholderText(/search label or code/i) as HTMLInputElement;
    expect(input.value).toBe('pre-filled');
  });
});

// ─── Sort picker ──────────────────────────────────────────────────────────────

describe('LibraryFilter — sort picker', () => {
  it('should render the sort picker with "Default Order" selected by default', () => {
    render(
      <LibraryFilter availableCategories={[]} filters={defaultFilters} onChange={vi.fn()} />,
    );
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('none');
  });

  it('should call onChange with sortBy=category when the category sort option is selected', () => {
    const onChange = vi.fn();
    render(
      <LibraryFilter availableCategories={[]} filters={defaultFilters} onChange={onChange} />,
    );
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'category' } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ sortBy: 'category' }),
    );
  });

  it('should call onChange with sortBy=label when the label sort option is selected', () => {
    const onChange = vi.fn();
    render(
      <LibraryFilter availableCategories={[]} filters={defaultFilters} onChange={onChange} />,
    );
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'label' } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ sortBy: 'label' }),
    );
  });

  it('should call onChange with sortBy=subCategory when the sub-category sort option is selected', () => {
    const onChange = vi.fn();
    render(
      <LibraryFilter availableCategories={[]} filters={defaultFilters} onChange={onChange} />,
    );
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'subCategory' } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ sortBy: 'subCategory' }),
    );
  });

  it('should preserve search and categories when sortBy changes', () => {
    const onChange = vi.fn();
    const filters: LibraryFilterValues = { search: 'test', categories: ['Data Element'], sortBy: 'none' };
    render(
      <LibraryFilter availableCategories={['Data Element']} filters={filters} onChange={onChange} />,
    );
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'label' } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'test', categories: ['Data Element'] }),
    );
  });

  it('should render all four sort options in the picker', () => {
    render(
      <LibraryFilter availableCategories={[]} filters={defaultFilters} onChange={vi.fn()} />,
    );
    const select = screen.getByRole('combobox');
    const options = select.querySelectorAll('option');
    const values = Array.from(options).map((o) => (o as HTMLOptionElement).value);
    expect(values).toContain('none');
    expect(values).toContain('label');
    expect(values).toContain('category');
    expect(values).toContain('subCategory');
  });
});

// ─── Category dropdown ────────────────────────────────────────────────────────

describe('LibraryFilter — category dropdown', () => {
  it('should show "All Categories" button when no categories are selected', () => {
    render(
      <LibraryFilter
        availableCategories={['Data Element', 'NOT Value']}
        filters={defaultFilters}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: /all categories/i })).toBeInTheDocument();
  });

  it('should show the category name in the button when exactly one category is selected', () => {
    render(
      <LibraryFilter
        availableCategories={['Data Element', 'NOT Value']}
        filters={{ ...defaultFilters, categories: ['Data Element'] }}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: /data element/i })).toBeInTheDocument();
  });

  it('should show "N selected" in the button when two or more categories are selected', () => {
    render(
      <LibraryFilter
        availableCategories={['Data Element', 'NOT Value']}
        filters={{ ...defaultFilters, categories: ['Data Element', 'NOT Value'] }}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: /2 selected/i })).toBeInTheDocument();
  });

  it('should open the category dropdown when the category button is clicked', async () => {
    render(
      <LibraryFilter
        availableCategories={['Data Element', 'NOT Value']}
        filters={defaultFilters}
        onChange={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /all categories/i }));
    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: 'Data Element' })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: 'NOT Value' })).toBeInTheDocument();
    });
  });

  it('should call onChange with the toggled category when a checkbox is clicked', async () => {
    const onChange = vi.fn();
    render(
      <LibraryFilter
        availableCategories={['Data Element', 'NOT Value']}
        filters={defaultFilters}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /all categories/i }));
    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: 'Data Element' })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('checkbox', { name: 'Data Element' }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ categories: ['Data Element'] }),
    );
  });

  it('should call onChange with an empty categories array when Clear filters is clicked', async () => {
    const onChange = vi.fn();
    render(
      <LibraryFilter
        availableCategories={['Data Element', 'NOT Value']}
        filters={{ ...defaultFilters, categories: ['Data Element'] }}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /data element/i }));
    await waitFor(() => {
      expect(screen.getByText('Clear filters')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Clear filters'));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ categories: [] }),
    );
  });

  it('should uncheck a category that was previously selected when its checkbox is clicked', async () => {
    const onChange = vi.fn();
    render(
      <LibraryFilter
        availableCategories={['Data Element', 'NOT Value']}
        filters={{ ...defaultFilters, categories: ['Data Element'] }}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /data element/i }));
    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: 'Data Element' })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('checkbox', { name: 'Data Element' }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ categories: [] }),
    );
  });
});
