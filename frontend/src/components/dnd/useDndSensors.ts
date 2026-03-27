import { useMemo } from 'react';
import {
  PointerSensor,
  KeyboardSensor,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

/**
 * Memoized sensor configuration for DnD.
 * PointerSensor: 8px activation distance (prevents accidental drags on click)
 * KeyboardSensor: arrow keys + enter/space for accessibility
 */
export function useDndSensors() {
  return useMemo(
    () => [
      {
        sensor: PointerSensor,
        options: {
          activationConstraint: {
            distance: 8,
          },
        },
      },
      {
        sensor: KeyboardSensor,
        options: {
          coordinateGetter: sortableKeyboardCoordinates,
        },
      },
    ],
    []
  );
}
