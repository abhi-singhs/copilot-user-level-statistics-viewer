'use client';

import React from 'react';

export interface ChartStat {
  label: string;
  value: string | number;
  color?: string;
}

export interface SummaryStatItem {
  value: string | number;
  label: string;
  sublabel?: string;
  colorClass?: string;
}

export interface ChartContainerProps {
  title: string;
  description?: string;
  stats?: ChartStat[];
  summaryStats?: SummaryStatItem[];
  headerActions?: React.ReactNode;
  footer?: React.ReactNode;
  emptyState?: string;
  isEmpty?: boolean;
  children: React.ReactNode;
  className?: string;
  chartHeight?: string;
}

export default function ChartContainer({
  title,
  description,
  stats,
  summaryStats,
  headerActions,
  footer,
  emptyState = 'No data available',
  isEmpty = false,
  children,
  className = '',
  chartHeight = 'h-80',
}: ChartContainerProps) {
  if (isEmpty) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="text-center py-8 text-gray-500">{emptyState}</div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          {description && <p className="text-sm text-gray-600">{description}</p>}
        </div>
        <div className="flex items-start gap-4">
          {stats && stats.length > 0 && (
            <div className="text-right space-y-1">
              {stats.map((stat, index) => (
                <div key={index} className="text-sm text-gray-600">
                  <span className="font-medium">{stat.label}:</span>{' '}
                  <span className={stat.color}>{stat.value}</span>
                </div>
              ))}
            </div>
          )}
          {headerActions}
        </div>
      </div>

      {summaryStats && summaryStats.length > 0 && (
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-6">
          {summaryStats.map((stat, index) => (
            <div key={index} className="text-center min-w-[100px]">
              <div className={`text-2xl font-bold ${stat.colorClass || 'text-gray-900'}`}>
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
              {stat.sublabel && <div className="text-xs text-gray-500">{stat.sublabel}</div>}
            </div>
          ))}
        </div>
      )}

      <div className={chartHeight}>{children}</div>

      {footer && <div className="mt-4">{footer}</div>}
    </div>
  );
}
