import React from 'react';
import type { Form } from '@fieldsaver/shared';
import { formsApi } from '../../api/forms';
import { V } from '../../constants/design';

// ─── State ────────────────────────────────────────────────────────────────────

interface State {
  forms: Form[];
  isLoading: boolean;
  error: string | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FormsListPage() {
  const [state, setState] = React.useState<State>({ forms: [], isLoading: false, error: null });

  React.useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, isLoading: true, error: null }));
    formsApi.list()
      .then((data) => {
        if (!cancelled) setState({ forms: data, isLoading: false, error: null });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({ forms: [], isLoading: false, error: err instanceof Error ? err.message : 'Failed to load forms' });
        }
      });
    return () => { cancelled = true; };
  }, []);

  const handleNewForm = React.useCallback(async () => {
    try {
      await formsApi.create({ name: 'Untitled Form', description: '' });
      // Re-load the list
      const data = await formsApi.list();
      setState({ forms: data, isLoading: false, error: null });
    } catch (err: unknown) {
      setState((s) => ({ ...s, error: err instanceof Error ? err.message : 'Failed to create form' }));
    }
  }, []);

  const handleDelete = React.useCallback(async (id: string) => {
    try {
      await formsApi.delete(id);
      setState((s) => ({ ...s, forms: s.forms.filter((f) => f.id !== id) }));
    } catch (err: unknown) {
      setState((s) => ({ ...s, error: err instanceof Error ? err.message : 'Failed to delete form' }));
    }
  }, []);

  const handleDuplicate = React.useCallback(async (id: string) => {
    try {
      const copy = await formsApi.duplicate(id);
      setState((s) => ({ ...s, forms: [copy, ...s.forms] }));
    } catch (err: unknown) {
      setState((s) => ({ ...s, error: err instanceof Error ? err.message : 'Failed to duplicate form' }));
    }
  }, []);

  return (
    <div style={{ padding: V.s6, fontFamily: V.font }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: V.s5,
        }}
      >
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: V.textPrimary }}>
          My Forms
        </h1>
        <button
          type="button"
          onClick={handleNewForm}
          style={{
            padding: `${V.s2} ${V.s4}`,
            backgroundColor: V.primary,
            color: '#fff',
            border: 'none',
            borderRadius: V.r3,
            fontSize: V.md,
            fontFamily: V.font,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          New Form
        </button>
      </div>

      {state.error && (
        <div
          role="alert"
          style={{
            padding: V.s3,
            backgroundColor: V.negativeBg,
            color: V.negative,
            borderRadius: V.r3,
            marginBottom: V.s4,
            fontSize: V.md,
          }}
        >
          {state.error}
        </div>
      )}

      {state.isLoading ? (
        <div style={{ color: V.textDisabled, fontFamily: V.font }}>Loading...</div>
      ) : state.forms.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            color: V.textDisabled,
            padding: V.s6,
            fontSize: V.md,
          }}
        >
          No forms yet. Create your first form.
        </div>
      ) : (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: V.md,
          }}
        >
          <thead>
            <tr style={{ borderBottom: `1px solid ${V.borderLight}` }}>
              <th style={{ textAlign: 'left', padding: `${V.s2} ${V.s3}`, color: V.textSecondary, fontWeight: 600 }}>Name</th>
              <th style={{ textAlign: 'left', padding: `${V.s2} ${V.s3}`, color: V.textSecondary, fontWeight: 600 }}>Status</th>
              <th style={{ textAlign: 'left', padding: `${V.s2} ${V.s3}`, color: V.textSecondary, fontWeight: 600 }}>Updated</th>
              <th style={{ textAlign: 'right', padding: `${V.s2} ${V.s3}`, color: V.textSecondary, fontWeight: 600 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {state.forms.map((form) => (
              <tr
                key={form.id}
                style={{ borderBottom: `1px solid ${V.borderLight}` }}
              >
                <td style={{ padding: `${V.s3} ${V.s3}`, color: V.textPrimary, fontWeight: 500 }}>{form.name}</td>
                <td style={{ padding: `${V.s3} ${V.s3}`, color: V.textSecondary, textTransform: 'capitalize' }}>{form.status}</td>
                <td style={{ padding: `${V.s3} ${V.s3}`, color: V.textSecondary }}>
                  {new Date(form.updatedAt).toLocaleDateString()}
                </td>
                <td style={{ padding: `${V.s3} ${V.s3}`, textAlign: 'right' }}>
                  <button
                    type="button"
                    onClick={() => handleDuplicate(form.id)}
                    style={{
                      marginRight: V.s2,
                      padding: `${V.s1} ${V.s2}`,
                      fontSize: V.sm,
                      border: `1px solid ${V.border}`,
                      borderRadius: V.r2,
                      backgroundColor: V.bgSurface,
                      cursor: 'pointer',
                      color: V.textSecondary,
                      fontFamily: V.font,
                    }}
                  >
                    Duplicate
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(form.id)}
                    style={{
                      padding: `${V.s1} ${V.s2}`,
                      fontSize: V.sm,
                      border: `1px solid ${V.border}`,
                      borderRadius: V.r2,
                      backgroundColor: V.bgSurface,
                      cursor: 'pointer',
                      color: V.negative,
                      fontFamily: V.font,
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
