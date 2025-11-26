"use client";

import React from 'react';
import PRUModelUsageChart from './charts/PRUModelUsageChart';
import PRUCostAnalysisChart from './charts/PRUCostAnalysisChart';
import ModelFeatureDistributionChart from './charts/ModelFeatureDistributionChart';
import SectionHeader from './ui/SectionHeader';
import type {
  DailyModelUsageData,
  DailyPRUAnalysisData,
  ModelFeatureDistributionData
} from '../domain/calculators/metricCalculators';
import type { VoidCallback } from '../types/events';

interface PRUUsageAnalysisViewProps {
  modelUsageData: DailyModelUsageData[];
  pruAnalysisData: DailyPRUAnalysisData[];
  modelFeatureDistributionData: ModelFeatureDistributionData[];
  onBack: VoidCallback;
}

export default function PRUUsageAnalysisView({
  modelUsageData,
  pruAnalysisData,
  modelFeatureDistributionData,
  onBack
}: PRUUsageAnalysisViewProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <SectionHeader
        title="PRU Usage Analysis"
        description="Understand premium model utilization, service value consumption, and feature distribution across PRU-consuming activities."
        onBack={onBack}
        className="mb-6"
      />

      <div className="mb-12">
        <PRUModelUsageChart data={modelUsageData || []} />
      </div>

      <div className="mb-12 pt-4">
        <PRUCostAnalysisChart data={pruAnalysisData || []} />
      </div>

      <div className="mb-6 pt-4">
        <ModelFeatureDistributionChart data={modelFeatureDistributionData || []} />
      </div>
    </div>
  );
}
