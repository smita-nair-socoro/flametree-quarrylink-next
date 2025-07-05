'use client';

import { FacetDefinition } from '@/components/ui/data-table-client';
import { Table } from '@tanstack/react-table';
import { LucideIcon } from 'lucide-react';
import { useMemo } from 'react';

export function useFacets<TData>(
  table: Table<TData>,
  defs: FacetDefinition[],
): Array<{
  column: string;
  title: string;
  options: Array<{ value: string; label: string; icon?: LucideIcon }>;
  counts: Record<string, number>;
}> {
  return useMemo(() => {
    return defs.map((def) => {
      const col = table.getColumn(def.column);
      if (!col) {
        console.warn(`useFacets: column "${def.column}" not found on table`);
        return {
          column: def.column,
          title: def.title ?? def.column,
          options: [],
          counts: {},
        };
      }

      const facetedMap = col.getFacetedUniqueValues() as Map<any, number>;
      const entries = Array.from(facetedMap.entries());

      const counts: Record<string, number> = Object.fromEntries(
        entries.map(([value, cnt]) => [String(value), cnt]),
      );

      const options = entries.map(([value]) => ({
        value: String(value),
        label: String(value),
        icon: def.icon,
      }));

      options.sort((a, b) => (counts[b.value] || 0) - (counts[a.value] || 0));

      return {
        column: def.column,
        title: def.title ?? def.column,
        options,
        counts,
      };
    });
  }, [table.getPreFilteredRowModel().rows, defs]);
}
