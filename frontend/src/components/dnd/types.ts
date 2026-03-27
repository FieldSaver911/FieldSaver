import type { Field } from '@fieldsaver/shared';

/**
 * Discriminated union of all draggable items in the form builder.
 * Extended in future for library rows, data elements, etc.
 */
export type DragItemData =
  | { kind: 'row'; rowId: string; sectionId: string; pageId: string }
  | { kind: 'section'; sectionId: string; pageId: string }
  | {
      kind: 'column';
      cellId: string;
      rowId: string;
      sectionId: string;
      pageId: string;
      fields: Field[];
    }
  | {
      kind: 'field';
      fieldId: string;
      cellId: string;
      cellIndex: number;
      sectionId: string;
      pageId: string;
    };

/**
 * Drop target specifications. Discriminated by what kinds they accept.
 */
export type DropTargetData =
  | { accepts: 'field'; cellId: string; cellIndex: number; sectionId: string; pageId: string }
  | { accepts: 'row'; sectionId: string; pageId: string; insertIndex: number }
  | { accepts: 'section'; pageId: string; insertIndex: number }
  | { accepts: 'row|section'; pageId: string }
  | { accepts: 'column'; sectionId: string; pageId: string };
