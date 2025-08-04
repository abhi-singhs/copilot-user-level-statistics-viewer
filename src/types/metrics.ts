export interface CopilotMetrics {
  report_start_day: string;
  report_end_day: string;
  day: string;
  enterprise_id: string;
  user_id: number;
  user_login: string;
  user_initiated_interaction_count: number;
  code_generation_activity_count: number;
  code_acceptance_activity_count: number;
  generated_loc_sum: number;
  accepted_loc_sum: number;
  totals_by_ide: Array<{
    ide: string;
    user_initiated_interaction_count: number;
    code_generation_activity_count: number;
    code_acceptance_activity_count: number;
    generated_loc_sum: number;
    accepted_loc_sum: number;
    last_known_plugin_version?: {
      sampled_at: string;
      plugin: string;
      plugin_version: string;
    };
  }>;
  totals_by_feature: Array<{
    feature: string;
    user_initiated_interaction_count: number;
    code_generation_activity_count: number;
    code_acceptance_activity_count: number;
    generated_loc_sum: number;
    accepted_loc_sum: number;
  }>;
  totals_by_language_feature: Array<{
    language: string;
    feature: string;
    code_generation_activity_count: number;
    code_acceptance_activity_count: number;
    generated_loc_sum: number;
    accepted_loc_sum: number;
  }>;
  totals_by_language_model: Array<{
    language: string;
    model: string;
    code_generation_activity_count: number;
    code_acceptance_activity_count: number;
    generated_loc_sum: number;
    accepted_loc_sum: number;
  }>;
  totals_by_model_feature: Array<{
    model: string;
    feature: string;
    user_initiated_interaction_count: number;
    code_generation_activity_count: number;
    code_acceptance_activity_count: number;
    generated_loc_sum: number;
    accepted_loc_sum: number;
  }>;
  used_agent: boolean;
  used_chat: boolean;
}

export interface MetricsStats {
  uniqueUsers: number;
  chatUsers: number;
  agentUsers: number;
  completionOnlyUsers: number;
  reportStartDay: string;
  reportEndDay: string;
  totalRecords: number;
}

export interface UserSummary {
  user_login: string;
  user_id: number;
  total_user_initiated_interactions: number;
  total_code_generation_activities: number;
  total_code_acceptance_activities: number;
  total_generated_loc: number;
  total_accepted_loc: number;
  days_active: number;
  used_agent: boolean;
  used_chat: boolean;
}
