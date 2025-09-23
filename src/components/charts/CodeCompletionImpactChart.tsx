'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export interface CodeCompletionImpactData {
  date: string;
  locAdded: number;
  locDeleted: number; // retained in interface though not displayed
  netChange: number;  // retained for potential future use
  userCount: number;
  totalUniqueUsers?: number;
}

interface CodeCompletionImpactChartProps {
  data: CodeCompletionImpactData[];
}

export default function CodeCompletionImpactChart({ data }: CodeCompletionImpactChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Code Completion Impact</h3>
        <div className="text-center py-8 text-gray-500">No code completion data available</div>
      </div>
    );
  }

  const chartData = {
    labels: data.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Lines Added',
        data: data.map(d => d.locAdded),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: false,
        title: { display: true, text: 'Date' },
        grid: { display: false },
      },
      y: {
        stacked: false,
        title: { display: true, text: 'Lines of Code' },
        grid: { color: 'rgba(0, 0, 0, 0.1)' },
        ticks: {
          callback: function (value: unknown) {
            const numValue = typeof value === 'number' ? value : 0;
            return numValue.toLocaleString();
          },
        },
      },
    },
    plugins: {
      legend: { position: 'top' as const },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<'bar'>) {
            const value = context.parsed.y;
            return `Lines Added: +${value.toLocaleString()}`;
          },
          afterBody: function (tooltipItems: TooltipItem<'bar'>[]) {
            if (tooltipItems.length > 0) {
              const dataIndex = tooltipItems[0].dataIndex;
              const dayData = data[dataIndex];
              return [`Active Users: ${dayData.userCount}`];
            }
            return [];
          },
        },
      },
    },
    interaction: { intersect: false, mode: 'index' as const },
  };

  // Summary statistics (deletions removed from display)
  const totalAdded = data.reduce((sum, d) => sum + d.locAdded, 0);
  const uniqueUsers = data[0].totalUniqueUsers || 0;
  const avgDailyUsers = Math.round(data.reduce((sum, d) => sum + d.userCount, 0) / data.length);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Code Completion Impact ({uniqueUsers} Unique Users)</h3>
          <p className="text-sm text-gray-600">Daily lines of code added through Code Completion feature</p>
        </div>
        <div className="text-right space-y-1">
          <div className="text-sm">
            <span className="font-medium text-green-600">Total Added:</span>{' '}
            <span className="text-green-600">{totalAdded.toLocaleString()}</span>
          </div>
        </div>
      </div>
      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 text-xs text-gray-500">
        <div>Average daily users with code completion: {avgDailyUsers}</div>
      </div>
    </div>
  );
}
