'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Bug, Search, LogOut } from 'lucide-react';
import { DebugLog } from '@/lib/types';

export default function DebugLogsPage() {
  const router = useRouter();
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('all');

  useEffect(() => {
    async function fetchDebugLogs() {
      try {
        const response = await fetch('/api/debuglogs');
        const data = await response.json();
        setDebugLogs(data.debugLogs || []);
      } catch (error) {
        console.error('Error fetching debug logs:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDebugLogs();
  }, []);

  const filteredLogs = debugLogs.filter(log => {
    const matchesSearch = !searchQuery ||
      log.errorDescription?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.hypothesis?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.solution?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesProject = selectedProject === 'all' || log.projectId === selectedProject;

    return matchesSearch && matchesProject;
  });

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
                  className="text-sm font-medium text-gray-900"
                >
                  Debug Logs
                </button>
                <button
                  onClick={() => router.push('/analytics')}
                  className="text-sm font-medium text-gray-500 hover:text-gray-900"
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
        {/* Search and Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search error descriptions, hypotheses, solutions..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              <option value="all">All Projects</option>
              {/* Add project options dynamically */}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="text-sm text-gray-600 mb-1">Total Sessions</div>
            <div className="text-3xl font-semibold text-gray-900">{debugLogs.length}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="text-sm text-gray-600 mb-1">Avg Time</div>
            <div className="text-3xl font-semibold text-gray-900">
              {debugLogs.length > 0
                ? Math.round(debugLogs.reduce((sum, log) => sum + (log.timeSpentMinutes || 0), 0) / debugLogs.length)
                : 0}m
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="text-sm text-gray-600 mb-1">Resolved</div>
            <div className="text-3xl font-semibold text-gray-900">
              {debugLogs.filter(log => log.solution).length}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="text-sm text-gray-600 mb-1">This Week</div>
            <div className="text-3xl font-semibold text-gray-900">
              {debugLogs.filter(log => {
                const logDate = new Date(log.createdAt);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return logDate > weekAgo;
              }).length}
            </div>
          </div>
        </div>

        {/* Debug Logs List */}
        {filteredLogs.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <Bug className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No debug logs yet</h3>
            <p className="text-gray-600">
              Debug logs will appear here when you hit the 60-minute debugging checkpoint
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="bg-white border border-gray-200 rounded-lg p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Bug className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-500">
                        {new Date(log.createdAt).toLocaleDateString()} • {log.timeSpentMinutes}m
                      </span>
                      {log.solution && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                          Resolved
                        </span>
                      )}
                    </div>

                    {log.errorDescription && (
                      <div className="mb-3">
                        <div className="text-xs font-medium text-gray-500 mb-1">Error Description</div>
                        <div className="text-sm text-gray-900">{log.errorDescription}</div>
                      </div>
                    )}

                    {log.attempts && log.attempts.length > 0 && (
                      <div className="mb-3">
                        <div className="text-xs font-medium text-gray-500 mb-1">Attempts</div>
                        <div className="space-y-1">
                          {log.attempts.map((attempt, idx) => (
                            <div key={idx} className="text-sm text-gray-700 pl-3 border-l-2 border-gray-200">
                              {attempt.attempt}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {log.hypothesis && (
                      <div className="mb-3">
                        <div className="text-xs font-medium text-gray-500 mb-1">Hypothesis</div>
                        <div className="text-sm text-gray-700">{log.hypothesis}</div>
                      </div>
                    )}

                    {log.solution && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="text-xs font-medium text-green-800 mb-1">Solution</div>
                        <div className="text-sm text-green-900">{log.solution}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
