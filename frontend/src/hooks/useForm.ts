import React from 'react';
import type { Field, Row, Section, Page, ColPreset } from '@fieldsaver/shared';
import { useFormStore } from '../stores/useFormStore';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface UseFormReturn {
  // Loading / error state
  isLoading: boolean;
  loadError: string | null;

  // Form-level
  formId: string | null;
  formName: string;
  formStatus: string;
  isDirty: boolean;
  isSaving: boolean;
  saveError: string | null;

  // Navigation state
  activePId: string | null;
  activeSId: string | null;
  selectedFieldId: string | null;

  // Derived
  pages: Page[];
  activePage: Page | null;
  activeSection: Section | null;
  selectedField: Field | null;

  // Field mutations
  addField: (type: Field['type']) => void;
  addFieldToCell: (type: Field['type'], cellId: string, insertBeforeIndex: number) => void;
  updateField: (fieldId: string, patch: Partial<Field>) => void;
  deleteField: (fieldId: string) => void;
  moveField: (fromCellId: string, fromIdx: number, toCellId: string, toIdx: number) => void;

  // Row mutations
  addRow: (preset: ColPreset) => void;
  deleteRow: (rowId: string) => void;
  setRows: (rows: Row[]) => void;

  // Section mutations
  addSection: () => void;
  deleteSection: (secId: string) => void;
  updateSection: (secId: string, patch: Partial<Section>) => void;

  // Page mutations
  addPage: () => void;
  deletePage: (pageId: string) => void;
  renamePage: (pageId: string, title: string) => void;
  updatePage: (pageId: string, patch: Partial<Page>) => void;

  // Navigation
  setActivePage: (pageId: string) => void;
  setActiveSection: (secId: string) => void;
  setSelectedField: (fieldId: string | null) => void;

  // Save
  save: () => Promise<void>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

function makeField(type: Field['type']): Field {
  return {
    id: uid(),
    type,
    label: '',
    required: false,
    placeholder: '',
    helpText: '',
    validation: {},
    libraryRows: [],
    dataAttrs: { showCategories: [], isNillable: false },
    behaviour: {
      defaultValue: '',
      memoryField: false,
      geoLocation: false,
      hideQuestion: false,
      enabled: true,
      hintText: '',
      excludeReport: false,
      timeStamp: false,
      hidden: false,
      color: '',
    },
    narrative: { valueText: '', notValueText: '' },
    settings: {},
  };
}

function makeRow(preset: ColPreset): Row {
  return {
    id: uid(),
    preset,
    cells: preset.cols.map(() => ({ id: uid(), fields: [] })),
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useForm(formId: string): UseFormReturn {
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  // Auto-save timer ref
  const saveTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const form = useFormStore((s) => s.form);
  const activePId = useFormStore((s) => s.activePId);
  const activeSId = useFormStore((s) => s.activeSId);
  const selFId = useFormStore((s) => s.selFId);
  const isDirty = useFormStore((s) => s.isDirty);
  const isSaving = useFormStore((s) => s.isSaving);
  const saveError = useFormStore((s) => s.saveError);
  const activePage = useFormStore((s) => s.activePage);
  const activeSection = useFormStore((s) => s.activeSection);
  const selectedField = useFormStore((s) => s.selectedField);

  // Actions — selected individually to avoid calling store without selector
  const loadForm = useFormStore((s) => s.loadForm);
  const saveAction = useFormStore((s) => s.save);
  const patchSection = useFormStore((s) => s.patchSection);
  const patchPage = useFormStore((s) => s.patchPage);
  const addSectionAction = useFormStore((s) => s.addSection);
  const deleteSectionAction = useFormStore((s) => s.deleteSection);
  const addPageAction = useFormStore((s) => s.addPage);
  const deletePageAction = useFormStore((s) => s.deletePage);
  const renamePageAction = useFormStore((s) => s.renamePage);
  const setActivePageAction = useFormStore((s) => s.setActivePage);
  const setActiveSectionAction = useFormStore((s) => s.setActiveSection);
  const setSelectedFieldAction = useFormStore((s) => s.setSelectedField);
  const setRowsAction = useFormStore((s) => s.setRows);

  // Load form on mount / formId change
  React.useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    loadForm(formId)
      .then(() => {
        if (!cancelled) setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setIsLoading(false);
          setLoadError(err instanceof Error ? err.message : 'Failed to load form');
        }
      });
    return () => { cancelled = true; };
  }, [formId, loadForm]);

  // Debounced auto-save — 2 s after last dirty change
  React.useEffect(() => {
    if (!isDirty) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveAction().catch(() => undefined);
    }, 2000);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [isDirty, saveAction]);

  // ── Field mutations ────────────────────────────────────────────────────────

  const addField = React.useCallback(
    (type: Field['type']): void => {
      if (!activePId || !activeSId || !form) return;
      const page = form.data.pages.find((p) => p.id === activePId);
      if (!page) return;
      const section = page.sections.find((s) => s.id === activeSId);
      if (!section) return;

      const defaultPreset: ColPreset = { label: 'Full', hint: '12 cols', cols: [12] };
      const newRow = makeRow(defaultPreset);
      newRow.cells[0].fields.push(makeField(type));
      patchSection(activePId, activeSId, {
        rows: [...section.rows, newRow],
      });
    },
    [activePId, activeSId, form, patchSection],
  );

  const addFieldToCell = React.useCallback(
    (type: Field['type'], cellId: string, insertBeforeIndex: number): void => {
      if (!activePId || !activeSId || !form) return;
      const page = form.data.pages.find((p) => p.id === activePId);
      if (!page) return;
      const section = page.sections.find((s) => s.id === activeSId);
      if (!section) return;

      const newField = makeField(type);
      const newRows: Row[] = section.rows.map((row) => ({
        ...row,
        cells: row.cells.map((cell) => {
          if (cell.id !== cellId) return cell;
          const fields = [...cell.fields];
          fields.splice(insertBeforeIndex, 0, newField);
          return { ...cell, fields };
        }),
      }));
      patchSection(activePId, activeSId, { rows: newRows });
    },
    [activePId, activeSId, form, patchSection],
  );

  const updateField = React.useCallback(
    (fieldId: string, patch: Partial<Field>): void => {
      if (!activePId || !activeSId || !form) return;
      const page = form.data.pages.find((p) => p.id === activePId);
      if (!page) return;
      const section = page.sections.find((s) => s.id === activeSId);
      if (!section) return;

      const newRows: Row[] = section.rows.map((row) => ({
        ...row,
        cells: row.cells.map((cell) => ({
          ...cell,
          fields: cell.fields.map((f) =>
            f.id === fieldId ? { ...f, ...patch } : f,
          ),
        })),
      }));
      patchSection(activePId, activeSId, { rows: newRows });
      // Update selected field reference in store
      setSelectedFieldAction(fieldId);
    },
    [activePId, activeSId, form, patchSection, setSelectedFieldAction],
  );

  const deleteField = React.useCallback(
    (fieldId: string): void => {
      if (!activePId || !activeSId || !form) return;
      const page = form.data.pages.find((p) => p.id === activePId);
      if (!page) return;
      const section = page.sections.find((s) => s.id === activeSId);
      if (!section) return;

      const newRows: Row[] = section.rows
        .map((row) => ({
          ...row,
          cells: row.cells.map((cell) => ({
            ...cell,
            fields: cell.fields.filter((f) => f.id !== fieldId),
          })),
        }))
        .filter((row) => row.cells.some((cell) => cell.fields.length > 0));

      patchSection(activePId, activeSId, { rows: newRows });
      if (selFId === fieldId) setSelectedFieldAction(null);
    },
    [activePId, activeSId, form, selFId, patchSection, setSelectedFieldAction],
  );

  const moveField = React.useCallback(
    (
      fromCellId: string,
      fromIdx: number,
      toCellId: string,
      toIdx: number,
    ): void => {
      if (!activePId || !activeSId || !form) return;
      const page = form.data.pages.find((p) => p.id === activePId);
      if (!page) return;
      const section = page.sections.find((s) => s.id === activeSId);
      if (!section) return;

      // Extract the field being moved
      let movingField: Field | null = null;
      let tempRows: Row[] = section.rows.map((row) => ({
        ...row,
        cells: row.cells.map((cell) => {
          if (cell.id !== fromCellId) return cell;
          const fields = [...cell.fields];
          const [removed] = fields.splice(fromIdx, 1);
          movingField = removed;
          return { ...cell, fields };
        }),
      }));

      if (!movingField) return;
      const fieldToMove = movingField;

      // Insert into target cell
      tempRows = tempRows.map((row) => ({
        ...row,
        cells: row.cells.map((cell) => {
          if (cell.id !== toCellId) return cell;
          const fields = [...cell.fields];
          fields.splice(toIdx, 0, fieldToMove);
          return { ...cell, fields };
        }),
      }));

      patchSection(activePId, activeSId, { rows: tempRows });
    },
    [activePId, activeSId, form, patchSection],
  );

  // ── Row mutations ──────────────────────────────────────────────────────────

  const addRow = React.useCallback(
    (preset: ColPreset): void => {
      if (!activePId || !activeSId || !form) return;
      const page = form.data.pages.find((p) => p.id === activePId);
      if (!page) return;
      const section = page.sections.find((s) => s.id === activeSId);
      if (!section) return;
      patchSection(activePId, activeSId, {
        rows: [...section.rows, makeRow(preset)],
      });
    },
    [activePId, activeSId, form, patchSection],
  );

  const deleteRow = React.useCallback(
    (rowId: string): void => {
      if (!activePId || !activeSId || !form) return;
      const page = form.data.pages.find((p) => p.id === activePId);
      if (!page) return;
      const section = page.sections.find((s) => s.id === activeSId);
      if (!section) return;
      patchSection(activePId, activeSId, {
        rows: section.rows.filter((r) => r.id !== rowId),
      });
    },
    [activePId, activeSId, form, patchSection],
  );

  // ── Section mutations ──────────────────────────────────────────────────────

  const addSection = React.useCallback((): void => {
    if (!activePId) return;
    addSectionAction(activePId);
  }, [activePId, addSectionAction]);

  const deleteSection = React.useCallback(
    (secId: string): void => {
      if (!activePId) return;
      deleteSectionAction(activePId, secId);
    },
    [activePId, deleteSectionAction],
  );

  const updateSection = React.useCallback(
    (secId: string, patch: Partial<Section>): void => {
      if (!activePId) return;
      patchSection(activePId, secId, patch);
    },
    [activePId, patchSection],
  );

  const updatePage = React.useCallback(
    (pageId: string, patch: Partial<Page>): void => {
      patchPage(pageId, patch);
    },
    [patchPage],
  );

  return {
    isLoading,
    loadError,

    formId: form?.id ?? null,
    formName: form?.name ?? '',
    formStatus: form?.status ?? 'draft',
    isDirty,
    isSaving,
    saveError,

    activePId,
    activeSId,
    selectedFieldId: selFId,

    pages: form?.data.pages ?? [],
    activePage,
    activeSection,
    selectedField,

    addField,
    addFieldToCell,
    updateField,
    deleteField,
    moveField,

    addRow,
    deleteRow,
    setRows: setRowsAction,

    addSection,
    deleteSection,
    updateSection,

    addPage: addPageAction,
    deletePage: deletePageAction,
    renamePage: renamePageAction,
    updatePage,

    setActivePage: setActivePageAction,
    setActiveSection: setActiveSectionAction,
    setSelectedField: setSelectedFieldAction,

    save: saveAction,
  };
}
