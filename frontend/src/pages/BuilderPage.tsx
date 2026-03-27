import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { ColPreset, Field, Page, Row, Section } from '@fieldsaver/shared';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { V } from '../constants/design';
import { Sidebar } from '../components/builder/Sidebar';
import { FieldTypesSidebar } from '../components/builder/FieldTypesSidebar';
import { Canvas, setPaletteDragActive } from '../components/builder/Canvas';
import { SettingsPanel } from '../components/builder/SettingsPanel';
import { FormSettingsPage } from '../components/settings/FormSettingsPage';
import { PreviewModal } from '../components/preview/PreviewModal';
import { DragOverlayContent } from '../components/dnd/DragOverlayContent';
import { useForm } from '../hooks/useForm';
import { useFormDnd } from '../hooks/useFormDnd';
import { useDndSensors } from '../components/dnd/useDndSensors';
import { useFormStore } from '../stores/useFormStore';
import { formsApi } from '../api/forms';

// ─── TopBar ───────────────────────────────────────────────────────────────────

interface TopBarProps {
  formName: string;
  onPreview: () => void;
  onSettings: () => void;
  onPublish: () => void;
  onBack: () => void;
}

function TopBar({
  formName,
  onPreview,
  onSettings,
  onPublish,
  onBack,
}: TopBarProps) {
  return (
    <div
      style={{
        height: '60px',
        flexShrink: 0,
        backgroundColor: V.bgSurface,
        borderBottom: `1px solid ${V.borderLight}`,
        display: 'flex',
        alignItems: 'center',
        padding: `0 ${V.s4}`,
        gap: V.s3,
        zIndex: 20,
      }}
    >
      {/* Left section: Back button, form icon and name */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: V.s3,
        }}
      >
        {/* Back button */}
        <button
          type="button"
          onClick={onBack}
          title="Back to form manager"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            border: 'none',
            borderRadius: V.r2,
            backgroundColor: 'transparent',
            color: V.textSecondary,
            cursor: 'pointer',
            transition: 'all 0.12s',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = V.bgHover;
            e.currentTarget.style.color = V.primary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = V.textSecondary;
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13L3 8l7-5"/>
            <line x1="3" y1="8" x2="13" y2="8"/>
          </svg>
        </button>

        {/* Form icon */}
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            backgroundColor: V.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          ⊞
        </div>

        {/* Form name */}
        <span
          style={{
            fontSize: V.md,
            fontWeight: 600,
            color: V.textPrimary,
            fontFamily: V.font,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '280px',
          }}
          title={formName}
        >
          {formName || 'Untitled Form'}
        </span>
      </div>

      {/* Divider */}
      <div
        style={{
          width: '1px',
          height: '24px',
          backgroundColor: V.borderLight,
          margin: `0 ${V.s1}`,
        }}
      />

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Right section: Action buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: V.s2,
        }}
      >
        {/* Narrative button */}
        <button
          type="button"
          onClick={() => {/* TODO: open narrative builder */}}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: V.s1,
            padding: `${V.s2} ${V.s3}`,
            border: 'none',
            borderRadius: V.r2,
            backgroundColor: 'transparent',
            color: V.textSecondary,
            cursor: 'pointer',
            fontSize: V.sm,
            fontFamily: V.font,
            transition: 'color 0.12s, background-color 0.12s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = V.bgHover;
            e.currentTarget.style.color = V.textPrimary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = V.textSecondary;
          }}
          title="Narrative builder"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h12M2 7h12M2 11h8"/>
          </svg>
          Narrative
        </button>

        {/* Settings button */}
        <button
          type="button"
          onClick={onSettings}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: V.s1,
            padding: `${V.s2} ${V.s3}`,
            border: 'none',
            borderRadius: V.r2,
            backgroundColor: 'transparent',
            color: V.textSecondary,
            cursor: 'pointer',
            fontSize: V.sm,
            fontFamily: V.font,
            transition: 'color 0.12s, background-color 0.12s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = V.bgHover;
            e.currentTarget.style.color = V.textPrimary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = V.textSecondary;
          }}
          title="Form settings"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="8" r="2"/>
            <path d="M8 1v2M8 13v2M15 8h-2M3 8H1M13 3l-1.4 1.4M4.4 12.6L3 14M13 13l-1.4-1.4M4.4 3.4L3 2"/>
          </svg>
          Settings
        </button>

        {/* Libraries button */}
        <button
          type="button"
          onClick={() => {/* TODO: open libraries panel */}}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: V.s1,
            padding: `${V.s2} ${V.s3}`,
            border: 'none',
            borderRadius: V.r2,
            backgroundColor: 'transparent',
            color: V.textSecondary,
            cursor: 'pointer',
            fontSize: V.sm,
            fontFamily: V.font,
            transition: 'color 0.12s, background-color 0.12s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = V.bgHover;
            e.currentTarget.style.color = V.textPrimary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = V.textSecondary;
          }}
          title="Data libraries"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 4h12M2 8h12M2 12h12M1 2v12c0 .5.5 1 1 1h12c.5 0 1-.5 1-1V2"/>
          </svg>
          Libraries
        </button>

        {/* Export button */}
        <button
          type="button"
          onClick={() => {/* TODO: export form */}}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: V.s1,
            padding: `${V.s2} ${V.s3}`,
            border: 'none',
            borderRadius: V.r2,
            backgroundColor: 'transparent',
            color: V.textSecondary,
            cursor: 'pointer',
            fontSize: V.sm,
            fontFamily: V.font,
            transition: 'color 0.12s, background-color 0.12s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = V.bgHover;
            e.currentTarget.style.color = V.textPrimary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = V.textSecondary;
          }}
          title="Export form"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 1v10M3 6l5 5 5-5M2 14h12"/>
          </svg>
          Export
        </button>

        {/* Preview button - outlined */}
        <button
          type="button"
          onClick={onPreview}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: V.s1,
            padding: `${V.s2} ${V.s3}`,
            border: `1px solid ${V.border}`,
            borderRadius: V.r2,
            backgroundColor: V.bgSurface,
            color: V.textSecondary,
            cursor: 'pointer',
            fontSize: V.sm,
            fontFamily: V.font,
            transition: 'all 0.12s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = V.primary;
            e.currentTarget.style.color = V.primary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = V.border;
            e.currentTarget.style.color = V.textSecondary;
          }}
          title="Preview form"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3C4 3 1 8 1 8s3 5 7 5 7-5 7-5-3-5-7-5zM8 10a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/>
          </svg>
          Preview
        </button>

        {/* Publish button - primary */}
        <button
          type="button"
          onClick={onPublish}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: V.s1,
            padding: `${V.s2} ${V.s4}`,
            border: 'none',
            borderRadius: V.r2,
            backgroundColor: V.primary,
            color: '#ffffff',
            cursor: 'pointer',
            fontSize: V.sm,
            fontWeight: 600,
            fontFamily: V.font,
            transition: 'all 0.12s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#4a47a3';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = V.primary;
          }}
          title="Publish form"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 8l4 4 8-10"/>
          </svg>
          Publish
        </button>
      </div>
    </div>
  );
}

