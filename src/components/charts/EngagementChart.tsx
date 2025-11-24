'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { DailyEngagementData } from '../../utils/metricCalculators';
import ChartContainer from '../ui/ChartContainer';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface EngagementChartProps {
  data: DailyEngagementData[];
}

export default function EngagementChart({ data }: EngagementChartProps) {
  const avgEngagement = data.length > 0 
    ? Math.round((data.reduce((sum, d) => sum + d.engagementPercentage, 0) / data.length) * 100) / 100
    : 0;

  const maxEngagement = data.length > 0 
    ? Math.max(...data.map(d => d.engagementPercentage))
    : 0;

  const minEngagement = data.length > 0 
    ? Math.min(...data.map(d => d.engagementPercentage))
    : 0;

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
        label: 'User Engagement %',
        data: data.map(d => d.engagementPercentage),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.1,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: TooltipItem<'line'>) {
            const dataIndex = context.dataIndex;
            const dayData = data[dataIndex];
            return [
              `Engagement: ${dayData.engagementPercentage}%`,
              `Active Users: ${dayData.activeUsers}`,
              `Total Users: ${dayData.totalUsers}`,
            ];
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
        },
        grid: {
          display: false,
        },
      },
      y: {
        title: {
          display: true,
          text: 'Engagement Percentage (%)',
        },
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: function(value: unknown) {
            return value + '%';
          }
        }
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  return (
    <ChartContainer
      title="Daily User Engagement"
      description="Percentage of total users active each day during the reporting period"
      stats={[
        { label: 'Avg', value: `${avgEngagement}%` },
        { label: 'Max', value: `${maxEngagement}%` },
        { label: 'Min', value: `${minEngagement}%` },
      ]}
      isEmpty={data.length === 0}
      emptyState="No engagement data available"
      footer={
        <div className="text-xs text-gray-500">
          Total unique users in reporting period: {data[0]?.totalUsers || 0}
        </div>
      }
    >
      <Line data={chartData} options={options} />
    </ChartContainer>
  );
}
