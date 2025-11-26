'use client';

import { useState } from 'react';
import { TooltipItem } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { registerChartJS } from '../../utils/chartSetup';
import { FeatureAdoptionData } from '../../utils/metricCalculators';
import ChartContainer from '../ui/ChartContainer';
import ChartToggleButtons from '../ui/ChartToggleButtons';
import InsightsCard from '../ui/InsightsCard';

registerChartJS();

interface FeatureAdoptionChartProps {
  data: FeatureAdoptionData;
}

const VIEW_TYPE_OPTIONS = [
  { value: 'absolute' as const, label: 'Absolute' },
  { value: 'percentage' as const, label: 'Percentage' },
];

export default function FeatureAdoptionChart({ data }: FeatureAdoptionChartProps) {
  const [viewType, setViewType] = useState<'absolute' | 'percentage'>('absolute');

  const features = [
    { name: 'Total Users', count: data?.totalUsers || 0, color: 'rgb(99, 102, 241)', description: 'All users in the dataset' },
    { name: 'Code Completion', count: data?.completionUsers || 0, color: 'rgb(34, 197, 94)', description: 'Users who used code completion' },
    { name: 'Chat Features', count: data?.chatUsers || 0, color: 'rgb(59, 130, 246)', description: 'Users who used any chat feature' },
    { name: 'Ask Mode', count: data?.askModeUsers || 0, color: 'rgb(147, 51, 234)', description: 'Users who used chat ask mode' },
    { name: 'Edit Mode', count: data?.editModeUsers || 0, color: 'rgb(245, 158, 11)', description: 'Users who used chat edit mode' },
    { name: 'Agent Mode', count: data?.agentModeUsers || 0, color: 'rgb(239, 68, 68)', description: 'Users who used agent mode' },
    { name: 'Inline Chat', count: data?.inlineModeUsers || 0, color: 'rgb(168, 85, 247)', description: 'Users who used inline chat' },
    { name: 'Code Review', count: data?.codeReviewUsers || 0, color: 'rgb(20, 184, 166)', description: 'Users who used code review features' }
  ];

  const totalUsers = data?.totalUsers || 0;
  const completionRate = totalUsers > 0 ? (data.completionUsers / totalUsers) * 100 : 0;
  const chatRate = totalUsers > 0 ? (data.chatUsers / totalUsers) * 100 : 0;
  const agentRate = totalUsers > 0 ? (data.agentModeUsers / totalUsers) * 100 : 0;

  const chartData = {
    labels: features.map(f => f.name),
    datasets: [{
      label: viewType === 'absolute' ? 'Number of Users' : 'Percentage of Total Users',
      data: viewType === 'absolute' 
        ? features.map(f => f.count)
        : features.map(f => totalUsers > 0 ? Math.round((f.count / totalUsers) * 100 * 100) / 100 : 0),
      backgroundColor: features.map(f => f.color),
      borderColor: features.map(f => f.color),
      borderWidth: 1
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      title: { display: true, text: 'GitHub Copilot Feature Adoption Funnel' },
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: function(context: TooltipItem<'bar'>[]) {
            const index = context[0].dataIndex;
            return features[index].name;
          },
          label: function(context: TooltipItem<'bar'>) {
            const index = context.dataIndex;
            const feature = features[index];
            const percentage = totalUsers > 0 ? Math.round((feature.count / totalUsers) * 100 * 100) / 100 : 0;
            return [
              `Users: ${feature.count}`,
              `Percentage: ${percentage}%`,
              `Description: ${feature.description}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        title: { display: true, text: viewType === 'absolute' ? 'Number of Users' : 'Percentage (%)' },
        max: viewType === 'percentage' ? 100 : undefined
      },
      y: { title: { display: true, text: 'Features' } }
    }
  };

  return (
    <ChartContainer
      title="Feature Adoption Funnel"
      isEmpty={!data || totalUsers === 0}
      emptyState="No feature adoption data available"
      headerActions={
        <ChartToggleButtons options={VIEW_TYPE_OPTIONS} value={viewType} onChange={setViewType} />
      }
      summaryStats={[
        { value: `${Math.round(completionRate)}%`, label: 'Completion Adoption', sublabel: `${data?.completionUsers || 0} users`, colorClass: 'text-green-600' },
        { value: `${Math.round(chatRate)}%`, label: 'Chat Adoption', sublabel: `${data?.chatUsers || 0} users`, colorClass: 'text-blue-600' },
        { value: `${Math.round(agentRate)}%`, label: 'Agent Mode Adoption', sublabel: `${data?.agentModeUsers || 0} users`, colorClass: 'text-red-600' },
        { value: `${Math.round(agentRate)}%`, label: 'Advanced Users', sublabel: 'Using Agent Mode', colorClass: 'text-purple-600' },
      ]}
      chartHeight="h-96"
      footer={
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InsightsCard title="Feature Journey" variant="green">
            <p>
              {completionRate > 80 ? 'Excellent' : completionRate > 60 ? 'Good' : 'Low'} code completion adoption.
              {chatRate > 40 ? ' Strong' : chatRate > 20 ? ' Moderate' : ' Low'} chat feature engagement.
              {agentRate > 10 ? ' Good' : agentRate > 5 ? ' Emerging' : ' Limited'} Agent Mode usage.
            </p>
          </InsightsCard>
          <InsightsCard title="Advanced Features" variant="blue">
            <p>
              Agent Mode is an advanced feature that can drive significant value for users.
              {agentRate > 15 ? ' High adoption suggests good value perception.' : ' Consider promoting Agent Mode benefits to increase adoption.'}
            </p>
          </InsightsCard>
        </div>
      }
    >
      <Bar data={chartData} options={options} />
    </ChartContainer>
  );
}
