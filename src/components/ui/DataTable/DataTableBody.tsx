'use client';

import React from 'react';
import { useDataTableContext } from './DataTableContext';

export interface DataTableBodyProps<T> {
  children: (item: T, index: number) => React.ReactNode;
  className?: string;
  rowClassName?: string | ((item: T, index: number) => string);
  onRowClick?: (item: T) => void;
}

export function DataTableBody<T>({
  children,
  className = '',
  rowClassName,
  onRowClick,
}: DataTableBodyProps<T>) {
  const { visibleData } = useDataTableContext<T>();

  const getRowClassName = (item: T, index: number): string => {
    const baseClass = onRowClick ? 'hover:bg-gray-50 cursor-pointer transition-colors' : '';
    
    if (typeof rowClassName === 'function') {
      return `${rowClassName(item, index)} ${baseClass}`.trim();
    }
    
    if (rowClassName) {
      return `${rowClassName} ${baseClass}`.trim();
    }
    
    return baseClass;
  };

  return (
    <tbody className={className || 'bg-white divide-y divide-gray-200'}>
      {visibleData.map((item, index) => (
        <tr
          key={index}
          className={getRowClassName(item, index)}
          onClick={onRowClick ? () => onRowClick(item) : undefined}
        >
          {children(item, index)}
        </tr>
      ))}
    </tbody>
  );
}
