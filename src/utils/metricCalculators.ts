import { CopilotMetrics, MetricsStats } from '../types/metrics';
import { SERVICE_VALUE_RATE, getModelMultiplier, isPremiumModel } from '../domain/modelConfig';

export interface DailyEngagementData {
  date: string;
  activeUsers: number;
  totalUsers: number;
  engagementPercentage: number;
}

export interface DailyChatUsersData {
  date: string;
  askModeUsers: number;
  agentModeUsers: number;
  editModeUsers: number;
  inlineModeUsers: number;
}

export interface DailyChatRequestsData {
  date: string;
  askModeRequests: number;
  agentModeRequests: number;
  editModeRequests: number;
  inlineModeRequests: number;
}

export interface LanguageStats {
  language: string;
  totalGenerations: number;
  totalAcceptances: number;
  totalEngagements: number;
  uniqueUsers: number;
  locAdded: number;
  locDeleted: number;
  locSuggestedToAdd: number;
  locSuggestedToDelete: number;
}

export interface DailyModelUsageData {
  date: string;
  pruModels: number;
  standardModels: number;
  unknownModels: number;
  totalPRUs: number;
  serviceValue: number;
}

export interface FeatureAdoptionData {
  totalUsers: number;
  completionUsers: number;
  chatUsers: number;
  agentModeUsers: number;
  askModeUsers: number;
  editModeUsers: number;
  inlineModeUsers: number;
  codeReviewUsers: number;
}

export interface DailyPRUAnalysisData {
  date: string;
  pruRequests: number;
  standardRequests: number;
  pruPercentage: number;
  totalPRUs: number;
  serviceValue: number;
  topModel: string;
  topModelPRUs: number;
  topModelIsPremium: boolean;
  models: Array<{
    name: string;
    requests: number;
    prus: number;
    isPremium: boolean;
    multiplier: number;
  }>;
}

export interface AgentModeHeatmapData {
  date: string;
  agentModeRequests: number;
  uniqueUsers: number;
  intensity: number;
  serviceValue: number;
}

export interface ModelFeatureDistributionData {
  model: string;
  modelDisplayName: string;
  multiplier: number;
  features: {
    agentMode: number;
    askMode: number;
    editMode: number;
    inlineMode: number;
    codeCompletion: number;
    codeReview: number;
    other: number;
  };
  totalInteractions: number;
  totalPRUs: number;
  serviceValue: number;
}

export interface AgentImpactData {
  date: string;
  locAdded: number;
  locDeleted: number;
  netChange: number;
  userCount: number;
  totalUniqueUsers?: number; 
}

export interface CodeCompletionImpactData {
  date: string;
  locAdded: number;
  locDeleted: number;
  netChange: number;
  userCount: number;
  totalUniqueUsers?: number;
}

export interface ModeImpactData {
  date: string;
  locAdded: number;
  locDeleted: number;
  netChange: number;
  userCount: number;
  totalUniqueUsers?: number;
}

