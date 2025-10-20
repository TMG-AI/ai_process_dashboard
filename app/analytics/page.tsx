'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { TrendingUp, TrendingDown, Clock, CheckCircle2, AlertCircle, LogOut } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Analytics {
  totalHours: number;
  hoursTrend: number | null;
  buildingRatio: number;
  debuggingRatio: number;
  completionRate: number;
  avgDebugTime: number;
  projectPerformance: Array<{
    id: string;
    name: string;
    buildingHours: number;
    debuggingHours: number;
    totalHours: number;
    debugRatio: number;
    progress: number;
    status: string;
  }>;
  chartData: Array<{
    date: string;
    dateLabel: string;
    building: number;
    debugging: number;
  }>;
  period: string;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('week');

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      try {
        const response = await fetch(`/api/analytics?period=${period}`);
        const data = await response.json();
        setAnalytics(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [period]);

  const formatHours = (hours: number) => {
    return `${hours.toFixed(1)}h`;
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-semibold text-gray-900">Project Autopilot</h1>
              <nav className="flex gap-6">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="text-sm font-medium text-gray-500 hover:text-gray-900"
                >
                  Overview
                </button>
                <button
                  onClick={() => router.push('/debug-logs')}
                  className="text-sm font-medium text-gray-500 hover:text-gray-900"
                >
                  Debug Logs
                </button>
                <button
                  onClick={() => router.push('/analytics')}
                  className="text-sm font-medium text-gray-900"
                >
                  Analytics
                </button>
              </nav>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Time Period Selector */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setPeriod('week')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              period === 'week'
                ? 'bg-gray-900 text-white'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              period === 'month'
                ? 'bg-gray-900 text-white'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setPeriod('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              period === 'all'
                ? 'bg-gray-900 text-white'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            All Time
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-gray-600" />
              <div className="text-sm text-gray-600">Total Hours</div>
            </div>
            <div className="text-3xl font-semibold text-gray-900">
              {formatHours(analytics?.totalHours || 0)}
            </div>
            {analytics?.hoursTrend !== null && analytics?.hoursTrend !== undefined && (
              <div className={`text-xs mt-2 flex items-center gap-1 ${
                analytics.hoursTrend >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {analytics.hoursTrend >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {Math.abs(analytics.hoursTrend)}% from last {period === 'week' ? 'week' : 'month'}
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-gray-600" />
              <div className="text-sm text-gray-600">Building Ratio</div>
            </div>
            <div className="text-3xl font-semibold text-gray-900">
              {analytics?.buildingRatio || 0}%
            </div>
            <div className="text-xs text-gray-500 mt-2">
              vs {analytics?.debuggingRatio || 0}% debugging
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-gray-600" />
              <div className="text-sm text-gray-600">Completion Rate</div>
            </div>
            <div className="text-3xl font-semibold text-gray-900">
              {analytics?.completionRate || 0}%
            </div>
            <div className="text-xs text-gray-500 mt-2">
              of started projects
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-gray-600" />
              <div className="text-sm text-gray-600">Avg Debug Time</div>
            </div>
            <div className="text-3xl font-semibold text-gray-900">
              {analytics?.avgDebugTime || 0}m
            </div>
            <div className="text-xs text-gray-500 mt-2">
              per session
            </div>
          </div>
        </div>

        {/* Daily Hours Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">Daily Hours Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics?.chartData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="dateLabel"
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
                label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="building"
                stackId="1"
                stroke="#6b7280"
                fill="#6b7280"
                name="Building"
              />
              <Area
                type="monotone"
                dataKey="debugging"
                stackId="1"
                stroke="#ef4444"
                fill="#ef4444"
                name="Debugging"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Project Performance */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Project Performance</h3>
          {analytics?.projectPerformance && analytics.projectPerformance.length > 0 ? (
            <div className="space-y-3">
              {analytics.projectPerformance.map((project) => (
                <div
                  key={project.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium text-gray-900">{project.name}</h4>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          project.status === 'complete'
                            ? 'bg-green-100 text-green-700'
                            : project.status === 'paused'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {project.status}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatHours(project.totalHours)} total
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Building: </span>
                      <span className="font-medium text-gray-900">
                        {formatHours(project.buildingHours)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Debugging: </span>
                      <span className="font-medium text-gray-900">
                        {formatHours(project.debuggingHours)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Debug Ratio: </span>
                      <span
                        className={`font-medium ${
                          project.debugRatio > 60 ? 'text-red-600' : 'text-gray-900'
                        }`}
                      >
                        {project.debugRatio}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No project data available for this time period
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
