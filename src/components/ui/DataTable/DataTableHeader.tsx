'use client';

import React from 'react';

export interface DataTableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function DataTableHeader({ children, className = '' }: DataTableHeaderProps) {
  return (
    <thead className={className || 'bg-gray-50'}>
      <tr>{children}</tr>
    </thead>
  );
}