export function calculateStats(metrics: CopilotMetrics[]): MetricsStats {
  if (metrics.length === 0) {
    return {
      uniqueUsers: 0,
      chatUsers: 0,
      agentUsers: 0,
      completionOnlyUsers: 0,
      reportStartDay: '',
      reportEndDay: '',
      totalRecords: 0,
      topLanguage: { name: 'N/A', engagements: 0 },
      topIde: { name: 'N/A', entries: 0 },
      topModel: { name: 'N/A', engagements: 0 },
    };
  }

  // Get unique users by user_id and their usage patterns
  const userUsageMap = new Map<number, { used_chat: boolean; used_agent: boolean }>();
  
  for (const metric of metrics) {
    const existingUsage = userUsageMap.get(metric.user_id) || { used_chat: false, used_agent: false };
    userUsageMap.set(metric.user_id, {
      used_chat: existingUsage.used_chat || metric.used_chat,
      used_agent: existingUsage.used_agent || metric.used_agent,
    });
  }

  // Count different user types
  let chatUsers = 0;
  let agentUsers = 0;
  let completionOnlyUsers = 0;

  for (const usage of userUsageMap.values()) {
    if (usage.used_chat) chatUsers++;
    if (usage.used_agent) agentUsers++;
    if (!usage.used_chat && !usage.used_agent) completionOnlyUsers++;
  }

  // Calculate top language by total engagements
  const languageEngagements = new Map<string, number>();
  for (const metric of metrics) {
    for (const langFeature of metric.totals_by_language_feature) {
      const current = languageEngagements.get(langFeature.language) || 0;
      languageEngagements.set(
        langFeature.language, 
        current + langFeature.code_generation_activity_count + langFeature.code_acceptance_activity_count
      );
    }
  }
  
  const sortedLanguages = Array.from(languageEngagements.entries())
    .sort((a, b) => b[1] - a[1]);
  
  const topLanguageEntry = sortedLanguages[0];
  const topLanguage = topLanguageEntry 
    ? { name: topLanguageEntry[0], engagements: topLanguageEntry[1] }
    : { name: 'N/A', engagements: 0 };

  // Calculate top IDE by number of unique users
  const ideUsers = new Map<string, Set<number>>();
  for (const metric of metrics) {
    for (const ideTotal of metric.totals_by_ide) {
      if (!ideUsers.has(ideTotal.ide)) {
        ideUsers.set(ideTotal.ide, new Set());
      }
      ideUsers.get(ideTotal.ide)!.add(metric.user_id);
    }
  }
  
  const topIdeEntry = Array.from(ideUsers.entries())
    .map(([ide, userSet]) => [ide, userSet.size] as [string, number])
    .sort((a, b) => b[1] - a[1])[0];
  const topIde = topIdeEntry 
    ? { name: topIdeEntry[0], entries: topIdeEntry[1] }
    : { name: 'N/A', entries: 0 };

  // Calculate top model by total engagements
  const modelEngagements = new Map<string, number>();
  for (const metric of metrics) {
    for (const modelFeature of metric.totals_by_model_feature) {
      const current = modelEngagements.get(modelFeature.model) || 0;
      modelEngagements.set(
        modelFeature.model, 
        current + modelFeature.code_generation_activity_count + modelFeature.code_acceptance_activity_count
      );
    }
  }
  
  const topModelEntry = Array.from(modelEngagements.entries())
    .sort((a, b) => b[1] - a[1])[0];
  const topModel = topModelEntry 
    ? { name: topModelEntry[0], engagements: topModelEntry[1] }
    : { name: 'N/A', engagements: 0 };
  
  // Get report period from first record (assuming all records have the same period)
  const firstRecord = metrics[0];
  
  return {
    uniqueUsers: userUsageMap.size,
    chatUsers,
    agentUsers,
    completionOnlyUsers,
    reportStartDay: firstRecord.report_start_day,
    reportEndDay: firstRecord.report_end_day,
    totalRecords: metrics.length,
    topLanguage,
    topIde,
    topModel,
  };
}

