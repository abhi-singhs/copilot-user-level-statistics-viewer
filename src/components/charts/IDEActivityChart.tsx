"use client";
import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import type { ChartData, ChartOptions } from 'chart.js';
import { getIDEIcon, formatIDEName } from '../../utils/ideIcons';

interface IDEAggregateItem {
  ide: string;
  user_initiated_interaction_count: number;
  code_generation_activity_count: number;
  code_acceptance_activity_count: number;
  loc_added_sum: number;
  loc_deleted_sum: number;
  loc_suggested_to_add_sum: number;
  loc_suggested_to_delete_sum: number;
}

interface IDEActivityChartProps {
  ideAggregates: IDEAggregateItem[];
  barChartData: ChartData<'bar'>;
  barChartOptions: ChartOptions<'bar'>;
  title?: string;
  pluginVersions?: {
    plugin: string;
    plugin_version: string;
    sampled_at: string;
  }[];
}

/**
 * IDEActivityChart
 * Reusable section displaying a daily interactions stacked bar chart (by IDE) plus
 * a table summarizing aggregate metrics per IDE.
 */
export default function IDEActivityChart({
  ideAggregates,
  barChartData,
  barChartOptions,
  title = 'Activity by IDE',
  pluginVersions
}: IDEActivityChartProps) {
  const [isPluginTableExpanded, setIsPluginTableExpanded] = useState(false);

  if (!ideAggregates || ideAggregates.length === 0) {
    return null; // nothing to render
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>

      {/* Bar Chart */}
      {barChartData.datasets && barChartData.datasets.length > 0 && (
        <div className="mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-800 mb-4 text-center">Daily IDE Interactions</h4>
            <div className="h-64">
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IDE</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interactions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generation</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acceptance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LOC Added</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LOC Deleted</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Suggested Add</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Suggested Delete</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ideAggregates.map(ide => (
              <tr key={ide.ide}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div className="flex items-center gap-2">
                    {React.createElement(getIDEIcon(ide.ide))}
                    <span>{formatIDEName(ide.ide)}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ide.user_initiated_interaction_count.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ide.code_generation_activity_count.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ide.code_acceptance_activity_count.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ide.loc_added_sum.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ide.loc_deleted_sum.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ide.loc_suggested_to_add_sum.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ide.loc_suggested_to_delete_sum.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pluginVersions && pluginVersions.length > 0 && (
        <div className="mt-8">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Plugin Versions</h4>
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plugin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Version</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Seen</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(isPluginTableExpanded ? pluginVersions : pluginVersions.slice(0, 1)).map((plugin, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{plugin.plugin}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{plugin.plugin_version}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(plugin.sampled_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pluginVersions.length > 1 && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setIsPluginTableExpanded(!isPluginTableExpanded)}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-300 hover:border-blue-400 rounded-md transition-colors"
              >
                {isPluginTableExpanded ? 'Show Less' : `Show All ${pluginVersions.length} Plugin Versions`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
