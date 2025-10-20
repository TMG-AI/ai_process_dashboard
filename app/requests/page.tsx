'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Plus, Mail, Clock, LogOut } from 'lucide-react';
import { ColleagueRequest } from '@/lib/types';

export default function RequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<ColleagueRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRequests() {
      try {
        const response = await fetch('/api/requests');
        const data = await response.json();
        setRequests(data.requests || []);
      } catch (error) {
        console.error('Error fetching requests:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRequests();
  }, []);

  const getStatusBadge = (status: string) => {
    const styles = {
      submitted: 'bg-blue-100 text-blue-700',
      'in-progress': 'bg-yellow-100 text-yellow-700',
      complete: 'bg-green-100 text-green-700',
      dropped: 'bg-gray-100 text-gray-700',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getDaysSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
                  onClick={() => router.push('/requests')}
                  className="text-sm font-medium text-gray-900"
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
                  className="text-sm font-medium text-gray-500 hover:text-gray-900"
                >
                  Analytics
                </button>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {/* TODO: Implement new request modal */}}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                New Request
              </button>
              <button
                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="text-sm text-gray-600 mb-1">Submitted</div>
            <div className="text-3xl font-semibold text-gray-900">
              {requests.filter(r => r.status === 'submitted').length}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="text-sm text-gray-600 mb-1">In Progress</div>
            <div className="text-3xl font-semibold text-gray-900">
              {requests.filter(r => r.status === 'in-progress').length}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="text-sm text-gray-600 mb-1">Complete</div>
            <div className="text-3xl font-semibold text-gray-900">
              {requests.filter(r => r.status === 'complete').length}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="text-sm text-gray-600 mb-1">Avg Response Time</div>
            <div className="text-3xl font-semibold text-gray-900">2.3d</div>
          </div>
        </div>

        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No requests yet</h3>
            <p className="text-gray-600 mb-4">
              Colleague requests will appear here when they submit them
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-white border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{request.requesterName}</h3>
                      {getStatusBadge(request.status)}
                      {request.lastContactAt && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Last contact: {getDaysSince(request.lastContactAt)}d ago
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">{request.requesterEmail}</div>
                    {request.problemStatement && (
                      <div className="text-sm text-gray-700 mt-3">
                        <strong>Problem:</strong> {request.problemStatement}
                      </div>
                    )}
                    {request.desiredOutcome && (
                      <div className="text-sm text-gray-700 mt-2">
                        <strong>Desired Outcome:</strong> {request.desiredOutcome}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    {request.status === 'submitted' && (
                      <button
                        onClick={() => {/* Update status to in-progress */}}
                        className="px-3 py-1.5 bg-gray-900 text-white rounded text-xs font-medium hover:bg-gray-800"
                      >
                        Start Working
                      </button>
                    )}
                    {request.status === 'in-progress' && (
                      <>
                        <button
                          onClick={() => {/* Update status to complete */}}
                          className="px-3 py-1.5 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700"
                        >
                          Mark Complete
                        </button>
                        <button
                          onClick={() => {/* Send follow-up email */}}
                          className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-xs font-medium hover:bg-gray-50"
                        >
                          Follow Up
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t border-gray-100">
                  <span>Submitted: {new Date(request.submittedAt).toLocaleDateString()}</span>
                  {request.followUpCount > 0 && (
                    <span>Follow-ups: {request.followUpCount}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
