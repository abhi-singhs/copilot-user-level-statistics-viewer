import { CopilotMetrics, MetricsStats, UserSummary } from '../types/metrics';
import { DateRangeFilter } from '../types/filters';
import { getFilteredDateRange } from '../utils/dateFilters';
import {
  // Stats
  createStatsAccumulator,
  accumulateUserUsage,
  accumulateIdeUser,
  accumulateLanguageEngagement,
  accumulateModelEngagement,
  computeStats,
  // Engagement
  DailyEngagementData,
  createEngagementAccumulator,
  accumulateEngagement,
  computeEngagementData,
  // Chat
  DailyChatUsersData,
  DailyChatRequestsData,
  createChatAccumulator,
  accumulateChatFeature,
  computeChatUsersData,
  computeChatRequestsData,
  // Language
  LanguageStats,
  createLanguageAccumulator,
  accumulateLanguageStats,
  computeLanguageStats,
  shouldFilterLanguage,
  // Model Usage
  DailyModelUsageData,
  DailyPRUAnalysisData,
  AgentModeHeatmapData,
  ModelFeatureDistributionData,
  createModelUsageAccumulator,
  accumulateModelFeature,
  accumulateAgentHeatmapFromFeature,
  computeDailyModelUsageData,
  computePRUAnalysisData,
  computeAgentModeHeatmapData,
  computeModelFeatureDistributionData,
  // Feature Adoption
  FeatureAdoptionData,
  createFeatureAdoptionAccumulator,
  accumulateFeatureAdoption,
  computeFeatureAdoptionData,
  // Impact
  AgentImpactData,
  CodeCompletionImpactData,
  ModeImpactData,
  createImpactAccumulator,
  ensureImpactDates,
  accumulateFeatureImpacts,
  computeAgentImpactData,
  computeCodeCompletionImpactData,
  computeEditModeImpactData,
  computeInlineModeImpactData,
  computeAskModeImpactData,
  computeJoinedImpactData,
} from './calculators';

export interface AggregatedMetrics {
  stats: MetricsStats;
  userSummaries: UserSummary[];
  engagementData: DailyEngagementData[];
  chatUsersData: DailyChatUsersData[];
  chatRequestsData: DailyChatRequestsData[];
  languageStats: LanguageStats[];
  modelUsageData: DailyModelUsageData[];
  featureAdoptionData: FeatureAdoptionData;
  pruAnalysisData: DailyPRUAnalysisData[];
  agentModeHeatmapData: AgentModeHeatmapData[];
  modelFeatureDistributionData: ModelFeatureDistributionData[];
  agentImpactData: AgentImpactData[];
  codeCompletionImpactData: CodeCompletionImpactData[];
  editModeImpactData: ModeImpactData[];
  inlineModeImpactData: ModeImpactData[];
  askModeImpactData: ModeImpactData[];
  joinedImpactData: ModeImpactData[];
}

interface UserSummaryAccumulator {
  userMap: Map<number, UserSummary>;
  userActiveDays: Map<number, Set<string>>;
}

function createUserSummaryAccumulator(): UserSummaryAccumulator {
  return {
    userMap: new Map(),
    userActiveDays: new Map(),
  };
}

function accumulateUserSummary(
  accumulator: UserSummaryAccumulator,
  metric: CopilotMetrics
): void {
  const userId = metric.user_id;
  const date = metric.day;

  if (!accumulator.userMap.has(userId)) {
    accumulator.userMap.set(userId, {
      user_login: metric.user_login,
      user_id: userId,
      total_user_initiated_interactions: 0,
      total_code_generation_activities: 0,
      total_code_acceptance_activities: 0,
      total_loc_added: 0,
      total_loc_deleted: 0,
      total_loc_suggested_to_add: 0,
      total_loc_suggested_to_delete: 0,
      days_active: 0,
      used_agent: false,
      used_chat: false,
    });
    accumulator.userActiveDays.set(userId, new Set());
  }

  const userSummary = accumulator.userMap.get(userId)!;
  userSummary.total_user_initiated_interactions += metric.user_initiated_interaction_count;
  userSummary.total_code_generation_activities += metric.code_generation_activity_count;
  userSummary.total_code_acceptance_activities += metric.code_acceptance_activity_count;
  userSummary.total_loc_added += metric.loc_added_sum;
  userSummary.total_loc_deleted += metric.loc_deleted_sum;
  userSummary.total_loc_suggested_to_add += metric.loc_suggested_to_add_sum;
  userSummary.total_loc_suggested_to_delete += metric.loc_suggested_to_delete_sum;
  userSummary.used_agent = userSummary.used_agent || metric.used_agent;
  userSummary.used_chat = userSummary.used_chat || metric.used_chat;
  accumulator.userActiveDays.get(userId)!.add(date);
}

function computeUserSummaries(accumulator: UserSummaryAccumulator): UserSummary[] {
  return Array.from(accumulator.userMap.values())
    .map(user => ({
      ...user,
      days_active: accumulator.userActiveDays.get(user.user_id)?.size || 0,
    }))
    .sort((a, b) => b.total_user_initiated_interactions - a.total_user_initiated_interactions);
}

