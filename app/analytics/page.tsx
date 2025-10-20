'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface Analytics {
  totalHours: number;
  buildingRatio: number;
  debuggingRatio: number;
  completionRate: number;
  avgDebugTime: number;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch('/api/analytics');
        const data = await response.json();
        setAnalytics(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

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
                  onClick={() => router.push('/requests')}
                  className="text-sm font-medium text-gray-500 hover:text-gray-900"
                >
                  Requests
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
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Time Period Selector */}
        <div className="flex gap-2 mb-8">
          <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">
            This Week
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
            This Month
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
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
              {analytics?.totalHours || 0}h
            </div>
            <div className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +12% from last week
            </div>
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

        {/* Charts Placeholder */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Building vs Debugging Hours</h3>
            <div className="h-64 flex items-center justify-center text-gray-400">
              Chart placeholder - integrate charting library
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Project Progress Over Time</h3>
            <div className="h-64 flex items-center justify-center text-gray-400">
              Chart placeholder - integrate charting library
            </div>
          </div>
        </div>

        {/* Project Performance */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Project Performance</h3>
          <div className="text-sm text-gray-600">
            Detailed project metrics coming soon...
          </div>
        </div>
      </main>
    </div>
  );
}
