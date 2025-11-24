/**
 * Branded types for IDs and other domain-specific values.
 * These provide compile-time type safety for values that are semantically different
 * but have the same underlying type.
 * 
 * Usage:
 *   const userId: UserId = 123 as UserId;
 *   const enterpriseId: EnterpriseId = "abc" as EnterpriseId;
 */

// Brand utility type
declare const __brand: unique symbol;
type Brand<T, B> = T & { readonly [__brand]: B };

// User-related branded types
export type UserId = Brand<number, 'UserId'>;
export type UserLogin = Brand<string, 'UserLogin'>;

// Enterprise-related branded types
export type EnterpriseId = Brand<string, 'EnterpriseId'>;
export type EnterpriseName = Brand<string, 'EnterpriseName'>;

// Date-related branded types
export type MetricDate = Brand<string, 'MetricDate'>;      // YYYY-MM-DD format
export type ISODateString = Brand<string, 'ISODateString'>; // Full ISO 8601 format

// Model-related branded types
export type ModelId = Brand<string, 'ModelId'>;
export type ModelName = Brand<string, 'ModelName'>;

// IDE-related branded types
export type IDEId = Brand<string, 'IDEId'>;
export type IDEName = Brand<string, 'IDEName'>;

// Language-related branded types
export type LanguageId = Brand<string, 'LanguageId'>;
export type LanguageName = Brand<string, 'LanguageName'>;

// Feature-related branded types
export type FeatureId = Brand<string, 'FeatureId'>;
export type FeatureName = Brand<string, 'FeatureName'>;

// Plugin-related branded types
export type PluginVersion = Brand<string, 'PluginVersion'>;

// Helper functions for creating branded types
export const createUserId = (id: number): UserId => id as UserId;
export const createUserLogin = (login: string): UserLogin => login as UserLogin;
export const createEnterpriseId = (id: string): EnterpriseId => id as EnterpriseId;
export const createEnterpriseName = (name: string): EnterpriseName => name as EnterpriseName;
export const createMetricDate = (date: string): MetricDate => date as MetricDate;
export const createISODateString = (date: string): ISODateString => date as ISODateString;
export const createModelId = (id: string): ModelId => id as ModelId;
export const createModelName = (name: string): ModelName => name as ModelName;
export const createIDEId = (id: string): IDEId => id as IDEId;
export const createIDEName = (name: string): IDEName => name as IDEName;
export const createLanguageId = (id: string): LanguageId => id as LanguageId;
export const createLanguageName = (name: string): LanguageName => name as LanguageName;
export const createFeatureId = (id: string): FeatureId => id as FeatureId;
export const createFeatureName = (name: string): FeatureName => name as FeatureName;
export const createPluginVersion = (version: string): PluginVersion => version as PluginVersion;

// Type guards for branded types
export const isUserId = (value: unknown): value is UserId => 
  typeof value === 'number' && Number.isInteger(value);

export const isUserLogin = (value: unknown): value is UserLogin =>
  typeof value === 'string' && value.length > 0;

export const isMetricDate = (value: unknown): value is MetricDate =>
  typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);

export const isISODateString = (value: unknown): value is ISODateString =>
  typeof value === 'string' && !isNaN(Date.parse(value));