export function aggregateMetrics(
  metrics: CopilotMetrics[],
  options: {
    removeUnknownLanguages?: boolean;
    dateFilter?: DateRangeFilter;
    reportEndDay?: string;
  } = {}
): AggregatedMetrics {
  let filteredMetricsCount = 0;

  // Date Filter Setup
  let startDate: Date | null = null;
  let endDate: Date | null = null;
  if (options.dateFilter && options.dateFilter !== 'all' && options.reportEndDay) {
    const { startDay, endDay } = getFilteredDateRange(options.dateFilter, '', options.reportEndDay);
    startDate = new Date(startDay);
    endDate = new Date(endDay);
  }

  // Initialize all accumulators
  const statsAccumulator = createStatsAccumulator();
  const userSummaryAccumulator = createUserSummaryAccumulator();
  const engagementAccumulator = createEngagementAccumulator();
  const chatAccumulator = createChatAccumulator();
  const languageAccumulator = createLanguageAccumulator();
  const modelUsageAccumulator = createModelUsageAccumulator();
  const featureAdoptionAccumulator = createFeatureAdoptionAccumulator();
  const impactAccumulator = createImpactAccumulator();

  // Single pass through all metrics
  for (const metric of metrics) {
    // Date Filtering
    if (startDate && endDate) {
      const metricDate = new Date(metric.day);
      if (metricDate < startDate || metricDate > endDate) continue;
    }

    filteredMetricsCount++;

    // Capture report dates from first filtered metric
    if (filteredMetricsCount === 1) {
      statsAccumulator.reportStartDay = metric.report_start_day;
      statsAccumulator.reportEndDay = metric.report_end_day;
    }

    const date = metric.day;
    const userId = metric.user_id;

    // User Summary
    accumulateUserSummary(userSummaryAccumulator, metric);

    // Stats: User Usage
    accumulateUserUsage(statsAccumulator, userId, metric.used_chat, metric.used_agent);

    // Engagement
    accumulateEngagement(engagementAccumulator, date, userId);

    // Impact: Initialize dates
    ensureImpactDates(impactAccumulator, date);

    // Process totals_by_ide
    for (const ideTotal of metric.totals_by_ide) {
      accumulateIdeUser(statsAccumulator, ideTotal.ide, userId);
    }

    // Process totals_by_language_feature
    for (const langFeature of metric.totals_by_language_feature) {
      if (shouldFilterLanguage(langFeature.language, options.removeUnknownLanguages ?? false)) {
        continue;
      }

      const engagements = langFeature.code_generation_activity_count + langFeature.code_acceptance_activity_count;
      accumulateLanguageEngagement(statsAccumulator, langFeature.language, engagements);

      accumulateLanguageStats(
        languageAccumulator,
        userId,
        langFeature.language,
        langFeature.code_generation_activity_count,
        langFeature.code_acceptance_activity_count,
        langFeature.loc_added_sum,
        langFeature.loc_deleted_sum,
        langFeature.loc_suggested_to_add_sum,
        langFeature.loc_suggested_to_delete_sum
      );
    }

    // Process totals_by_model_feature
    for (const modelFeature of metric.totals_by_model_feature) {
      const engagements = modelFeature.code_generation_activity_count + modelFeature.code_acceptance_activity_count;
      accumulateModelEngagement(statsAccumulator, modelFeature.model, engagements);

      accumulateModelFeature(
        modelUsageAccumulator,
        date,
        userId,
        modelFeature.model,
        modelFeature.feature,
        modelFeature.user_initiated_interaction_count
      );
    }

    // Process totals_by_feature
    const featureImpacts: Array<{ feature: string; locAdded: number; locDeleted: number }> = [];

    for (const feature of metric.totals_by_feature) {
      // Feature Adoption
      accumulateFeatureAdoption(
        featureAdoptionAccumulator,
        userId,
        feature.feature,
        feature.user_initiated_interaction_count,
        feature.code_generation_activity_count
      );

      // Chat Users & Requests
      accumulateChatFeature(
        chatAccumulator,
        date,
        userId,
        feature.feature,
        feature.user_initiated_interaction_count
      );

      // Agent Heatmap (requests part)
      accumulateAgentHeatmapFromFeature(
        modelUsageAccumulator,
        date,
        userId,
        feature.feature,
        feature.user_initiated_interaction_count
      );

      // Collect impact data for batch processing
      featureImpacts.push({
        feature: feature.feature,
        locAdded: feature.loc_added_sum || 0,
        locDeleted: feature.loc_deleted_sum || 0,
      });
    }

    // Process all feature impacts for this metric
    accumulateFeatureImpacts(impactAccumulator, date, userId, featureImpacts);
  }

  // Compute all results
  return {
    stats: computeStats(statsAccumulator, filteredMetricsCount),
    userSummaries: computeUserSummaries(userSummaryAccumulator),
    engagementData: computeEngagementData(engagementAccumulator),
    chatUsersData: computeChatUsersData(chatAccumulator),
    chatRequestsData: computeChatRequestsData(chatAccumulator),
    languageStats: computeLanguageStats(languageAccumulator),
    modelUsageData: computeDailyModelUsageData(modelUsageAccumulator),
    featureAdoptionData: computeFeatureAdoptionData(featureAdoptionAccumulator),
    pruAnalysisData: computePRUAnalysisData(modelUsageAccumulator),
    agentModeHeatmapData: computeAgentModeHeatmapData(modelUsageAccumulator),
    modelFeatureDistributionData: computeModelFeatureDistributionData(modelUsageAccumulator),
    agentImpactData: computeAgentImpactData(impactAccumulator),
    codeCompletionImpactData: computeCodeCompletionImpactData(impactAccumulator),
    editModeImpactData: computeEditModeImpactData(impactAccumulator),
    inlineModeImpactData: computeInlineModeImpactData(impactAccumulator),
    askModeImpactData: computeAskModeImpactData(impactAccumulator),
    joinedImpactData: computeJoinedImpactData(impactAccumulator),
  };
}
