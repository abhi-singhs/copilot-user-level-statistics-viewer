'use client';

import { TooltipItem } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { registerChartJS } from '../../utils/chartSetup';
import { createBaseChartOptions, yAxisFormatters } from '../../utils/chartOptions';
import { DailyChatUsersData } from '../../utils/metricCalculators';
import ChartContainer from '../ui/ChartContainer';

registerChartJS();

interface ChatUsersChartProps {
  data: DailyChatUsersData[];
}

export default function ChatUsersChart({ data }: ChatUsersChartProps) {
  const avgAskMode = data.length > 0 
    ? Math.round((data.reduce((sum, d) => sum + d.askModeUsers, 0) / data.length) * 100) / 100
    : 0;

  const avgAgentMode = data.length > 0 
    ? Math.round((data.reduce((sum, d) => sum + d.agentModeUsers, 0) / data.length) * 100) / 100
    : 0;

  const avgEditMode = data.length > 0 
    ? Math.round((data.reduce((sum, d) => sum + d.editModeUsers, 0) / data.length) * 100) / 100
    : 0;

  const avgInlineMode = data.length > 0 
    ? Math.round((data.reduce((sum, d) => sum + d.inlineModeUsers, 0) / data.length) * 100) / 100
    : 0;

  const maxAskMode = data.length > 0 ? Math.max(...data.map(d => d.askModeUsers)) : 0;
  const maxAgentMode = data.length > 0 ? Math.max(...data.map(d => d.agentModeUsers)) : 0;
  const maxEditMode = data.length > 0 ? Math.max(...data.map(d => d.editModeUsers)) : 0;
  const maxInlineMode = data.length > 0 ? Math.max(...data.map(d => d.inlineModeUsers)) : 0;

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
        label: 'Chat: Ask Mode',
        data: data.map(d => d.askModeUsers),
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
        label: 'Chat: Agent Mode',
        data: data.map(d => d.agentModeUsers),
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
        label: 'Chat: Edit Mode',
        data: data.map(d => d.editModeUsers),
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
        label: 'Chat: Inline Mode',
        data: data.map(d => d.inlineModeUsers),
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
    yAxisLabel: 'Number of Users',
    yStepSize: 1,
    yTicksCallback: yAxisFormatters.integer,
    tooltipLabelCallback: (context: TooltipItem<'line' | 'bar'>) => {
      const value = context.parsed.y;
      const datasetLabel = context.dataset.label;
      return `${datasetLabel}: ${value} users`;
    },
    tooltipAfterBodyCallback: (tooltipItems: TooltipItem<'line' | 'bar'>[]) => {
      if (tooltipItems.length > 0) {
        const dataIndex = tooltipItems[0].dataIndex;
        const dayData = data[dataIndex];
        const totalChatUsers = Math.max(dayData.askModeUsers, dayData.agentModeUsers, dayData.editModeUsers, dayData.inlineModeUsers);
        return [
          '',
          `Date: ${dayData.date}`,
          `Peak chat users: ${totalChatUsers}`
        ];
      }
      return [];
    },
  });

  return (
    <ChartContainer
      title="Daily Chat Users Trends"
      description="Number of unique users using different chat modes each day"
      stats={[
        { label: 'Avg Ask', value: avgAskMode },
        { label: 'Avg Agent', value: avgAgentMode },
        { label: 'Avg Edit', value: avgEditMode },
        { label: 'Avg Inline', value: avgInlineMode },
      ]}
      isEmpty={data.length === 0}
      emptyState="No chat user data available"
      footer={
        <div className="grid grid-cols-4 gap-4 text-xs text-gray-500">
          <div>
            <span className="font-medium text-green-600">Ask Mode:</span> Max {maxAskMode} users
          </div>
          <div>
            <span className="font-medium text-purple-600">Agent Mode:</span> Max {maxAgentMode} users
          </div>
          <div>
            <span className="font-medium text-amber-600">Edit Mode:</span> Max {maxEditMode} users
          </div>
          <div>
            <span className="font-medium text-red-600">Inline Mode:</span> Max {maxInlineMode} users
          </div>
        </div>
      }
    >
      <Line data={chartData} options={options} />
    </ChartContainer>
  );
}
