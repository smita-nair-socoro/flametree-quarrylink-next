'use client';

import React from 'react';

type UseAutoSelectSingleOptions<T> = {
  /** Candidate items; fires only when exactly one exists. */
  items: readonly T[];
  /** Caller-composed gate, e.g. `!isEditing && !hasMoreOptions`. */
  enabled?: boolean;
  /** Fire at most once per mount (for lists where empty is a valid final state). */
  once?: boolean;
  /** Returns true when the target is currently unset. */
  isEmpty: () => boolean;
  /** Applies the single item. */
  onSelect: (only: T) => void;
  /** Extra effect dependency, e.g. the watched field value. */
  revalidateKey?: unknown;
};

/**
 * Auto-selects the only available option so the user doesn't have to.
 * Form fields should use the `autoSelectForOnlyOneOption` prop on
 * FormSelect / SelectCreateEdit instead of calling this directly.
 */
export function useAutoSelectSingle<T>({
  items,
  enabled = true,
  once = false,
  isEmpty,
  onSelect,
  revalidateKey,
}: UseAutoSelectSingleOptions<T>): void {
  const isEmptyRef = React.useRef(isEmpty);
  const onSelectRef = React.useRef(onSelect);
  isEmptyRef.current = isEmpty;
  onSelectRef.current = onSelect;
  const firedRef = React.useRef(false);

  React.useEffect(() => {
    if (!enabled || items.length !== 1) return;
    if (once && firedRef.current) return;
    if (!isEmptyRef.current()) return;

    // Defer past the effect flush so same-commit parent "reset" effects
    // can't wipe the fill; isEmpty is re-checked at fire time.
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled || !isEmptyRef.current()) return;
      firedRef.current = true;
      onSelectRef.current(items[0]);
    });
    return () => {
      cancelled = true;
    };
  }, [enabled, once, items, revalidateKey]);
}

/** Treats the select placeholder values (0, '', null) as unset. */
export const isEmptySingleSelectValue = (value: unknown): boolean =>
  value == null ||
  value === '' ||
  value === 0 ||
  (typeof value === 'number' && Number.isNaN(value));
