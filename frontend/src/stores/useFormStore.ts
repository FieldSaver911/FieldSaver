import { create } from 'zustand';
import type { Form, Page, Section, Row, Field, FormSettings } from '@fieldsaver/shared';
import { formsApi } from '../api/forms';

interface FormStore {
  // State
  form: Form | null;
  activePId: string | null;
  activeSId: string | null;
  selFId: string | null;
  isDirty: boolean;
  isSaving: boolean;
  saveError: string | null;

  // Derived (computed from form)
  activePage: Page | null;
  activeSection: Section | null;
  selectedField: Field | null;

  // Actions — form level
  loadForm: (id: string) => Promise<void>;
  setForm: (form: Form) => void;

  // Actions — navigation
  setActivePage: (pageId: string) => void;
  setActiveSection: (sectionId: string) => void;
  setSelectedField: (fieldId: string | null) => void;

  // Actions — pages
  patchPage: (pageId: string, patch: Partial<Page>) => void;
  addPage: () => void;
  deletePage: (pageId: string) => void;
  renamePage: (pageId: string, title: string) => void;

  // Actions — sections
  patchSection: (pageId: string, secId: string, patch: Partial<Section>) => void;
  addSection: (pageId: string) => void;
  deleteSection: (pageId: string, secId: string) => void;

  // Actions — rows
  setRows: (rows: Row[]) => void;
  moveRow: (
    fromPageId: string,
    fromSectionId: string,
    fromRowId: string,
    toPageId: string,
    toSectionId: string,
    toInsertIndex: number
  ) => void;
  moveSection: (
    fromPageId: string,
    fromSectionId: string,
    toPageId: string,
    toInsertIndex: number
  ) => void;
  moveColumn: (
    fromPageId: string,
    fromSectionId: string,
    fromRowId: string,
    fromCellId: string,
    toPageId: string,
    toSectionId: string
  ) => void;

  // Actions — settings
  updateSettings: (patch: Partial<FormSettings>) => void;

  // Actions — save
  save: () => Promise<void>;
  markDirty: () => void;
}

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

function makeSection(n: number): Section {
  return {
    id: uid(),
    title: `Section ${n}`,
    settings: { repeatable: false, repeatLabel: '+ Add Another', maxRepeats: 5 },
    rows: [],
  };
}

function makePage(n: number): Page {
  return {
    id: uid(),
    title: `Page ${n}`,
    description: '',
    sections: [makeSection(1)],
  };
}