export function calculateDailyPRUAnalysis(metrics: CopilotMetrics[]): DailyPRUAnalysisData[] {
  const dailyMetrics = new Map<string, {
    pruRequests: number;
    standardRequests: number;
    totalPRUs: number;
    modelStats: Map<string, { requests: number; prus: number; multiplier: number; isPremium: boolean }>;
  }>();
  
  for (const metric of metrics) {
    const date = metric.day;
    if (!dailyMetrics.has(date)) {
      dailyMetrics.set(date, { 
        pruRequests: 0, 
        standardRequests: 0, 
        totalPRUs: 0,
        modelStats: new Map()
      });
    }

    const dayData = dailyMetrics.get(date)!;

    for (const modelFeature of metric.totals_by_model_feature) {
      const model = modelFeature.model.toLowerCase();
      const count = modelFeature.user_initiated_interaction_count;
      const multiplier = getModelMultiplier(model);
      const prus = count * multiplier;
      const premium = isPremiumModel(model);

      dayData.totalPRUs += prus;

      const existing = dayData.modelStats.get(model);
      if (existing) {
        existing.requests += count;
        existing.prus += prus;
      } else {
        dayData.modelStats.set(model, { requests: count, prus, multiplier, isPremium: premium });
      }

      if (multiplier === 0) {
        dayData.standardRequests += count;
      } else {
        dayData.pruRequests += count;
      }
    }
  }
  
  return Array.from(dailyMetrics.entries())
    .map(([date, data]) => {
      const total = data.pruRequests + data.standardRequests;
      const modelsArray = Array.from(data.modelStats.entries())
        .map(([name, stats]) => ({
          name,
          requests: stats.requests,
          prus: Math.round(stats.prus * 100) / 100,
          isPremium: stats.isPremium,
          multiplier: stats.multiplier
        }))
        // Sort models by PRUs (desc), then by requests (desc) for deterministic ordering
        .sort((a, b) => (b.prus - a.prus) || (b.requests - a.requests));
      const topModelEntry = modelsArray[0];
      const topModelName = topModelEntry ? topModelEntry.name : 'unknown';
      return {
        date,
        pruRequests: data.pruRequests,
        standardRequests: data.standardRequests,
        pruPercentage: total > 0 ? Math.round((data.pruRequests / total) * 100 * 100) / 100 : 0,
        totalPRUs: Math.round(data.totalPRUs * 100) / 100,
        serviceValue: Math.round(data.totalPRUs * SERVICE_VALUE_RATE * 100) / 100,
        topModel: topModelName,
        topModelPRUs: topModelEntry ? topModelEntry.prus : 0,
        topModelIsPremium: topModelEntry ? topModelEntry.isPremium : false,
        models: modelsArray
      };
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function calculateFeatureImpactData(metrics: CopilotMetrics[], featureNames: string[]): ModeImpactData[] {
  if (metrics.length === 0 || featureNames.length === 0) {
    return [];
  }

  const dailyData = new Map<string, {
    locAdded: number;
    locDeleted: number;
    userIds: Set<number>;
  }>();

  const allDates = Array.from(new Set(metrics.map(metric => metric.day)));
  for (const date of allDates) {
    if (!dailyData.has(date)) {
      dailyData.set(date, {
        locAdded: 0,
        locDeleted: 0,
        userIds: new Set<number>(),
      });
    }
  }

  const allUniqueUsers = new Set<number>();

  for (const metric of metrics) {
    let totalLocAdded = 0;
    let totalLocDeleted = 0;
    let hasActivity = false;

    for (const feature of metric.totals_by_feature) {
      if (!featureNames.includes(feature.feature)) continue;

      const locAdded = feature.loc_added_sum || 0;
      const locDeleted = feature.loc_deleted_sum || 0;

      totalLocAdded += locAdded;
      totalLocDeleted += locDeleted;

      if (locAdded !== 0 || locDeleted !== 0) {
        hasActivity = true;
      }
    }

    const date = metric.day;
    const dayData = dailyData.get(date);
    if (!dayData) {
      continue;
    }

    if (hasActivity) {
      dayData.locAdded += totalLocAdded;
      dayData.locDeleted += totalLocDeleted;
      dayData.userIds.add(metric.user_id);
      allUniqueUsers.add(metric.user_id);
    }
  }

  return Array.from(dailyData.entries())
    .map(([date, data]) => ({
      date,
      locAdded: data.locAdded,
      locDeleted: data.locDeleted,
      netChange: data.locAdded - data.locDeleted,
      userCount: data.userIds.size,
      totalUniqueUsers: allUniqueUsers.size
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function calculateJoinedImpactData(metrics: CopilotMetrics[]): ModeImpactData[] {
  return calculateFeatureImpactData(metrics, [
    'code_completion',
    'chat_panel_ask_mode',
    'chat_panel_edit_mode',
    'chat_inline',
    'chat_panel_agent_mode',
    'agent_edit'
  ]);
}

export function calculateEditModeImpactData(metrics: CopilotMetrics[]): ModeImpactData[] {
  return calculateFeatureImpactData(metrics, ['chat_panel_edit_mode']);
}

export function calculateInlineModeImpactData(metrics: CopilotMetrics[]): ModeImpactData[] {
  return calculateFeatureImpactData(metrics, ['chat_inline']);
}

export function calculateAskModeImpactData(metrics: CopilotMetrics[]): ModeImpactData[] {
  return calculateFeatureImpactData(metrics, ['chat_panel_ask_mode']);
}
