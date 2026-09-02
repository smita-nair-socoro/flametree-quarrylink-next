'use client';

import { useMemo } from 'react';
import { Table } from '@tanstack/react-table';
import { LucideIcon } from 'lucide-react';
import { FacetDefinition } from '@/components/ui/data-table-client';

function parseFacetKey(raw: unknown): { key: string; label: string } {
  if (raw == null) return { key: '', label: '' };

  const text = String(raw).trim();
  if (!text) return { key: '', label: '' };

  const pipeIndex = text.indexOf('|');
  if (pipeIndex === -1) {
    return { key: text, label: text };
  }

  const key = text.slice(0, pipeIndex).trim();
  const label = text.slice(pipeIndex + 1).trim() || key;
  return { key, label };
}

export function useFacets<TData>(
  table: Table<TData>,
  defs: FacetDefinition[],
): Array<{
  column: string;
  title: string;
  options: Array<{ value: string; label: string; icon?: LucideIcon }>;
  counts: Record<string, number>;
  hideSearch?: boolean;
  asyncSearch?: FacetDefinition['asyncSearch'];
}> {
  return useMemo(() => {
    return defs.map((def) => {
      if (def.asyncSearch) {
        return {
          column: def.column,
          title: def.title ?? def.column,
          options: def.options ?? [],
          counts: {} as Record<string, number>,
          hideSearch: def.hideSearch,
          asyncSearch: def.asyncSearch,
        };
      }

      if (def.options?.length) {
        return {
          column: def.column,
          title: def.title ?? def.column,
          options: def.options.map((option) => ({
            ...option,
            icon: option.icon ?? def.icon,
          })),
          counts: {} as Record<string, number>,
          hideSearch: def.hideSearch,
          asyncSearch: def.asyncSearch,
        };
      }

      const counts: Record<string, number> = {};
      const labels: Record<string, string> = {};

      for (const row of table.getPreFilteredRowModel().rows) {
        const raw = row.getValue(def.column);

        if (Array.isArray(raw)) {
          raw.forEach((v) => {
            const { key, label } = parseFacetKey(v);
            if (!key) return;
            counts[key] = (counts[key] || 0) + 1;
            labels[key] = labels[key] || label;
          });
        } else if (typeof raw === 'string' && raw.includes(',')) {
          raw
            .split(',')
            .map((v) => v.trim())
            .filter((v) => v)
            .forEach((part) => {
              const { key, label } = parseFacetKey(part);
              if (!key) return;
              counts[key] = (counts[key] || 0) + 1;
              labels[key] = labels[key] || label;
            });
        } else {
          const { key, label } = parseFacetKey(raw);
          if (!key) continue;
          counts[key] = (counts[key] || 0) + 1;
          labels[key] = labels[key] || label;
        }
      }

      const options = Object.keys(counts).map((value) => ({
        value,
        label: labels[value] || value,
        icon: def.icon,
      }));

      options.sort((a, b) => (counts[b.value] || 0) - (counts[a.value] || 0));

      return {
        column: def.column,
        title: def.title ?? def.column,
        options,
        counts,
        hideSearch: def.hideSearch,
        asyncSearch: def.asyncSearch,
      };
    });
  }, [table.getPreFilteredRowModel().rows, defs]);
}
