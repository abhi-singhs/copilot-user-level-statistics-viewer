'use client';

import React from 'react';
import { useDataTableContext } from './DataTableContext';

export interface DataTableEmptyStateProps {
  message?: string;
  className?: string;
}

export function DataTableEmptyState({
  message = 'No data available',
  className = '',
}: DataTableEmptyStateProps) {
  const { totalCount } = useDataTableContext();

  if (totalCount > 0) {
    return null;
  }

  return (
    <div className={className || 'text-center py-8'}>
      <p className="text-gray-500">{message}</p>
    </div>
  );
}
