"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Play, Pause, AlertCircle, CheckCircle2, Plus, ChevronDown, TrendingUp, Trash2 } from 'lucide-react';
import { Project } from '@/lib/types';
import { useTimerStore } from '@/lib/store/timer-store';

export default function DashboardPage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState<string | null>(null);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Zustand timer store
  const {
    activeProjectId,
    timerType,
    elapsedSeconds,
    currentTimeLogId,
    setActiveTimer,
    stopTimer,
    incrementSeconds,
  } = useTimerStore();

  const projects = projectsList;

  // Fetch projects from the database
  useEffect(() => {
    async function fetchProjects() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/projects');
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const data = await response.json();
        setProjectsList(data.projects);
        setError(null);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects. Make sure Redis is configured in .env.local');
      } finally {
        setIsLoading(false);
      }
    }

    fetchProjects();
  }, []);

  // Start timer
  const handleStartTimer = async (projectId: string, type: 'building' | 'debugging') => {
    try {
      const response = await fetch('/api/timelog/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, timerType: type }),
      });

      if (!response.ok) throw new Error('Failed to start timer');

      const data = await response.json();
      setActiveTimer(projectId, type, data.timeLog.id);
    } catch (error) {
      console.error('Error starting timer:', error);
      alert('Failed to start timer. Please try again.');
    }
  };

  // Stop timer (wrapped in useCallback to prevent unnecessary re-renders in useEffect)
  const handleStopTimer = useCallback(async () => {
    if (!currentTimeLogId || !activeProjectId || !timerType) return;

    const elapsedMinutes = Math.floor(elapsedSeconds / 60);
    const elapsedHours = (elapsedMinutes / 60).toFixed(1);

    try {
      const response = await fetch('/api/timelog/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeLogId: currentTimeLogId,
          projectId: activeProjectId,
          timerType,
          elapsedMinutes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to stop timer');
      }

      // Only reset timer after successful API call
      stopTimer();

      // Refresh projects to get updated hours
      const projectsResponse = await fetch('/api/projects');
      if (projectsResponse.ok) {
        const data = await projectsResponse.json();
        setProjectsList(data.projects);
      }
    } catch (error) {
      console.error('Error stopping timer:', error);
      alert(
        `Failed to stop timer. Your ${elapsedHours}h of work is NOT lost - the timer will keep running. Please try stopping again or check your connection.`
      );
      // DON'T call stopTimer() on error - preserve the timer state
    }
  }, [currentTimeLogId, activeProjectId, timerType, elapsedSeconds, stopTimer, setProjectsList]);

  const handleCompleteProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'complete',
          progress: 100,
          completedAt: new Date().toISOString()
        }),
      });

      if (!response.ok) throw new Error('Failed to complete project');

      const { project } = await response.json();
      setProjectsList(prev => prev.map(p => p.id === projectId ? project : p));
      setShowModal(null);
      setSelectedProjectId(null);
    } catch (err) {
      console.error('Error completing project:', err);
      alert('Failed to complete project. Please try again.');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete project');

      setProjectsList(prev => prev.filter(p => p.id !== projectId));
      setShowModal(null);
      setSelectedProjectId(null);
      if (activeProjectId === projectId) {
        stopTimer();
      }
    } catch (err) {
      console.error('Error deleting project:', err);
      alert('Failed to delete project. Please try again.');
    }
  };

  const handlePauseProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paused' }),
      });

      if (!response.ok) throw new Error('Failed to pause project');

      const { project } = await response.json();
      setProjectsList(prev => prev.map(p => p.id === projectId ? project : p));
      setShowModal(null);
    } catch (err) {
      console.error('Error pausing project:', err);
      alert('Failed to pause project. Please try again.');
    }
  };

  // Calculate metrics
  const activeProjects = projects.filter(p => p.status !== 'complete' && p.status !== 'paused');
  const buildingHours = projects.reduce((sum, p) => sum + p.buildingHours, 0);
  const debuggingHours = projects.reduce((sum, p) => sum + p.debuggingHours, 0);
  const completedThisMonth = projects.filter(p => {
    if (!p.completedAt) return false;
    const completedDate = new Date(p.completedAt);
    const now = new Date();
    return completedDate.getMonth() === now.getMonth() &&
           completedDate.getFullYear() === now.getFullYear();
  }).length;

  // Calculate insights
  const insights = projects
    .filter(p => {
      const total = p.buildingHours + p.debuggingHours;
      return total > 0 && (p.debuggingHours / total) > 0.6;
    })
    .map(p => ({
      type: 'warning',
      title: 'Debugging time elevated',
      description: `${Math.round((p.debuggingHours / (p.buildingHours + p.debuggingHours)) * 100)}% of ${p.name} time spent debugging (${p.debuggingHours.toFixed(1)}h) vs. building (${p.buildingHours.toFixed(1)}h)`,
      action: 'Review debug logs',
      projectId: p.id,
    }));

  // Timer logic with nudges
  useEffect(() => {
    if (!activeProjectId) return;

    const interval = setInterval(() => {
      incrementSeconds();

      // Check for nudges
      if (timerType === 'debugging') {
        if (elapsedSeconds === 3600) setShowModal('debug-60min'); // 60 minutes
        if (elapsedSeconds === 5400) { // 90 minutes
          setShowModal('debug-90min');
          handleStopTimer();
        }
      } else if (timerType === 'building') {
        if (elapsedSeconds === 7200) setShowModal('building-2hr'); // 2 hours
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeProjectId, elapsedSeconds, timerType, incrementSeconds, handleStopTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const HomeView = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading projects...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-900 font-semibold mb-2">Error Loading Projects</h3>
          <p className="text-red-800 text-sm">{error}</p>
          <p className="text-red-700 text-sm mt-2">
            Make sure you have set up your Upstash Redis credentials in <code className="bg-red-100 px-1">.env.local</code>
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="text-sm text-gray-600 mb-1">Active Projects</div>
          <div className="text-3xl font-semibold text-gray-900">{activeProjects.length}</div>
          <div className="text-xs text-gray-500 mt-1">of 3 max</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="text-sm text-gray-600 mb-1">Building Hours</div>
          <div className="text-3xl font-semibold text-gray-900">
            {buildingHours.toFixed(1)}
          </div>
          <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> this week
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="text-sm text-gray-600 mb-1">Debugging Hours</div>
          <div className="text-3xl font-semibold text-gray-900">
            {debuggingHours.toFixed(1)}
          </div>
          <div className="text-xs text-amber-600 mt-1">this week</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="text-sm text-gray-600 mb-1">Completed</div>
          <div className="text-3xl font-semibold text-gray-900">{completedThisMonth}</div>
          <div className="text-xs text-gray-500 mt-1">this month</div>
        </div>
      </div>

      {insights.length > 0 && insights.map((insight, idx) => (
        <div key={idx} className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-medium text-amber-900">{insight.title}</div>
            <div className="text-sm text-amber-800 mt-1">{insight.description}</div>
          </div>
          <button className="text-sm font-medium text-amber-900 hover:text-amber-700">
            {insight.action} →
          </button>
        </div>
      ))}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Active Projects</h2>
          <button
            onClick={() => {
              if (activeProjects.length >= 3) {
                setShowModal('limit');
              } else {
                router.push('/projects/new');
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <h3 className="text-gray-900 font-semibold mb-2">No projects yet</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first project</p>
            <button
              onClick={() => router.push('/projects/new')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Create First Project
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map(project => (
            <div
              key={project.id}
              className="bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {project.platform || 'N/A'}
                      </span>
                      {project.stuckSince && (
                        <span className="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Stuck since {new Date(project.stuckSince).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">{project.nextAction}</div>
                  </div>
                  <button
                    onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <ChevronDown className={`w-5 h-5 transition-transform ${expandedProject === project.id ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                    <span>Progress</span>
                    <span className="font-medium text-gray-700">{project.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-900 transition-all duration-500"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {expandedProject === project.id && (
                  <div className="mb-3 pt-3 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <div className="text-gray-500 mb-1">Building Time</div>
                        <div className="font-semibold text-gray-900">{project.buildingHours.toFixed(1)}h</div>
                      </div>
                      <div>
                        <div className="text-gray-500 mb-1">Debugging Time</div>
                        <div className="font-semibold text-gray-900">{project.debuggingHours.toFixed(1)}h</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedProjectId(project.id);
                          setShowModal('complete-confirm');
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 text-sm font-medium"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Mark Complete
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProjectId(project.id);
                          setShowModal('delete-confirm');
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 text-sm font-medium"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Project
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  {activeProjectId === project.id ? (
                    <button
                      onClick={handleStopTimer}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 font-medium text-sm"
                    >
                      <Pause className="w-4 h-4" />
                      Stop Timer ({formatTime(elapsedSeconds)})
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleStartTimer(project.id, 'building')}
                        disabled={activeProjectId !== null}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-100 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Play className="w-4 h-4" />
                        Start Building
                      </button>
                      <button
                        onClick={() => handleStartTimer(project.id, 'debugging')}
                        disabled={activeProjectId !== null}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-100 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Play className="w-4 h-4" />
                        Start Debugging
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>
    </div>
    );
  };


  const Modal = ({ type }: { type: string }) => {
    if (type === 'complete-confirm') {
      const project = projects.find(p => p.id === selectedProjectId);
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Mark Project as Complete?</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to mark &quot;{project?.name}&quot; as complete? This will set the progress to 100% and archive the project.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(null)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => selectedProjectId && handleCompleteProject(selectedProjectId)}
                className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
              >
                Mark Complete
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (type === 'delete-confirm') {
      const project = projects.find(p => p.id === selectedProjectId);
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Project?</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete &quot;{project?.name}&quot;? This action cannot be undone. All time logs and progress will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(null)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => selectedProjectId && handleDeleteProject(selectedProjectId)}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (type === 'limit') {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Limit Reached</h3>
            <p className="text-gray-600 mb-4">
              You&apos;re already managing 3 active projects. Pause one before starting another.
            </p>

            <div className="space-y-2 mb-4">
              <p className="text-sm font-medium text-gray-700">Select a project to pause:</p>
              {activeProjects.map(project => (
                <button
                  key={project.id}
                  onClick={async () => {
                    await handlePauseProject(project.id);
                    router.push('/projects/new');
                  }}
                  className="w-full text-left px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
                >
                  <div className="font-medium text-gray-900">{project.name}</div>
                  <div className="text-xs text-gray-500">Progress: {project.progress}%</div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowModal(null)}
              className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    if (type === 'debug-60min') {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">60 Minutes Debugging</h3>
            <p className="text-gray-600 mb-4">
              You&apos;ve been debugging for an hour. Consider documenting what you&apos;ve tried or asking for help.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(null)}
                className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
              >
                Continue
              </button>
              <button
                onClick={() => {
                  setShowModal(null);
                  handleStopTimer();
                }}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Stop
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (type === 'debug-90min') {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Debug Session Complete</h3>
            <p className="text-gray-600 mb-4">
              90-minute limit reached. Session automatically stopped.
            </p>
            <button
              onClick={() => setShowModal(null)}
              className="w-full px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
            >
              End Session
            </button>
          </div>
        </div>
      );
    }

    if (type === 'building-2hr') {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">2 Hours Building</h3>
            <p className="text-gray-600 mb-4">
              You&apos;ve been building for 2 hours. Consider taking a short break.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(null)}
                className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
              >
                Continue
              </button>
              <button
                onClick={() => {
                  setShowModal(null);
                  handleStopTimer();
                }}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Take Break
              </button>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-semibold text-gray-900">Project Autopilot</h1>
              <nav className="flex gap-6">
                <button className="text-sm font-medium text-gray-900">
                  Overview
                </button>
                <button className="text-sm font-medium text-gray-500 hover:text-gray-900">
                  Requests
                </button>
                <button className="text-sm font-medium text-gray-500 hover:text-gray-900">
                  Debug Logs
                </button>
                <button className="text-sm font-medium text-gray-500 hover:text-gray-900">
                  Analytics
                </button>
              </nav>
            </div>

            {activeProjectId && (
              <div className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
                timerType === 'building' ? 'bg-gray-100' : 'bg-red-50'
              }`}>
                <Clock className={`w-4 h-4 ${timerType === 'building' ? 'text-gray-600' : 'text-red-600'}`} />
                <span className={`text-sm font-medium ${timerType === 'building' ? 'text-gray-900' : 'text-red-900'}`}>
                  {timerType === 'building' ? 'Building' : 'Debugging'}: {projects.find(p => p.id === activeProjectId)?.name}
                </span>
                <span className={`font-mono text-sm ${timerType === 'building' ? 'text-gray-700' : 'text-red-700'}`}>
                  {formatTime(elapsedSeconds)}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <HomeView />
      </main>

      {showModal && <Modal type={showModal} />}
    </div>
  );
}
