"use client";

import React from 'react';
import FeatureAdoptionChart from './charts/FeatureAdoptionChart';
import AgentModeHeatmapChart from './charts/AgentModeHeatmapChart';
import type { FeatureAdoptionData, AgentModeHeatmapData } from '../utils/metricsParser';

interface CopilotAdoptionViewProps {
  featureAdoptionData: FeatureAdoptionData | null;
  agentModeHeatmapData: AgentModeHeatmapData[];
  onBack: () => void;
}

export default function CopilotAdoptionView({ featureAdoptionData, agentModeHeatmapData, onBack }: CopilotAdoptionViewProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Copilot Adoption Analysis</h2>
          <p className="text-gray-600 text-sm mt-1 max-w-2xl">
            Understand Copilot feature adoption patterns and Agent Mode usage intensity across days.
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md transition-colors"
        >
          ← Back to Overview
        </button>
      </div>

      <div className="mb-12">
        <FeatureAdoptionChart data={featureAdoptionData || {
          totalUsers: 0,
          completionUsers: 0,
          chatUsers: 0,
          agentModeUsers: 0,
          askModeUsers: 0,
          editModeUsers: 0,
          inlineModeUsers: 0,
          codeReviewUsers: 0
        }} />
      </div>

      <div className="mb-6 pt-4">
        <AgentModeHeatmapChart data={agentModeHeatmapData || []} />
      </div>
    </div>
  );
}
