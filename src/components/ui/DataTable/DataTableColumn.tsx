'use client';

import React from 'react';
import { useDataTableContext, SortDirection } from './DataTableContext';

export interface DataTableColumnProps<T = unknown> {
  field?: keyof T;
  sortable?: boolean;
  children: React.ReactNode;
  className?: string;
  width?: string;
}

function SortIcon({ active, direction }: { active: boolean; direction: SortDirection }) {
  if (!active) {
    return (
      <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
        />
      </svg>
    );
  }

  return direction === 'asc' ? (
    <svg className="w-4 h-4 ml-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4l9 16 9-16H3z" />
    </svg>
  ) : (
    <svg className="w-4 h-4 ml-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 20L12 4 3 20h18z" />
    </svg>
  );
}

export function DataTableColumn<T>({
  field,
  sortable = false,
  children,
  className = '',
  width,
}: DataTableColumnProps<T>) {
  const { sortField, sortDirection, handleSort } = useDataTableContext<T>();

  const baseClassName =
    className ||
    'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider';
  const style = width ? { width } : undefined;

  if (sortable && field) {
    const isActive = sortField === field;

    return (
      <th scope="col" className={baseClassName} style={style}>
        <button
          onClick={() => handleSort(field)}
          className="flex items-center hover:text-gray-700 focus:outline-none"
        >
          {children}
          <SortIcon active={isActive} direction={sortDirection} />
        </button>
      </th>
    );
  }

  return (
    <th scope="col" className={baseClassName} style={style}>
      {children}
    </th>
  );
}
