'use client';

import { useState } from 'react';
import { TooltipItem } from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { registerChartJS } from '../../utils/chartSetup';
import { createBaseChartOptions } from '../../utils/chartOptions';
import { formatShortDate } from '../../utils/formatters';
import { DailyModelUsageData } from '../../utils/metricCalculators';
import ChartContainer from '../ui/ChartContainer';
import ChartToggleButtons from '../ui/ChartToggleButtons';
import InsightsCard from '../ui/InsightsCard';

registerChartJS();

interface PRUModelUsageChartProps {
  data: DailyModelUsageData[];
}

const CHART_TYPE_OPTIONS = [
  { value: 'area' as const, label: 'Area' },
  { value: 'bar' as const, label: 'Bar' },
];

export default function PRUModelUsageChart({ data }: PRUModelUsageChartProps) {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  const totalPRURequests = data.reduce((sum, d) => sum + d.pruModels, 0);
  const totalStandardRequests = data.reduce((sum, d) => sum + d.standardModels, 0);
  const totalUnknownRequests = data.reduce((sum, d) => sum + d.unknownModels, 0);
  const totalPRUs = data.reduce((sum, d) => sum + d.totalPRUs, 0);
  const totalCost = data.reduce((sum, d) => sum + d.serviceValue, 0);
  const grandTotal = totalPRURequests + totalStandardRequests + totalUnknownRequests;

  const chartData = {
    labels: data.map(d => formatShortDate(d.date)),
    datasets: [
      {
        label: 'Premium Models (PRU)',
        data: data.map(d => d.pruModels),
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 2,
        fill: chartType === 'area',
        tension: 0.4
      },
      {
        label: 'Standard Models (GPT-4.1/4o)',
        data: data.map(d => d.standardModels),
        backgroundColor: 'rgba(34, 197, 94, 0.6)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2,
        fill: chartType === 'area',
        tension: 0.4
      },
      {
        label: 'Unknown Models',
        data: data.map(d => d.unknownModels),
        backgroundColor: 'rgba(156, 163, 175, 0.6)',
        borderColor: 'rgb(156, 163, 175)',
        borderWidth: 2,
        fill: chartType === 'area',
        tension: 0.4
      }
    ]
  };

  const options = createBaseChartOptions({
    xAxisLabel: 'Date',
    yAxisLabel: 'Number of Requests',
    tooltipLabelCallback: (context: TooltipItem<'line' | 'bar'>) => {
      const value = context.parsed.y;
      const datasetLabel = context.dataset.label;
      return `${datasetLabel}: ${value} requests`;
    },
  });

  return (
    <ChartContainer
      title="Daily PRU vs Standard Model Usage"
      isEmpty={!data || data.length === 0}
      emptyState="No model usage data available"
      headerActions={
        <ChartToggleButtons options={CHART_TYPE_OPTIONS} value={chartType} onChange={setChartType} />
      }
      summaryStats={[
        { value: totalPRURequests, label: 'PRU Requests', sublabel: grandTotal > 0 ? `${Math.round((totalPRURequests / grandTotal) * 100)}%` : '0%', colorClass: 'text-red-600' },
        { value: totalStandardRequests, label: 'Standard Requests', sublabel: grandTotal > 0 ? `${Math.round((totalStandardRequests / grandTotal) * 100)}%` : '0%', colorClass: 'text-green-600' },
        { value: totalUnknownRequests, label: 'Unknown Requests', sublabel: grandTotal > 0 ? `${Math.round((totalUnknownRequests / grandTotal) * 100)}%` : '0%', colorClass: 'text-gray-600' },
        { value: Math.round(totalPRUs * 100) / 100, label: 'Total PRUs', sublabel: `Avg: ${data.length > 0 ? Math.round((totalPRUs / data.length) * 100) / 100 : 0}/day`, colorClass: 'text-blue-600' },
        { value: `$${Math.round(totalCost * 100) / 100}`, label: 'Service Value', sublabel: `Avg: $${data.length > 0 ? Math.round((totalCost / data.length) * 100) / 100 : 0}/day`, colorClass: 'text-purple-600' },
      ]}
      chartHeight="h-96"
      footer={
        <InsightsCard title="Model Types" variant="blue">
          <p>
            <strong>PRU Models:</strong> Premium models like Claude and Gemini that consume Premium Request Units (PRUs).{' '}
            <strong className="ml-1">Standard Models:</strong> GPT-4.1 and GPT-4o included with paid plans at no additional cost.
          </p>
        </InsightsCard>
      }
    >
      <Chart type={chartType === 'area' ? 'line' : 'bar'} data={chartData} options={options} />
    </ChartContainer>
  );
}
