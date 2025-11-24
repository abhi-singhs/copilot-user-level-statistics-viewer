'use client';

import React, { useState, useMemo } from 'react';
import { DataTableProvider, SortDirection } from './DataTableContext';

export interface DataTableProps<T> {
  data: T[];
  defaultSortField?: keyof T;
  defaultSortDirection?: SortDirection;
  initialCount?: number;
  children: React.ReactNode;
  className?: string;
  tableClassName?: string;
  containerClassName?: string;
}

export function DataTable<T>({
  data,
  defaultSortField,
  defaultSortDirection = 'desc',
  initialCount = 10,
  children,
  className = '',
  tableClassName = '',
  containerClassName = '',
}: DataTableProps<T>) {
  const [sortField, setSortField] = useState<keyof T | null>(defaultSortField ?? null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSortDirection);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSort = (field: keyof T) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortField) return data;

    return [...data].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        aVal = aVal.toLowerCase() as T[keyof T];
        bVal = bVal.toLowerCase() as T[keyof T];
      }

      if (sortDirection === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });
  }, [data, sortField, sortDirection]);

  const canExpand = data.length > initialCount;
  const visibleData = useMemo(() => {
    if (isExpanded || !canExpand) {
      return sortedData;
    }
    return sortedData.slice(0, initialCount);
  }, [sortedData, isExpanded, initialCount, canExpand]);

  const toggleExpanded = () => {
    setIsExpanded((prev) => !prev);
  };

  const contextValue = {
    data: sortedData as unknown[],
    visibleData: visibleData as unknown[],
    sortField: sortField as string | number | symbol | null,
    sortDirection,
    handleSort: handleSort as (field: string | number | symbol) => void,
    isExpanded,
    canExpand,
    toggleExpanded,
    totalCount: data.length,
    initialCount,
  };

  return (
    <DataTableProvider value={contextValue}>
      <div className={className}>
        <div className={containerClassName || 'overflow-x-auto'}>
          <table className={tableClassName || 'w-full divide-y divide-gray-200'}>
            {children}
          </table>
        </div>
      </div>
    </DataTableProvider>
  );
}
