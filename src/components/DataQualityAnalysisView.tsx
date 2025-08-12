'use client';

import { useState } from 'react';
import { CopilotMetrics } from '../types/metrics';

interface DataQualityUser {
  userLogin: string;
  userId: number;
  usedAgent: boolean;
  usedModes: string[];
}

interface DataQualityAnalysisViewProps {
  metrics: CopilotMetrics[];
  onBack: () => void;
}

export default function DataQualityAnalysisView({ metrics, onBack }: DataQualityAnalysisViewProps) {
  const [isTableExpanded, setIsTableExpanded] = useState(false);

  // Analyze data quality - find users with used_agent=true but missing chat_panel_agent_mode in features
  const analyzeDataQuality = (): DataQualityUser[] => {
    const userModeMap = new Map<string, { 
      userId: number; 
      userLogin: string; 
      modes: Set<string>; 
      usedAgent: boolean;
      hasAgentModeFeature: boolean;
    }>();

    // Scan through all metrics to collect user modes and agent usage
    metrics.forEach(metric => {
      const key = `${metric.user_id}_${metric.user_login}`;
      
      if (!userModeMap.has(key)) {
        userModeMap.set(key, {
          userId: metric.user_id,
          userLogin: metric.user_login,
          modes: new Set<string>(),
          usedAgent: false,
          hasAgentModeFeature: false
        });
      }

      const userEntry = userModeMap.get(key)!;

      // Track if user has used_agent flag set to true
      if (metric.used_agent) {
        userEntry.usedAgent = true;
      }

      // Collect all features/modes from totals_by_feature
      metric.totals_by_feature?.forEach(feature => {
        const featureName = feature.feature;
        if (featureName && [
          'chat_panel_unknown_mode',
          'chat_panel_agent_mode',
          'chat_panel_ask_mode',
          'chat_panel_custom_mode',
          'chat_panel_edit_mode'
        ].includes(featureName)) {
          userEntry.modes.add(featureName);
          
          // Check if user has agent mode feature reported
          if (featureName === 'chat_panel_agent_mode') {
            userEntry.hasAgentModeFeature = true;
          }
        }
      });
    });

    // Filter users who have used_agent=true but no chat_panel_agent_mode feature
    const usersWithDataQualityIssues: DataQualityUser[] = [];
    
    userModeMap.forEach(user => {
      if (user.usedAgent && !user.hasAgentModeFeature) {
        usersWithDataQualityIssues.push({
          userLogin: user.userLogin,
          userId: user.userId,
          usedAgent: user.usedAgent,
          usedModes: Array.from(user.modes).sort()
        });
      }
    });

    // Sort by user login for consistent display
    return usersWithDataQualityIssues.sort((a, b) => a.userLogin.localeCompare(b.userLogin));
  };

  const usersWithDataQualityIssues = analyzeDataQuality();
  const maxItemsToShow = 10;
  const usersToShow = isTableExpanded ? usersWithDataQualityIssues : usersWithDataQualityIssues.slice(0, maxItemsToShow);

  const formatModes = (modes: string[]): string => {
    return modes.map(mode => mode.replace('chat_panel_', '').replace('_mode', '')).join(', ');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Data Quality Analysis</h2>
          <p className="text-gray-600 text-sm mt-1">
            Agent Mode users without Agent Mode feature reporting - potential data quality issues
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md transition-colors"
        >
          ← Back to Overview
        </button>
      </div>

      <div className="mb-4">
        <div className="flex items-center space-x-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-yellow-800">Users with Data Quality Issues</p>
                <p className="text-lg font-bold text-yellow-900">{usersWithDataQualityIssues.length.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {usersWithDataQualityIssues.length === 0 ? (
        <div className="text-center py-8">
          <svg className="w-16 h-16 text-green-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Quality Issues Found</h3>
          <p className="text-gray-600">All agent users have proper Agent Mode feature reporting</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Used Agent Flag
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chat Modes Used
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usersToShow.map((user, index) => (
                <tr key={`${user.userId}-${user.userLogin}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.userLogin}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.userId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      {user.usedAgent ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.usedModes.length > 0 ? formatModes(user.usedModes) : 'None'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {usersWithDataQualityIssues.length > maxItemsToShow && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setIsTableExpanded(!isTableExpanded)}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-300 hover:border-blue-400 rounded-md transition-colors"
              >
                {isTableExpanded ? 'Show Less' : `Show All ${usersWithDataQualityIssues.length} Users`}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Analysis Notes:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Users shown have <code>used_agent: true</code> but no <code>chat_panel_agent_mode</code> feature usage reported</li>
          <li>• This indicates a data quality issue where the agent flag is set but features don't reflect agent mode usage</li>
          <li>• These users may be using agent mode but it's not being properly tracked in the feature metrics</li>
        </ul>
      </div>
    </div>
  );
}