export const useFormStore = create<FormStore>((set, get) => ({
  form: null,
  activePId: null,
  activeSId: null,
  selFId: null,
  isDirty: false,
  isSaving: false,
  saveError: null,
  activePage: null,
  activeSection: null,
  selectedField: null,

  loadForm: async (id: string) => {
    const form = await formsApi.getById(id);
    const firstPage = form.data.pages[0];
    const firstSection = firstPage?.sections[0];
    set({
      form,
      activePId: firstPage?.id ?? null,
      activeSId: firstSection?.id ?? null,
      selFId: null,
      isDirty: false,
      activePage: firstPage ?? null,
      activeSection: firstSection ?? null,
      selectedField: null,
    });
  },

  setForm: (form: Form) => {
    const activePId = get().activePId ?? form.data.pages[0]?.id ?? null;
    const page = form.data.pages.find((p) => p.id === activePId) ?? form.data.pages[0] ?? null;
    const activeSId = get().activeSId ?? page?.sections[0]?.id ?? null;
    const section = page?.sections.find((s) => s.id === activeSId) ?? page?.sections[0] ?? null;
    set({ form, activePage: page, activeSection: section });
  },

  setActivePage: (pageId: string) => {
    const { form } = get();
    if (!form) return;
    const page = form.data.pages.find((p) => p.id === pageId) ?? null;
    const section = page?.sections[0] ?? null;
    set({ activePId: pageId, activeSId: section?.id ?? null, activePage: page, activeSection: section, selFId: null });
  },

  setActiveSection: (sectionId: string) => {
    const { form } = get();
    if (!form) return;

    // Search all pages to find the section
    let foundSection: Section | null = null;
    let foundPageId: string | null = null;

    for (const page of form.data.pages) {
      const section = page.sections.find((s) => s.id === sectionId);
      if (section) {
        foundSection = section;
        foundPageId = page.id;
        break;
      }
    }

    set({
      activePId: foundPageId,
      activeSId: sectionId,
      activeSection: foundSection,
      activePage: foundPageId ? form.data.pages.find((p) => p.id === foundPageId) ?? null : null,
      selFId: null
    });
  },

  setSelectedField: (fieldId: string | null) => {
    const { form, activePId, activeSId } = get();
    if (!fieldId || !form) { set({ selFId: null, selectedField: null }); return; }
    const page = form.data.pages.find((p) => p.id === activePId);
    const section = page?.sections.find((s) => s.id === activeSId);
    let found: Field | null = null;
    for (const row of section?.rows ?? []) {
      for (const cell of row.cells) {
        const f = cell.fields.find((fi) => fi.id === fieldId);
        if (f) { found = f; break; }
      }
      if (found) break;
    }
    set({ selFId: fieldId, selectedField: found });
  },

  patchPage: (pageId: string, patch: Partial<Page>) => {
    set((state) => {
      if (!state.form) return {};
      const pages = state.form.data.pages.map((p) => p.id === pageId ? { ...p, ...patch } : p);
      const form = { ...state.form, data: { ...state.form.data, pages } };
      const activePage = pages.find((p) => p.id === state.activePId) ?? state.activePage;
      return { form, activePage, isDirty: true };
    });
  },

  addPage: () => {
    set((state) => {
      if (!state.form) return {};
      const newPage = makePage(state.form.data.pages.length + 1);
      const pages = [...state.form.data.pages, newPage];
      const form = { ...state.form, data: { ...state.form.data, pages } };
      return { form, activePId: newPage.id, activeSId: newPage.sections[0].id, activePage: newPage, activeSection: newPage.sections[0], isDirty: true };
    });
  },

  deletePage: (pageId: string) => {
    set((state) => {
      if (!state.form || state.form.data.pages.length <= 1) return {};
      const pages = state.form.data.pages.filter((p) => p.id !== pageId);
      const form = { ...state.form, data: { ...state.form.data, pages } };
      const newActivePId = state.activePId === pageId ? (pages[0]?.id ?? null) : state.activePId;
      const newActivePage = pages.find((p) => p.id === newActivePId) ?? null;
      return { form, activePId: newActivePId, activePage: newActivePage, isDirty: true };
    });
  },

  renamePage: (pageId: string, title: string) => get().patchPage(pageId, { title }),

  patchSection: (pageId: string, secId: string, patch: Partial<Section>) => {
    set((state) => {
      if (!state.form) return {};
      const pages = state.form.data.pages.map((p) =>
        p.id !== pageId ? p : {
          ...p,
          sections: p.sections.map((s) => s.id === secId ? { ...s, ...patch } : s),
        },
      );
      const form = { ...state.form, data: { ...state.form.data, pages } };
      const activePage = pages.find((p) => p.id === state.activePId) ?? state.activePage;
      const activeSection = activePage?.sections.find((s) => s.id === state.activeSId) ?? state.activeSection;
      return { form, activePage, activeSection, isDirty: true };
    });
  },

  addSection: (pageId: string) => {
    set((state) => {
      if (!state.form) return {};
      const pg = state.form.data.pages.find((p) => p.id === pageId);
      if (!pg) return {};
      const newSection = makeSection(pg.sections.length + 1);
      const pages = state.form.data.pages.map((p) =>
        p.id !== pageId ? p : { ...p, sections: [...p.sections, newSection] },
      );
      const form = { ...state.form, data: { ...state.form.data, pages } };
      const updatedPage = form.data.pages.find((p) => p.id === pageId) ?? null;
      return { form, activePId: pageId, activePage: updatedPage, activeSId: newSection.id, activeSection: newSection, isDirty: true };
    });
  },

  deleteSection: (pageId: string, secId: string) => {
    set((state) => {
      if (!state.form) return {};
      const pg = state.form.data.pages.find((p) => p.id === pageId);
      if (!pg || pg.sections.length <= 1) return {};
      const pages = state.form.data.pages.map((p) =>
        p.id !== pageId ? p : { ...p, sections: p.sections.filter((s) => s.id !== secId) },
      );
      const form = { ...state.form, data: { ...state.form.data, pages } };

      // If the deleted section was active, switch to the first remaining section
      let newActiveSId = state.activeSId;
      let newActiveSection = state.activeSection;

      if (state.activeSId === secId) {
        const remainingPage = form.data.pages.find((p) => p.id === pageId);
        const firstSection = remainingPage?.sections[0] ?? null;
        newActiveSId = firstSection?.id ?? null;
        newActiveSection = firstSection ?? null;
      }

      const updatedPage = form.data.pages.find((p) => p.id === pageId) ?? null;
      return { form, activePage: updatedPage, activeSId: newActiveSId, activeSection: newActiveSection, isDirty: true };
    });
  },

  setRows: (rows: Row[]) => {
    const { activePId, activeSId } = get();
    if (activePId && activeSId) get().patchSection(activePId, activeSId, { rows });
  },

  moveRow: (
    fromPageId: string,
    fromSectionId: string,
    fromRowId: string,
    toPageId: string,
    toSectionId: string,
    toInsertIndex: number
  ) => {
    set((state) => {
      if (!state.form) return {};

      const rowToMove = state.form.data.pages
        .find((p) => p.id === fromPageId)
        ?.sections.find((s) => s.id === fromSectionId)
        ?.rows.find((r) => r.id === fromRowId);

      if (!rowToMove) return {};

      let updatedPages = state.form.data.pages;

      // Remove row from source section
      updatedPages = updatedPages.map((page) =>
        page.id !== fromPageId
          ? page
          : {
              ...page,
              sections: page.sections.map((section) =>
                section.id !== fromSectionId
                  ? section
                  : {
                      ...section,
                      rows: section.rows.filter((r) => r.id !== fromRowId),
                    }
              ),
            }
      );

      // Insert row into target section at insertIndex
      updatedPages = updatedPages.map((page) =>
        page.id !== toPageId
          ? page
          : {
              ...page,
              sections: page.sections.map((section) =>
                section.id !== toSectionId
                  ? section
                  : {
                      ...section,
                      rows: [
                        ...section.rows.slice(0, toInsertIndex),
                        rowToMove,
                        ...section.rows.slice(toInsertIndex),
                      ],
                    }
              ),
            }
      );

      const form = { ...state.form, data: { ...state.form.data, pages: updatedPages } };
      const activePage = updatedPages.find((p) => p.id === state.activePId) ?? state.activePage;
      const activeSection = activePage?.sections.find((s) => s.id === state.activeSId) ?? state.activeSection;

      return { form, activePage, activeSection, isDirty: true };
    });
  },

  moveSection: (
    fromPageId: string,
    fromSectionId: string,
    toPageId: string,
    toInsertIndex: number
  ) => {
    set((state) => {
      if (!state.form) return {};

      const sectionToMove = state.form.data.pages
        .find((p) => p.id === fromPageId)
        ?.sections.find((s) => s.id === fromSectionId);

      if (!sectionToMove) return {};

      let updatedPages = state.form.data.pages;

      // Remove section from source page
      updatedPages = updatedPages.map((page) =>
        page.id !== fromPageId
          ? page
          : {
              ...page,
              sections: page.sections.filter((s) => s.id !== fromSectionId),
            }
      );

      // Insert section into target page at insertIndex
      updatedPages = updatedPages.map((page) =>
        page.id !== toPageId
          ? page
          : {
              ...page,
              sections: [
                ...page.sections.slice(0, toInsertIndex),
                sectionToMove,
                ...page.sections.slice(toInsertIndex),
              ],
            }
      );

      const form = { ...state.form, data: { ...state.form.data, pages: updatedPages } };
      const activePage = updatedPages.find((p) => p.id === state.activePId) ?? state.activePage;
      const activeSection = activePage?.sections.find((s) => s.id === state.activeSId) ?? state.activeSection;

      return { form, activePage, activeSection, isDirty: true };
    });
  },

  moveColumn: (
    fromPageId: string,
    fromSectionId: string,
    fromRowId: string,
    fromCellId: string,
    toPageId: string,
    toSectionId: string
  ) => {
    set((state) => {
      if (!state.form) return {};

      let cellToMove: any = null;
      let updatedPages = state.form.data.pages;

      // Find and remove the cell from source row
      updatedPages = updatedPages.map((page) =>
        page.id !== fromPageId
          ? page
          : {
              ...page,
              sections: page.sections.map((section) =>
                section.id !== fromSectionId
                  ? section
                  : {
                      ...section,
                      rows: section.rows
                        .map((row) => {
                          if (row.id !== fromRowId) return row;

                          // Found the source row; find and extract the cell
                          const cellIndex = row.cells.findIndex((c) => c.id === fromCellId);
                          if (cellIndex === -1) return row;

                          cellToMove = row.cells[cellIndex];

                          // Remove cell and redistribute column spans evenly among remaining cells
                          const remainingCells = row.cells.filter((c) => c.id !== fromCellId);
                          if (remainingCells.length === 0) {
                            // Row is now empty; mark it for deletion
                            return { ...row, _delete: true } as any;
                          }

                          // Redistribute spans evenly: 12 columns / number of remaining cells
                          const newColCount = remainingCells.length;
                          const newColWidth = Math.floor(12 / newColCount);
                          const remainder = 12 % newColCount;

                          return {
                            ...row,
                            cells: remainingCells.map((cell, idx) => ({
                              ...cell,
                              span: newColWidth + (idx < remainder ? 1 : 0),
                            })),
                          };
                        })
                        .filter((row) => !(row as any)._delete), // Remove empty rows
                    }
              ),
            }
      );

      if (!cellToMove) return {};

      // Create new full-width row with the moved cell
      const newRow: Row = {
        id: Math.random().toString(36).slice(2, 9),
        preset: { label: '1 Column (Full)', hint: '', cols: [12] },
        cells: [
          {
            ...cellToMove,
            span: 12, // Full width
          },
        ],
      };

      // Append new row to target section
      updatedPages = updatedPages.map((page) =>
        page.id !== toPageId
          ? page
          : {
              ...page,
              sections: page.sections.map((section) =>
                section.id !== toSectionId
                  ? section
                  : {
                      ...section,
                      rows: [...section.rows, newRow],
                    }
              ),
            }
      );

      const form = { ...state.form, data: { ...state.form.data, pages: updatedPages } };
      const activePage = updatedPages.find((p) => p.id === state.activePId) ?? state.activePage;
      const activeSection = activePage?.sections.find((s) => s.id === state.activeSId) ?? state.activeSection;

      return { form, activePage, activeSection, isDirty: true };
    });
  },

  updateSettings: (patch) => {
    set((state) => {
      if (!state.form) return {};
      return {
        form: { ...state.form, settings: { ...state.form.settings, ...patch } },
        isDirty: true,
      };
    });
  },

  markDirty: () => set({ isDirty: true }),

  save: async () => {
    const { form } = get();
    if (!form) return;
    set({ isSaving: true, saveError: null });
    try {
      await formsApi.update(form.id, { data: form.data as unknown as Record<string, unknown>, settings: form.settings as unknown as Record<string, unknown>, name: form.name });
      set({ isDirty: false });
    } catch (e) {
      set({ saveError: (e as Error).message });
    } finally {
      set({ isSaving: false });
    }
  },
}));
