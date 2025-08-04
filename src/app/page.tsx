'use client';

import { useState } from 'react';
import { CopilotMetrics, MetricsStats, UserSummary } from '../types/metrics';
import { parseMetricsFile, calculateStats, calculateUserSummaries } from '../utils/metricsParser';
import UniqueUsersView from '../components/UniqueUsersView';

type ViewMode = 'overview' | 'users';

export default function Home() {
  const [metrics, setMetrics] = useState<CopilotMetrics[]>([]);
  const [stats, setStats] = useState<MetricsStats | null>(null);
  const [userSummaries, setUserSummaries] = useState<UserSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewMode>('overview');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const fileContent = await file.text();
      const parsedMetrics = parseMetricsFile(fileContent);
      const calculatedStats = calculateStats(parsedMetrics);
      const userSummaries = calculateUserSummaries(parsedMetrics);
      
      setMetrics(parsedMetrics);
      setStats(calculatedStats);
      setUserSummaries(userSummaries);
    } catch (err) {
      setError(`Failed to parse file: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetData = () => {
    setStats(null);
    setMetrics([]);
    setUserSummaries([]);
    setError(null);
    setCurrentView('overview');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            GitHub Copilot Usage Metrics Viewer
          </h1>
          <p className="text-gray-600">
            Upload your GitHub Copilot metrics file to view usage statistics
          </p>
        </div>

        {/* File Upload Section */}
        {!stats && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Metrics File</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-700">
                  Click to upload or drag and drop
                </span>
                <span className="text-xs text-gray-500">JSON files only</span>
              </label>
            </div>
            
            {isLoading && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  <span className="text-gray-600">Processing file...</span>
                </div>
              </div>
            )}
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
          </div>
        )}

        {/* Show Unique Users View */}
        {stats && currentView === 'users' && (
          <UniqueUsersView 
            users={userSummaries} 
            onBack={() => setCurrentView('overview')} 
          />
        )}

        {/* Statistics Section */}
        {stats && currentView === 'overview' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Metrics Overview</h2>
              <button
                onClick={resetData}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors"
              >
                Upload New File
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <button
                onClick={() => setCurrentView('users')}
                className="bg-blue-50 rounded-lg p-4 border border-blue-200 hover:bg-blue-100 transition-colors text-left group"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-600 group-hover:text-blue-700">Unique Users</p>
                    <p className="text-2xl font-bold text-blue-900">{stats.uniqueUsers.toLocaleString()}</p>
                  </div>
                </div>
              </button>

              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-green-600">Total Records</p>
                    <p className="text-2xl font-bold text-green-900">{stats.totalRecords.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-purple-600">Report Start</p>
                    <p className="text-sm font-bold text-purple-900">{formatDate(stats.reportStartDay)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-orange-600">Report End</p>
                    <p className="text-sm font-bold text-orange-900">{formatDate(stats.reportEndDay)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Reporting Period</h3>
              <p className="text-gray-700">
                Data covers the period from <strong>{formatDate(stats.reportStartDay)}</strong> to{' '}
                <strong>{formatDate(stats.reportEndDay)}</strong>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
