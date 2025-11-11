'use client';

import { useMemo } from 'react';
import { Table } from '@tanstack/react-table';
import { LucideIcon } from 'lucide-react';
import { FacetDefinition } from '@/components/ui/data-table-client';

export function useFacets<TData>(
  table: Table<TData>,
  defs: FacetDefinition[]
): Array<{
  column: string;
  title: string;
  options: Array<{ value: string; label: string; icon?: LucideIcon }>;
  counts: Record<string, number>;
}> {
  return useMemo(() => {
    return defs.map((def) => {
      const counts: Record<string, number> = {};

      for (const row of table.getPreFilteredRowModel().rows) {
        const raw = row.getValue(def.column);

        // if it’s already an array, iterate it
        if (Array.isArray(raw)) {
          raw.forEach((v) => {
            const key = String(v).trim();
            if (key) counts[key] = (counts[key] || 0) + 1;
          });

          // if it’s a comma-string, split it
        } else if (typeof raw === 'string' && raw.includes(',')) {
          raw
            .split(',')
            .map((v) => v.trim())
            .filter((v) => v)
            .forEach((key) => {
              counts[key] = (counts[key] || 0) + 1;
            });

          // otherwise treat as single value
        } else {
          const key = raw != null ? String(raw).trim() : '';
          if (key) counts[key] = (counts[key] || 0) + 1;
        }
      }

      // turn into options array
      const options = Object.keys(counts).map((value) => ({
        value,
        label: value,
        icon: def.icon,
      }));

      // sort by descending count
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