// ─── LoadingScreen ────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: V.bgApp,
        flexDirection: 'column',
        gap: V.s4,
      }}
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          border: `3px solid ${V.borderLight}`,
          borderTopColor: V.primary,
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <span style={{ color: V.textSecondary, fontSize: V.sm, fontFamily: V.font }}>
        Loading form…
      </span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── ErrorScreen ──────────────────────────────────────────────────────────────

interface ErrorScreenProps {
  message: string;
  onBack: () => void;
}

function ErrorScreen({ message, onBack }: ErrorScreenProps) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: V.bgApp,
        flexDirection: 'column',
        gap: V.s4,
      }}
    >
      <div style={{ fontSize: '36px' }}>⚠️</div>
      <div style={{ fontSize: V.md, color: V.textPrimary, fontFamily: V.font, fontWeight: 600 }}>
        Failed to load form
      </div>
      <div style={{ fontSize: V.sm, color: V.textSecondary, fontFamily: V.font }}>{message}</div>
      <button
        type="button"
        onClick={onBack}
        style={{
          padding: `${V.s2} ${V.s4}`,
          border: `1px solid ${V.border}`,
          borderRadius: V.r3,
          backgroundColor: V.bgSurface,
          color: V.textPrimary,
          cursor: 'pointer',
          fontSize: V.sm,
          fontFamily: V.font,
        }}
      >
        Back to forms
      </button>
    </div>
  );
}

// ─── BuilderPage ──────────────────────────────────────────────────────────────

export function BuilderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    navigate('/forms', { replace: true });
    return null;
  }

  return <BuilderPageInner formId={id} />;
}

// Inner component so we always have a valid formId string
interface BuilderPageInnerProps {
  formId: string;
}

// ─── Drag types ───────────────────────────────────────────────────────────────

interface ColumnDrag {
  cellId: string;
  rowId: string;
  fields: any[];
  span: number;
}

// ─── BuilderPageInner ─────────────────────────────────────────────────────────

