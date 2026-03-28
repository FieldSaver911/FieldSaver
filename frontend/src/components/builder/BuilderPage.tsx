import React from 'react';
import { useForm } from '../../hooks/useForm';
import { Canvas } from '../canvas/Canvas';
import { SettingsPanel } from './SettingsPanel';
import { V } from '../../constants/design';
import type { Field, Page, Section } from '@fieldsaver/shared';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface BuilderPageProps {
  formId: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BuilderPage({ formId }: BuilderPageProps) {
  const form = useForm(formId);

  const handleUpdateField = React.useCallback(
    (patch: Partial<Field>) => {
      if (!form.selectedField) return;
      form.updateField(form.selectedField.id, patch);
    },
    [form],
  );

  const handleUpdatePage = React.useCallback(
    (patch: Partial<Page>) => {
      if (!form.activePId) return;
      form.updatePage(form.activePId, patch);
    },
    [form],
  );

  const handleUpdateSection = React.useCallback(
    (patch: Partial<Section>) => {
      if (!form.activeSId) return;
      form.updateSection(form.activeSId, patch);
    },
    [form],
  );

  if (form.isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          fontFamily: V.font,
          color: V.textDisabled,
          fontSize: V.md,
        }}
      >
        Loading form...
      </div>
    );
  }

  if (form.loadError) {
    return (
      <div
        role="alert"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          fontFamily: V.font,
          color: V.negative,
          fontSize: V.md,
        }}
      >
        {form.loadError}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        fontFamily: V.font,
        backgroundColor: V.bgApp,
      }}
    >
      {/* Main canvas area */}
      <Canvas
        section={form.activeSection}
        selectedFieldId={form.selectedFieldId}
        onSelectField={form.setSelectedField}
        onDeleteField={form.deleteField}
        onMoveField={form.moveField}
        onMoveFieldToSection={form.moveFieldToSection}
      />

      {/* Right settings panel */}
      <SettingsPanel
        selectedField={form.selectedField}
        activePage={form.activePage}
        activeSection={form.activeSection}
        onUpdateField={handleUpdateField}
        onUpdatePage={handleUpdatePage}
        onUpdateSection={handleUpdateSection}
      />
    </div>
  );
}
