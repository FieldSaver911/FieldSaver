import type { FieldType } from '@fieldsaver/shared';

export interface FieldTypeDef {
  type: FieldType;
  label: string;
  icon: string;
  category: 'basic' | 'choice' | 'advanced' | 'layout';
}

export const FIELD_TYPES: FieldTypeDef[] = [
  // Basic
  { type: 'text',        label: 'Short Text',   icon: 'Tt', category: 'basic' },
  { type: 'long_text',   label: 'Long Text',    icon: '¶',  category: 'basic' },
  { type: 'number',      label: 'Number',       icon: '#',  category: 'basic' },
  { type: 'email',       label: 'Email',        icon: '@',  category: 'basic' },
  { type: 'phone',       label: 'Phone',        icon: '☏',  category: 'basic' },
  { type: 'url',         label: 'URL',          icon: '⌁',  category: 'basic' },
  // Choice
  { type: 'date',        label: 'Date',         icon: '▫',  category: 'choice' },
  { type: 'time',        label: 'Time',         icon: '◷',  category: 'choice' },
  { type: 'dropdown',    label: 'Dropdown',     icon: '▾',  category: 'choice' },
  { type: 'multi_select',label: 'Multi-Select', icon: '☑',  category: 'choice' },
  { type: 'radio',       label: 'Radio Group',  icon: '◉',  category: 'choice' },
  { type: 'checkbox',    label: 'Checkbox',     icon: '✓',  category: 'choice' },
  // Advanced
  { type: 'rating',      label: 'Rating',       icon: '★',  category: 'advanced' },
  { type: 'scale',       label: 'Linear Scale', icon: '⟶', category: 'advanced' },
  { type: 'file',        label: 'File Upload',  icon: '↑',  category: 'advanced' },
  { type: 'signature',   label: 'Signature',    icon: '✍',  category: 'advanced' },
  // Layout
  { type: 'description', label: 'Description',  icon: 'T',  category: 'layout' },
  { type: 'divider',     label: 'Divider',      icon: '—',  category: 'layout' },
];

export const GRID_COLS = 12;

export interface ColPreset {
  label: string;
  hint: string;
  cols: number[];
}

export const COL_PRESETS: ColPreset[] = [
  { label: 'Full',    hint: '12 cols',     cols: [12] },
  { label: '½+½',     hint: '6+6',         cols: [6,6] },
  { label: '⅓×3',     hint: '4+4+4',       cols: [4,4,4] },
  { label: '¼×4',     hint: '3+3+3+3',     cols: [3,3,3,3] },
  { label: '⅓+⅔',     hint: '4+8',         cols: [4,8] },
  { label: '⅔+⅓',     hint: '8+4',         cols: [8,4] },
  { label: '¼+¾',     hint: '3+9',         cols: [3,9] },
  { label: '¾+¼',     hint: '9+3',         cols: [9,3] },
  { label: '¼+½+¼',   hint: '3+6+3',       cols: [3,6,3] },
  { label: '¼+¼+½',   hint: '3+3+6',       cols: [3,3,6] },
  { label: '½+¼+¼',   hint: '6+3+3',       cols: [6,3,3] },
  { label: '⅔+⅙+⅙',   hint: '8+2+2',       cols: [8,2,2] },
  { label: '⅙+⅙+⅔',   hint: '2+2+8',       cols: [2,2,8] },
  { label: '½+½+½+…', hint: '2+2+2+2+2+2', cols: [2,2,2,2,2,2] },
];

export function spanLabel(n: number): string {
  const map: Record<number, string> = {
    1: '1/12', 2: '1/6', 3: '¼', 4: '⅓', 5: '5/12', 6: '½',
    7: '7/12', 8: '⅔', 9: '¾', 10: '5/6', 11: '11/12', 12: 'Full',
  };
  return map[n] ?? `${n}/12`;
}
