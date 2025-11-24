'use client';

import React from 'react';
import { useDataTableContext } from './DataTableContext';

type LabelResolver = string | ((totalItems: number) => string);

export interface DataTableExpandButtonProps {
  collapsedLabel?: LabelResolver;
  expandedLabel?: LabelResolver;
  className?: string;
  containerClassName?: string;
  alignment?: 'left' | 'center' | 'right';
}

const DEFAULT_BUTTON_CLASS =
  'px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-300 hover:border-blue-400 rounded-md transition-colors';

const ALIGNMENT_TO_CLASS: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

function resolveLabel(label: LabelResolver | undefined, total: number, fallback: string): string {
  if (!label) return fallback;
  return typeof label === 'function' ? label(total) : label;
}

export function DataTableExpandButton({
  collapsedLabel,
  expandedLabel,
  className,
  containerClassName,
  alignment = 'center',
}: DataTableExpandButtonProps) {
  const { isExpanded, canExpand, toggleExpanded, totalCount } = useDataTableContext();

  if (!canExpand) {
    return null;
  }

  const resolvedCollapsedLabel = resolveLabel(
    collapsedLabel,
    totalCount,
    `Show All ${totalCount.toLocaleString()} Items`
  );
  const resolvedExpandedLabel = resolveLabel(expandedLabel, totalCount, 'Show Less');
  const buttonLabel = isExpanded ? resolvedExpandedLabel : resolvedCollapsedLabel;

  const containerClass = `${containerClassName ?? 'mt-4'} ${ALIGNMENT_TO_CLASS[alignment]}`;

  return (
    <div className={containerClass}>
      <button
        type="button"
        onClick={toggleExpanded}
        className={className ?? DEFAULT_BUTTON_CLASS}
        aria-expanded={isExpanded}
        aria-label={buttonLabel}
      >
        {buttonLabel}
      </button>
    </div>
  );
}
