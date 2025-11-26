'use client';

import { TooltipItem } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { registerChartJS } from '../../utils/chartSetup';
import { createBaseChartOptions, yAxisFormatters } from '../../utils/chartOptions';
import { DailyChatRequestsData } from '../../utils/metricCalculators';
import ChartContainer from '../ui/ChartContainer';

registerChartJS();

interface ChatRequestsChartProps {
  data: DailyChatRequestsData[];
}

export default function ChatRequestsChart({ data }: ChatRequestsChartProps) {
  const totalAskRequests = data.reduce((sum, d) => sum + d.askModeRequests, 0);
  const totalAgentRequests = data.reduce((sum, d) => sum + d.agentModeRequests, 0);
  const totalEditRequests = data.reduce((sum, d) => sum + d.editModeRequests, 0);
  const totalInlineRequests = data.reduce((sum, d) => sum + d.inlineModeRequests, 0);
  const grandTotal = totalAskRequests + totalAgentRequests + totalEditRequests + totalInlineRequests;

  const avgAskRequests = data.length > 0 
    ? Math.round((totalAskRequests / data.length) * 100) / 100
    : 0;

  const avgAgentRequests = data.length > 0 
    ? Math.round((totalAgentRequests / data.length) * 100) / 100
    : 0;

  const avgEditRequests = data.length > 0 
    ? Math.round((totalEditRequests / data.length) * 100) / 100
    : 0;

  const avgInlineRequests = data.length > 0 
    ? Math.round((totalInlineRequests / data.length) * 100) / 100
    : 0;

  const maxAskRequests = data.length > 0 ? Math.max(...data.map(d => d.askModeRequests)) : 0;
  const maxAgentRequests = data.length > 0 ? Math.max(...data.map(d => d.agentModeRequests)) : 0;
  const maxEditRequests = data.length > 0 ? Math.max(...data.map(d => d.editModeRequests)) : 0;
  const maxInlineRequests = data.length > 0 ? Math.max(...data.map(d => d.inlineModeRequests)) : 0;

  const chartData = {
    labels: data.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }),
    datasets: [
      {
        label: 'Ask Mode Requests',
        data: data.map(d => d.askModeRequests),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.1,
        pointBackgroundColor: 'rgb(34, 197, 94)',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Agent Mode Requests',
        data: data.map(d => d.agentModeRequests),
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.1,
        pointBackgroundColor: 'rgb(147, 51, 234)',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Edit Mode Requests',
        data: data.map(d => d.editModeRequests),
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.1,
        pointBackgroundColor: 'rgb(245, 158, 11)',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Inline Mode Requests',
        data: data.map(d => d.inlineModeRequests),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.1,
        pointBackgroundColor: 'rgb(239, 68, 68)',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = createBaseChartOptions({
    xAxisLabel: 'Date',
    yAxisLabel: 'Number of Requests',
    yStepSize: 1,
    yTicksCallback: yAxisFormatters.integer,
    tooltipLabelCallback: (context: TooltipItem<'line' | 'bar'>) => {
      const value = context.parsed.y;
      const datasetLabel = context.dataset.label;
      return `${datasetLabel}: ${value} requests`;
    },
    tooltipAfterBodyCallback: (tooltipItems: TooltipItem<'line' | 'bar'>[]) => {
      if (tooltipItems.length > 0) {
        const dataIndex = tooltipItems[0].dataIndex;
        const dayData = data[dataIndex];
        const totalRequests = dayData.askModeRequests + dayData.agentModeRequests + dayData.editModeRequests + dayData.inlineModeRequests;
        return [
          '',
          `Date: ${dayData.date}`,
          `Total requests: ${totalRequests}`
        ];
      }
      return [];
    },
  });

  return (
    <ChartContainer
      title="Daily Chat Requests"
      description="Number of user-initiated chat interactions per mode each day"
      stats={[
        { label: 'Avg Ask', value: avgAskRequests },
        { label: 'Avg Agent', value: avgAgentRequests },
        { label: 'Avg Edit', value: avgEditRequests },
        { label: 'Avg Inline', value: avgInlineRequests },
      ]}
      isEmpty={data.length === 0}
      emptyState="No chat request data available"
      footer={
        <div className="grid grid-cols-5 gap-4 text-xs text-gray-500">
          <div>
            <span className="font-medium text-green-600">Ask Mode:</span> {totalAskRequests} total (max {maxAskRequests}/day)
          </div>
          <div>
            <span className="font-medium text-purple-600">Agent Mode:</span> {totalAgentRequests} total (max {maxAgentRequests}/day)
          </div>
          <div>
            <span className="font-medium text-amber-600">Edit Mode:</span> {totalEditRequests} total (max {maxEditRequests}/day)
          </div>
          <div>
            <span className="font-medium text-red-600">Inline Mode:</span> {totalInlineRequests} total (max {maxInlineRequests}/day)
          </div>
          <div>
            <span className="font-medium text-gray-600">All Modes:</span> {grandTotal} total requests
          </div>
        </div>
      }
    >
      <Line data={chartData} options={options} />
    </ChartContainer>
  );
}
