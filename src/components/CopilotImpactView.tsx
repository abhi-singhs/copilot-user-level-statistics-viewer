"use client";

import React from 'react';
import CodingAgentImpactChart from './charts/CodingAgentImpactChart';
import CodeCompletionImpactChart from './charts/CodeCompletionImpactChart';
import SectionHeader from './ui/SectionHeader';
import type { AgentImpactData, CodeCompletionImpactData } from '../utils/metricsParser';

interface CopilotImpactViewProps {
  agentImpactData: AgentImpactData[];
  codeCompletionImpactData: CodeCompletionImpactData[];
  onBack: () => void;
}

export default function CopilotImpactView({ agentImpactData, codeCompletionImpactData, onBack }: CopilotImpactViewProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <SectionHeader
        title="Copilot Impact Analysis"
        description="Analyze the impact and productivity gains from Copilot features, including code completion and agent mode contributions to your codebase."
        onBack={onBack}
        className="mb-6"
      />

      <div className="mb-12">       
        <CodingAgentImpactChart data={agentImpactData || []} />
      </div>

      <div className="mb-6 pt-4">        
        <CodeCompletionImpactChart data={codeCompletionImpactData || []} />
      </div>
    </div>
  );
}
