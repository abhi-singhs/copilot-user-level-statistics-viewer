'use client';

import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { CopilotMetrics } from '../../types/metrics';
import { KNOWN_MODELS } from '../../domain/modelConfig';
import InsightsCard from '../ui/InsightsCard';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ModelsUsageChartProps {
  metrics: CopilotMetrics[];
  variant: 'standard' | 'premium';
}

/**
 * Unified stacked bar chart for daily interactions per model collection (standard or premium).
 * Aggregates user_initiated_interaction_count across all features for each model and day.
 */
export default function ModelsUsageChart({ metrics, variant }: ModelsUsageChartProps) {
  const isPremium = variant === 'premium';

  const modelNames = useMemo(
    () => KNOWN_MODELS.filter(m => m.isPremium === isPremium).map(m => m.name.toLowerCase()),
    [isPremium]
  );

  const { labels, datasets, totalInteractions, modelTotals, modelOrder } = useMemo(() => {
    const daySet = new Set<string>();
    const modelTotals: Record<string, number> = {};
    const map: Record<string, Record<string, number>> = {};

    for (const metric of metrics) {
      const date = metric.day;
      daySet.add(date);
      if (!map[date]) map[date] = {};

      for (const mf of metric.totals_by_model_feature) {
        const model = mf.model.toLowerCase();
        if (!modelNames.includes(model)) continue;
        const count = mf.user_initiated_interaction_count;
        map[date][model] = (map[date][model] || 0) + count;
        modelTotals[model] = (modelTotals[model] || 0) + count;
      }
    }

    const sortedDates = Array.from(daySet).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    const sortedModels = Object.keys(modelTotals).sort((a, b) => (modelTotals[b] || 0) - (modelTotals[a] || 0));

    const colors = sortedModels.map((_, i) => `hsl(${(i * (isPremium ? 45 : 55)) % 360},70%,55%)`);

    const datasets = sortedModels.map((model, idx) => ({
      label: model,
      data: sortedDates.map(d => map[d]?.[model] || 0),
      backgroundColor: colors[idx],
      borderColor: colors[idx],
      borderWidth: 1,
      stack: isPremium ? 'premium-models' : 'standard-models'
    }));

    const totalInteractions = sortedModels.reduce((sum, m) => sum + (modelTotals[m] || 0), 0);

    return {
      labels: sortedDates.map(d => new Date(d).toLocaleDateString()),
      datasets,
      totalInteractions,
      modelTotals,
      modelOrder: sortedModels
    };
  }, [metrics, modelNames, isPremium]);

  // Derive insights about distribution / dominance
  const insights = useMemo(() => {
    if (!totalInteractions || !modelOrder.length) return null;

    // Build share list
    const shares = modelOrder.map(m => ({
      model: m,
      count: modelTotals[m] || 0,
      share: (modelTotals[m] || 0) / totalInteractions
    }));

    const top = shares[0];
    const second = shares[1];
    const dominantThreshold = 0.5; // 50%
    const strongDominanceThreshold = 0.7; // 70%+

  let variant: 'green' | 'blue' | 'red' | 'orange' | 'purple' = 'blue';
  const paragraphs: string[] = [];
  const title = `${isPremium ? 'Premium' : 'Standard'} Model Usage Insights`;
  let showDocLink = false;

    if (top.share >= strongDominanceThreshold) {
      variant = 'red';
      paragraphs.push(
        `One model (${top.model}) accounts for ${(top.share * 100).toFixed(1)}% of all interactions, indicating a heavy concentration. This may suggest teams are defaulting to a single model and could benefit from deeper awareness of alternatives.`
      );
      showDocLink = true;
    } else if (top.share >= dominantThreshold) {
      variant = 'orange';
      paragraphs.push(
        `A single model (${top.model}) holds ${(top.share * 100).toFixed(1)}% share. A moderate skew like this can mean users are comfortable with that model but may be overlooking scenarios where other models perform better.`
      );
      showDocLink = true;
    } else {
      // Consider distribution healthy if top model <40%, at least 3 models and cumulative top 3 <=80%
      const cumulativeTop3 = shares.slice(0, 3).reduce((s, x) => s + x.share, 0);
      if (top.share < 0.4 && shares.length >= 3 && cumulativeTop3 <= 0.8) {
        variant = 'green';
        paragraphs.push(
          `Usage is well distributed. The leading model (${top.model}) is at ${(top.share * 100).toFixed(1)}% with good variability across ${shares.length} models, suggesting teams select models based on their strengths.`
        );
      } else {
  variant = 'blue';
        paragraphs.push(
          `Distribution is moderately diversified. The top model (${top.model}) sits at ${(top.share * 100).toFixed(1)}%${second ? ` and the second at ${(second.share * 100).toFixed(1)}%` : ''}. Continued experimentation could further optimize fit for specific tasks.`
        );
        showDocLink = true;
      }
    }

    // Add quick share summary (up to 5 models)
    const summary = shares.slice(0, 5).map(s => `${s.model}: ${(s.share * 100).toFixed(1)}%`).join(', ');
    paragraphs.push(`Top model share summary: ${summary}${shares.length > 5 ? ', ...' : ''}.`);

    return { title, variant, paragraphs, showDocLink };
  }, [modelTotals, modelOrder, totalInteractions, isPremium]);

  if (!metrics || metrics.length === 0 || datasets.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{isPremium ? 'Premium' : 'Standard'} Models Daily Usage</h3>
        <div className="text-center text-gray-500 py-8">No {isPremium ? 'premium' : 'standard'} model usage data available</div>
      </div>
    );
  }

  const chartData = { labels, datasets };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: function(context: TooltipItem<'bar'>) {
            const value = context.parsed.y || 0;
            return `${context.dataset.label}: ${value} interactions`;
          },
          footer: function(items: TooltipItem<'bar'>[]) {
            if (!items.length) return '';
            const dayTotal = items.reduce((sum, it) => sum + (it.parsed.y || 0), 0);
            return `Total: ${dayTotal}`;
          }
        }
      }
    },
    scales: {
      x: { stacked: true, title: { display: true, text: 'Date' } },
      y: { stacked: true, beginAtZero: true, title: { display: true, text: 'Interactions' } }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{isPremium ? 'Premium' : 'Standard'} Models Daily Usage</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className={`text-2xl font-bold ${isPremium ? 'text-purple-600' : 'text-blue-600'}`}>{datasets.length}</div>
          <div className="text-sm text-gray-600">Models</div>
        </div>
        <div className="text-center">
          <div className={`text-2xl font-bold ${isPremium ? 'text-red-600' : 'text-green-600'}`}>{totalInteractions}</div>
          <div className="text-sm text-gray-600">Total Interactions</div>
        </div>
        <div className="text-center col-span-2 md:col-span-2">
          <p className="text-xs text-gray-600 mt-2">Counts aggregate user initiated interactions across all features per {isPremium ? 'premium' : 'standard'} model per day.</p>
        </div>
      </div>
      <div className="h-96">
        <Bar data={chartData} options={options} />
      </div>
      {insights && (
        <InsightsCard title={insights.title} variant={insights.variant} className="mt-6">
          {insights.paragraphs.map((p, i) => (
            <p key={i} className={i > 0 ? 'mt-2' : ''}>{p}</p>
          ))}
          {insights.showDocLink && (
            <p className="mt-3">
              Learn more in the{' '}
              <a
                href="https://docs.github.com/en/copilot/reference/ai-models/model-comparison"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium"
              >
                model comparison guide
              </a>
              .
            </p>
          )}
        </InsightsCard>
      )}
    </div>
  );
}
