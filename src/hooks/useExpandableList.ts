"use client";

import { useState, useMemo } from 'react';

export interface ExpandableListResult<T> {
  visibleItems: T[];
  isExpanded: boolean;
  canExpand: boolean;
  totalCount: number;
  toggleExpanded: () => void;
  setExpanded: (expanded: boolean) => void;
}

export function useExpandableList<T>(
  items: T[],
  initialCount: number
): ExpandableListResult<T> {
  const [isExpanded, setIsExpanded] = useState(false);

  const canExpand = items.length > initialCount;

  const visibleItems = useMemo(() => {
    if (isExpanded || !canExpand) {
      return items;
    }
    return items.slice(0, initialCount);
  }, [items, isExpanded, initialCount, canExpand]);

  const toggleExpanded = () => {
    setIsExpanded((prev) => !prev);
  };

  const setExpanded = (expanded: boolean) => {
    setIsExpanded(expanded);
  };

  return {
    visibleItems,
    isExpanded,
    canExpand,
    totalCount: items.length,
    toggleExpanded,
    setExpanded,
  };
}
