import React from 'react';
import type { FieldOption } from '@fieldsaver/shared';
import { V } from '../../constants/design';

// Simple UUID v4 generator
function generateId(): string {
  return `${Math.random().toString(16).slice(2)}-${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
}

interface OptionsEditorProps {
  options: FieldOption[] | undefined;
  onUpdate: (options: FieldOption[]) => void;
}

export function OptionsEditor({ options = [], onUpdate }: OptionsEditorProps) {
  const [localOptions, setLocalOptions] = React.useState<FieldOption[]>(options);

  React.useEffect(() => {
    setLocalOptions(options);
  }, [options]);

  const handleAddOption = () => {
    const newOption: FieldOption = {
      id: generateId(),
      label: `Option ${localOptions.length + 1}`,
    };
    const updated = [...localOptions, newOption];
    setLocalOptions(updated);
    onUpdate(updated);
  };

  const handleUpdateOption = (id: string, label: string) => {
    const updated = localOptions.map((opt) =>
      opt.id === id ? { ...opt, label } : opt
    );
    setLocalOptions(updated);
    onUpdate(updated);
  };

  const handleDeleteOption = (id: string) => {
    const updated = localOptions.filter((opt) => opt.id !== id);
    setLocalOptions(updated);
    onUpdate(updated);
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      const updated = [...localOptions];
      [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
      setLocalOptions(updated);
      onUpdate(updated);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < localOptions.length - 1) {
      const updated = [...localOptions];
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
      setLocalOptions(updated);
      onUpdate(updated);
    }
  };

  return (
    <div style={{ marginBottom: V.s3 }}>
      <label style={{ display: 'block', fontSize: V.sm, fontWeight: 600, color: V.textSecondary, marginBottom: V.s2, fontFamily: V.font }}>
        Options
      </label>

      <div style={{ border: `1px solid ${V.borderLight}`, borderRadius: V.r3, overflow: 'hidden' }}>
        {localOptions.length === 0 ? (
          <div style={{ padding: V.s3, textAlign: 'center', color: V.textSecondary, fontSize: V.sm, fontFamily: V.font }}>
            No options yet. Click "Add Option" to get started.
          </div>
        ) : (
          localOptions.map((option, index) => (
            <div
              key={option.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: V.s2,
                padding: V.s3,
                borderBottom: index < localOptions.length - 1 ? `1px solid ${V.borderLight}` : 'none',
              }}
            >
              {/* Drag handle (visual only, no actual drag) */}
              <div
                style={{
                  width: '20px',
                  textAlign: 'center',
                  color: V.textSecondary,
                  fontSize: V.sm,
                  fontFamily: V.font,
                  flexShrink: 0,
                  cursor: 'grab',
                }}
              >
                ⋮
              </div>

              {/* Option label input */}
              <input
                type="text"
                value={option.label}
                onChange={(e) => handleUpdateOption(option.id, e.target.value)}
                placeholder="Option label"
                style={{
                  flex: 1,
                  padding: `${V.s2} ${V.s3}`,
                  border: `1px solid ${V.border}`,
                  borderRadius: V.r2,
                  fontSize: V.md,
                  fontFamily: V.font,
                  color: V.textPrimary,
                  backgroundColor: V.bgSurface,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />

              {/* Move up button */}
              <button
                type="button"
                onClick={() => handleMoveUp(index)}
                disabled={index === 0}
                title="Move up"
                style={{
                  width: '28px',
                  height: '28px',
                  padding: 0,
                  border: `1px solid ${V.border}`,
                  borderRadius: V.r2,
                  backgroundColor: V.bgSurface,
                  color: index === 0 ? V.textDisabled : V.textSecondary,
                  cursor: index === 0 ? 'not-allowed' : 'pointer',
                  fontSize: V.sm,
                  fontFamily: V.font,
                  transition: 'all 0.12s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                ▲
              </button>

              {/* Move down button */}
              <button
                type="button"
                onClick={() => handleMoveDown(index)}
                disabled={index === localOptions.length - 1}
                title="Move down"
                style={{
                  width: '28px',
                  height: '28px',
                  padding: 0,
                  border: `1px solid ${V.border}`,
                  borderRadius: V.r2,
                  backgroundColor: V.bgSurface,
                  color: index === localOptions.length - 1 ? V.textDisabled : V.textSecondary,
                  cursor: index === localOptions.length - 1 ? 'not-allowed' : 'pointer',
                  fontSize: V.sm,
                  fontFamily: V.font,
                  transition: 'all 0.12s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                ▼
              </button>

              {/* Delete button */}
              <button
                type="button"
                onClick={() => handleDeleteOption(option.id)}
                title="Delete option"
                style={{
                  width: '28px',
                  height: '28px',
                  padding: 0,
                  border: `1px solid ${V.negative}`,
                  borderRadius: V.r2,
                  backgroundColor: V.negativeBg,
                  color: V.negative,
                  cursor: 'pointer',
                  fontSize: V.sm,
                  fontFamily: V.font,
                  transition: 'all 0.12s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add option button */}
      <button
        type="button"
        onClick={handleAddOption}
        style={{
          width: '100%',
          marginTop: V.s2,
          padding: `${V.s2} ${V.s3}`,
          border: `1px solid ${V.primary}`,
          borderRadius: V.r3,
          backgroundColor: V.primaryBg,
          color: V.primary,
          cursor: 'pointer',
          fontSize: V.sm,
          fontWeight: 600,
          fontFamily: V.font,
          transition: 'all 0.12s',
        }}
      >
        + Add Option
      </button>
    </div>
  );
}
