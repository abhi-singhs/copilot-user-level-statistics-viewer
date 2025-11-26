'use client';

import { useState } from 'react';
import { TooltipItem } from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { registerChartJS } from '../../utils/chartSetup';
import { createDualAxisChartOptions } from '../../utils/chartOptions';
import { formatShortDate } from '../../utils/formatters';
import { DailyPRUAnalysisData } from '../../utils/metricCalculators';
import ChartContainer from '../ui/ChartContainer';
import ChartToggleButtons from '../ui/ChartToggleButtons';
import InsightsCard from '../ui/InsightsCard';

registerChartJS();

interface PRUCostAnalysisChartProps {
  data: DailyPRUAnalysisData[];
}

const VIEW_TYPE_OPTIONS = [
  { value: 'cost' as const, label: 'Service Value' },
  { value: 'percentage' as const, label: 'Usage %' },
  { value: 'models' as const, label: 'Models' },
];

export default function PRUCostAnalysisChart({ data }: PRUCostAnalysisChartProps) {
  const [viewType, setViewType] = useState<'cost' | 'percentage' | 'models'>('cost');

  const totalPRUs = data.reduce((sum, d) => sum + d.totalPRUs, 0);
  const totalCost = data.reduce((sum, d) => sum + d.serviceValue, 0);
  const totalPRURequests = data.reduce((sum, d) => sum + d.pruRequests, 0);
  const totalStandardRequests = data.reduce((sum, d) => sum + d.standardRequests, 0);
  const totalRequests = totalPRURequests + totalStandardRequests;
  const avgPRUPercentage = data.length > 0 ? data.reduce((sum, d) => sum + d.pruPercentage, 0) / data.length : 0;

  const maxCostDay = data.length > 0 
    ? data.reduce((max, d) => d.serviceValue > max.serviceValue ? d : max, data[0])
    : { serviceValue: 0, date: '' };

  const premiumModelAggregate = data.reduce((acc, day) => {
    for (const m of day.models) {
      if (!m.isPremium || m.name === 'unknown') continue;
      const existing = acc.get(m.name) || { prus: 0, requests: 0 };
      existing.prus += m.prus;
      existing.requests += m.requests;
      acc.set(m.name, existing);
    }
    return acc;
  }, new Map<string, { prus: number; requests: number }>());

  const sortedPremiumModels = Array.from(premiumModelAggregate.entries())
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => (b.prus - a.prus) || (b.requests - a.requests));

  const topModels = sortedPremiumModels.map(m => m.name);

  const getChartData = () => {
    switch (viewType) {
      case 'cost':
        return {
          labels: data.map(d => formatShortDate(d.date)),
          datasets: [
            {
              type: 'bar' as const,
              label: 'PRU Requests',
              data: data.map(d => d.pruRequests),
              backgroundColor: 'rgba(239, 68, 68, 0.6)',
              borderColor: 'rgb(239, 68, 68)',
              borderWidth: 1,
              yAxisID: 'y'
            },
            {
              type: 'line' as const,
              label: 'Service Value ($)',
              data: data.map(d => d.serviceValue),
              backgroundColor: 'rgba(147, 51, 234, 0.2)',
              borderColor: 'rgb(147, 51, 234)',
              borderWidth: 3,
              fill: false,
              tension: 0.4,
              yAxisID: 'y1'
            }
          ]
        };
      case 'percentage':
        return {
          labels: data.map(d => formatShortDate(d.date)),
          datasets: [
            {
              type: 'bar' as const,
              label: 'PRU Requests',
              data: data.map(d => d.pruRequests),
              backgroundColor: 'rgba(239, 68, 68, 0.6)',
              borderColor: 'rgb(239, 68, 68)',
              borderWidth: 1,
              yAxisID: 'y'
            },
            {
              type: 'bar' as const,
              label: 'Standard Requests',
              data: data.map(d => d.standardRequests),
              backgroundColor: 'rgba(34, 197, 94, 0.6)',
              borderColor: 'rgb(34, 197, 94)',
              borderWidth: 1,
              yAxisID: 'y'
            },
            {
              type: 'line' as const,
              label: 'PRU Percentage (%)',
              data: data.map(d => d.pruPercentage),
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              borderColor: 'rgb(59, 130, 246)',
              borderWidth: 3,
              fill: false,
              tension: 0.4,
              yAxisID: 'y1'
            }
          ]
        };
      case 'models':
        return {
          labels: data.map(d => formatShortDate(d.date)),
          datasets: [
            {
              type: 'bar' as const,
              label: 'Total PRUs',
              data: data.map(d => d.totalPRUs),
              backgroundColor: 'rgba(168, 85, 247, 0.6)',
              borderColor: 'rgb(168, 85, 247)',
              borderWidth: 1,
              yAxisID: 'y'
            },
            {
              type: 'line' as const,
              label: 'Top Model PRUs',
              data: data.map(d => d.topModelPRUs),
              backgroundColor: 'rgba(245, 158, 11, 0.2)',
              borderColor: 'rgb(245, 158, 11)',
              borderWidth: 3,
              fill: false,
              tension: 0.4,
              yAxisID: 'y'
            }
          ]
        };
      default:
        return { labels: [], datasets: [] };
    }
  };

  const chartData = getChartData();

  const options = {
    ...createDualAxisChartOptions({
      xAxisLabel: 'Date',
      yAxisLabel: viewType === 'cost' ? 'Number of Requests' : viewType === 'percentage' ? 'Number of Requests' : 'PRUs',
      y1AxisLabel: viewType === 'cost' ? 'Service Value ($)' : viewType === 'percentage' ? 'Percentage (%)' : 'PRUs',
      y1Max: viewType === 'percentage' ? 100 : undefined,
      tooltipAfterBodyCallback: (context: TooltipItem<'line' | 'bar'>[]) => {
        const dataIndex = context[0].dataIndex;
        const dayData = data[dataIndex];
        return [
          '',
          `PRU Requests: ${dayData.pruRequests}`,
          `Standard Requests: ${dayData.standardRequests}`,
          `PRU Percentage: ${dayData.pruPercentage}%`,
          `Total PRUs: ${dayData.totalPRUs}`,
          `Service Value: $${dayData.serviceValue}`,
          `Top Model: ${dayData.topModel}`,
          `Top Model PRUs: ${dayData.topModelPRUs}`
        ];
      },
    }),
    plugins: {
      title: { display: true, text: `PRU ${viewType === 'cost' ? 'Service Value' : viewType === 'percentage' ? 'Usage' : 'Model'} Analysis` },
      legend: { position: 'top' as const },
      tooltip: {
        callbacks: {
          afterBody: (context: TooltipItem<'line' | 'bar'>[]) => {
            const dataIndex = context[0].dataIndex;
            const dayData = data[dataIndex];
            return [
              '',
              `PRU Requests: ${dayData.pruRequests}`,
              `Standard Requests: ${dayData.standardRequests}`,
              `PRU Percentage: ${dayData.pruPercentage}%`,
              `Total PRUs: ${dayData.totalPRUs}`,
              `Service Value: $${dayData.serviceValue}`,
              `Top Model: ${dayData.topModel}`,
              `Top Model PRUs: ${dayData.topModelPRUs}`
            ];
          }
        }
      }
    },
  };

  return (
    <ChartContainer
      title="PRU Service Value Analysis"
      isEmpty={!data || data.length === 0}
      emptyState="No PRU service value data available"
      headerActions={
        <ChartToggleButtons options={VIEW_TYPE_OPTIONS} value={viewType} onChange={setViewType} />
      }
      summaryStats={[
        { value: Math.round(totalPRUs * 100) / 100, label: 'Total PRUs', sublabel: `${data.length > 0 ? Math.round((totalPRUs / data.length) * 100) / 100 : 0}/day avg`, colorClass: 'text-purple-600' },
        { value: `$${Math.round(totalCost * 100) / 100}`, label: 'Service Value', sublabel: `$${data.length > 0 ? Math.round((totalCost / data.length) * 100) / 100 : 0}/day avg`, colorClass: 'text-green-600' },
        { value: `${Math.round(avgPRUPercentage * 100) / 100}%`, label: 'Avg PRU Usage', sublabel: `${totalPRURequests}/${totalRequests} requests`, colorClass: 'text-red-600' },
        { value: `$${Math.round(maxCostDay.serviceValue * 100) / 100}`, label: 'Peak Service Value Day', sublabel: maxCostDay.date ? formatShortDate(maxCostDay.date) : 'N/A', colorClass: 'text-orange-600' },
        { value: topModels.length, label: 'Premium Models', sublabel: 'Used in period', colorClass: 'text-blue-600' },
      ]}
      chartHeight="h-96"
      footer={
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InsightsCard title="PRU Efficiency" variant="purple">
            <p>
              Average cost per PRU request: ${totalPRURequests > 0 ? Math.round((totalCost / totalPRURequests) * 100) / 100 : 0}.
              {avgPRUPercentage > 30 ? ' High premium model usage.' : avgPRUPercentage > 15 ? ' Moderate premium usage.' : ' Primarily standard models.'}
            </p>
          </InsightsCard>
          <InsightsCard title="Cost Optimization" variant="green">
            <p>
              {avgPRUPercentage > 50 ? 'Consider reviewing premium model usage for optimization opportunities.' : 
               avgPRUPercentage > 25 ? 'Balanced usage of premium and standard models.' :
               'Efficient use of included models minimizes additional costs.'}
            </p>
          </InsightsCard>
          <InsightsCard title="Model Insights" variant="blue">
            <p>
              Top premium models used: {topModels.length > 0 ? topModels.slice(0, 3).join(', ') : 'None'}
              {topModels.length > 3 && ` +${topModels.length - 3} more`}
            </p>
          </InsightsCard>
        </div>
      }
    >
      <Chart type="bar" data={chartData} options={options} />
    </ChartContainer>
  );
}
