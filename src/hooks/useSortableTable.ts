"use client";

import { useState, useMemo } from 'react';

export type SortDirection = 'asc' | 'desc';

export interface SortableTableResult<T, K extends keyof T> {
  sortField: K;
  sortDirection: SortDirection;
  sortedItems: T[];
  handleSort: (field: K) => void;
}

export function useSortableTable<T, K extends keyof T>(
  items: T[],
  defaultSortField: K,
  defaultSortDirection: SortDirection = 'desc'
): SortableTableResult<T, K> {
  const [sortField, setSortField] = useState<K>(defaultSortField);
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSortDirection);

  const handleSort = (field: K) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        aVal = aVal.toLowerCase() as T[K];
        bVal = bVal.toLowerCase() as T[K];
      }

      if (sortDirection === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });
  }, [items, sortField, sortDirection]);

  return { sortField, sortDirection, sortedItems, handleSort };
}
