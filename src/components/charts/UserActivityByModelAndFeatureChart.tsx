import React, { useState, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { ChartData, ChartOptions } from 'chart.js';
import { registerChartJS } from '../../utils/chartSetup';
import { CopilotMetrics } from '../../types/metrics';
import { translateFeature } from '../../utils/featureTranslations';
import ChartContainer from '../ui/ChartContainer';

registerChartJS();

export type ModelFeatureAggregate = CopilotMetrics['totals_by_model_feature'][number];

interface UserActivityByModelAndFeatureChartProps {
  modelFeatureAggregates: ModelFeatureAggregate[];
  modelBarChartData: ChartData<'bar'>;
  modelBarChartOptions: ChartOptions<'bar'>;
}

export default function UserActivityByModelAndFeatureChart({
  modelFeatureAggregates,
  modelBarChartData,
  modelBarChartOptions
}: UserActivityByModelAndFeatureChartProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const groupedAndSorted = useMemo(() => {
    const grouped = modelFeatureAggregates.reduce<Record<string, ModelFeatureAggregate[]>>((acc, item) => {
      if (!acc[item.model]) acc[item.model] = [];
      acc[item.model].push(item);
      return acc;
    }, {});

    const sortedModels = Object.keys(grouped).sort((a, b) => {
      if (a === 'unknown' || a === '') return 1;
      if (b === 'unknown' || b === '') return -1;
      const totalA = grouped[a].reduce((sum, i) => sum + i.user_initiated_interaction_count, 0);
      const totalB = grouped[b].reduce((sum, i) => sum + i.user_initiated_interaction_count, 0);
      return totalB - totalA;
    });

    return { grouped, sortedModels };
  }, [modelFeatureAggregates]);

  const hasBarChart = modelBarChartData.datasets && modelBarChartData.datasets.length > 0;

  const footer = (
    <div className="border-t border-gray-200 pt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <span className="text-sm font-medium text-gray-700">
          Detailed Model and Feature Breakdown
        </span>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="mt-4 overflow-x-auto">
          <div className="space-y-6">
            {groupedAndSorted.sortedModels.map(model => {
              const items = groupedAndSorted.grouped[model];
              const totalInteractions = items.reduce((sum, i) => sum + i.user_initiated_interaction_count, 0);
              return (
                <div key={model} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-gray-800 mb-3 capitalize">
                    {model === 'unknown' || model === '' ? 'Unknown Model' : model}
                    <span className="text-sm font-normal text-gray-600 ml-2">({totalInteractions.toLocaleString()} total interactions)</span>
                  </h4>
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feature</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interactions</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generation</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acceptance</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LOC Added</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LOC Deleted</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Suggested Add</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Suggested Delete</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{translateFeature(item.feature)}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.user_initiated_interaction_count.toLocaleString()}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.code_generation_activity_count.toLocaleString()}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.code_acceptance_activity_count.toLocaleString()}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.loc_added_sum.toLocaleString()}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.loc_deleted_sum.toLocaleString()}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.loc_suggested_to_add_sum.toLocaleString()}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.loc_suggested_to_delete_sum.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <ChartContainer title="Activity by Model and Feature" footer={footer}>
      {hasBarChart && (
        <div className="mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-800 mb-4 text-center">Daily Model Interactions</h4>
            <div className="h-64">
              <Bar data={modelBarChartData} options={modelBarChartOptions} />
            </div>
          </div>
        </div>
      )}
    </ChartContainer>
  );
}