function BuilderPageInner({ formId }: BuilderPageInnerProps) {
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [columnDrag, setColumnDrag] = React.useState<ColumnDrag | null>(null);

  // DnD setup
  const dndSensors = useDndSensors();
  const { activeItem, handleDragStart, handleDragOver, handleDragEnd, handleDragCancel } =
    useFormDnd();

  const form = useFormStore((s) => s.form);
  const {
    isLoading,
    loadError,
    formName,
    activePId,
    activeSId,
    selectedFieldId,
    pages,
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
    addSection,
    deleteSection,
    updateSection,
    addPage,
    deletePage,
    renamePage,
    updatePage,
    setActivePage,
    setActiveSection,
    setSelectedField,
    save,
  } = useForm(formId);

  const handlePublish = async () => {
    try {
      await formsApi.publish(formId);
      // Reload to reflect published status
      await save();
    } catch {
      // handle silently; TODO: toast
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleSaveSettings = React.useCallback(
    async (settings: any) => {
      const updateSettings = useFormStore.getState().updateSettings;
      updateSettings(settings);
      await save();
      setShowSettings(false);
    },
    [save],
  );

  const handleStatusChange = React.useCallback(
    async (status: any) => {
      try {
        await formsApi.update(formId, { status });
      } catch {
        // handle silently; TODO: toast
      }
    },
    [formId],
  );

  const handleUpdateField = React.useCallback(
    (patch: Partial<Field>) => {
      if (selectedFieldId) updateField(selectedFieldId, patch);
    },
    [selectedFieldId, updateField],
  );

  const handleUpdatePage = React.useCallback(
    (patch: Partial<Page>) => {
      if (activePId) updatePage(activePId, patch);
    },
    [activePId, updatePage],
  );

  const handleUpdateSectionSettings = React.useCallback(
    (patch: Partial<Section>) => {
      if (activeSId && activePId) updateSection(activeSId, patch);
    },
    [activeSId, activePId, updateSection],
  );

  const handleAddRow = React.useCallback(
    (secId: string, preset: ColPreset) => {
      addRow(secId, preset);
    },
    [addRow],
  );

  const handleUpdateSectionCb = React.useCallback(
    (secId: string, patch: Partial<Section>) => {
      updateSection(secId, patch);
    },
    [updateSection],
  );

  const handleDeleteSectionCb = React.useCallback(
    (secId: string) => {
      deleteSection(secId);
    },
    [deleteSection],
  );

  const handleUpdateRowCb = React.useCallback(
    (secId: string, rowId: string, patch: Partial<Row>) => {
      if (!activePId) return;
      const page = pages.find((p) => p.id === activePId);
      if (!page) return;
      const section = page.sections.find((s) => s.id === secId);
      if (!section) return;
      const updatedRows = section.rows.map((row) => {
        if (row.id !== rowId) return row;

        // When preset changes, rebuild cells to match new column count
        if (patch.preset) {
          const newCells = patch.preset.cols.map((_, i) =>
            row.cells[i] || { id: crypto.randomUUID(), fields: [] }
          );
          return { ...row, ...patch, cells: newCells };
        }

        return { ...row, ...patch };
      });
      updateSection(secId, { rows: updatedRows });
    },
    [activePId, pages, updateSection],
  );

  // Select first section when changing to a new section
  const handleSelectSection = React.useCallback(
    (secId: string) => {
      setActiveSection(secId);
      setSelectedField(null);
    },
    [setActiveSection, setSelectedField],
  );

  const handleSelectField = React.useCallback(
    (fieldId: string) => {
      if (fieldId) setSelectedField(fieldId);
    },
    [setSelectedField],
  );

  const handlePaletteDragStart = React.useCallback(
    (_type: Field['type']) => {
      setPaletteDragActive(true);
    },
    [],
  );

  const handlePaletteDragEnd = React.useCallback(() => {
    setPaletteDragActive(false);
  }, []);

  const handleDeleteField = React.useCallback(
    (fieldId: string) => {
      deleteField(fieldId);
    },
    [deleteField],
  );

  // Sidebar section delete: switch to the target page first, then delete
  const handleSidebarDeleteSection = React.useCallback(
    (pageId: string, secId: string) => {
      setActivePage(pageId);
      deleteSection(secId);
    },
    [setActivePage, deleteSection],
  );

  const handleSidebarAddSection = React.useCallback(
    (pageId: string) => {
      addSection(pageId);
    },
    [addSection],
  );

  const handleColumnDropToSection = React.useCallback(
    (pageId: string, secId: string) => {
      if (!columnDrag || !activeSId || !activeSection) return;

      // Update source section (remove cell from source row)
      const { rowId, fields } = columnDrag;
      const sourceRow = activeSection.rows.find((r) => r.id === rowId);
      if (!sourceRow) return;

      let updatedRows = activeSection.rows;
      const cellIndex = sourceRow.cells.findIndex((c) => c.id === columnDrag.cellId);
      if (cellIndex >= 0) {
        const newCells = sourceRow.cells.filter((_, cellIdx) => cellIdx !== cellIndex);
        if (newCells.length === 0) {
          // Remove row if no cells left
          updatedRows = updatedRows.filter((r) => r.id !== rowId);
        } else {
          // Redistribute column spans evenly
          const newSpan = Math.floor(12 / newCells.length);
          const remainder = 12 % newCells.length;
          const newCols = newCells.map((_, idx) => (idx === 0 ? newSpan + remainder : newSpan));

          updatedRows = updatedRows.map((r) =>
            r.id === rowId
              ? {
                  ...r,
                  cells: newCells,
                  preset: { ...r.preset, cols: newCols, label: 'Custom' },
                }
              : r
          );
        }
      }

      // Update source section
      if (activeSId !== secId) {
        updateSection(activeSId, { rows: updatedRows });
      }

      // Add new row to target section with all fields as single full-width cell
      const newRow: Row = {
        id: crypto.randomUUID(),
        preset: { label: 'Full Width', cols: [12], hint: '' },
        cells: [
          {
            id: crypto.randomUUID(),
            fields,
          },
        ],
      };

      // Update target section
      setActivePage(pageId);
      setActiveSection(secId);
      updateSection(secId, { rows: [newRow] });

      // Clear drag state
      setColumnDrag(null);
    },
    [columnDrag, activeSId, activeSection, updateSection, setActivePage, setActiveSection],
  );


  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <LoadingScreen />
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <ErrorScreen message={loadError} onBack={() => navigate('/forms')} />
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: V.bgApp,
        fontFamily: V.font,
      }}
    >
      {/* Top bar */}
      <TopBar
        formName={formName}
        onPreview={handlePreview}
        onSettings={() => setShowSettings(true)}
        onPublish={handlePublish}
        onBack={() => navigate('/forms')}
      />

      {/* Three-panel body wrapped in DndContext */}
      <DndContext
        sensors={dndSensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            overflow: 'hidden',
          }}
        >
          {/* Left: Pages/Sections Sidebar */}
          <Sidebar
            pages={pages}
            activePId={activePId}
            activeSId={activeSId}
            onSelectPage={setActivePage}
            onSelectSection={handleSelectSection}
            onAddPage={addPage}
            onDeletePage={deletePage}
            onRenamePage={renamePage}
            onAddSection={handleSidebarAddSection}
            onDeleteSection={handleSidebarDeleteSection}
            columnDrag={columnDrag}
          />

          {/* Center-Left: Field Types Sidebar */}
          <FieldTypesSidebar
            onAddField={addField}
            onPaletteDragStart={handlePaletteDragStart}
            onPaletteDragEnd={handlePaletteDragEnd}
          />

          {/* Center: Canvas */}
          <Canvas
            activePage={activePage}
            activeSId={activeSId}
            activePageId={activePId}
            selectedFieldId={selectedFieldId}
            onSelectSection={handleSelectSection}
            onSelectField={handleSelectField}
            onDeleteField={handleDeleteField}
            onDeleteRow={deleteRow}
            onMoveField={moveField}
            onDeleteSection={handleDeleteSectionCb}
            onAddRow={handleAddRow}
            onAddFieldToCell={addFieldToCell}
            onUpdateSection={handleUpdateSectionCb}
            onUpdateRow={handleUpdateRowCb}
            onAddSection={addSection}
            onColumnDragStart={setColumnDrag}
            onColumnDropToSection={handleColumnDropToSection}
            columnDrag={columnDrag}
          />

          {/* Right: Settings panel */}
          <SettingsPanel
            selectedField={selectedField}
            activePage={activePage ? { id: activePage.id, title: activePage.title, description: activePage.description, sections: activePage.sections } : null}
            activeSection={activeSection}
            onUpdateField={handleUpdateField}
            onUpdatePage={handleUpdatePage}
            onUpdateSection={handleUpdateSectionSettings}
          />
        </div>

        {/* DragOverlay for visual feedback */}
        <DragOverlay>
          <DragOverlayContent activeItem={activeItem} />
        </DragOverlay>
      </DndContext>

      {/* Settings Modal */}
      {showSettings && form && (
        <FormSettingsPage
          form={form}
          onBack={() => setShowSettings(false)}
          onSave={handleSaveSettings}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Preview Modal */}
      {showPreview && form && (
        <PreviewModal
          form={form}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
