"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Play, Pause, AlertCircle, CheckCircle2, Plus, ChevronDown, TrendingUp, Trash2, Eye, Edit } from 'lucide-react';
import { Project } from '@/lib/types';
import { useTimerStore } from '@/lib/store/timer-store';

// Helper function to format platform names
const formatPlatform = (platform?: string) => {
  if (!platform) return 'N/A';
  const platformMap: Record<string, string> = {
    'n8n': 'n8n',
    'claude-code': 'Claude Code',
    'lovable': 'Lovable',
    'other': 'Other',
  };
  return platformMap[platform] || platform;
};

export default function DashboardPage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState<string | null>(null);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editedProject, setEditedProject] = useState<Partial<Project>>({});

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
        console.log('🔄 BROWSER: Fetching projects...');
        const response = await fetch('/api/projects');
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const data = await response.json();
        console.log('📦 BROWSER: Received projects:', data.projects);
        console.log('📊 BROWSER: Project details:', JSON.stringify(data.projects, null, 2));
        setProjectsList(data.projects);
        setError(null);
      } catch (err) {
        console.error('❌ BROWSER: Error fetching projects:', err);
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
    if (!currentTimeLogId || !activeProjectId || !timerType) {
      console.log('❌ Cannot stop timer - missing data:', { currentTimeLogId, activeProjectId, timerType });
      return;
    }

    // Keep decimal precision - don't round down to 0!
    const elapsedMinutes = elapsedSeconds / 60; // e.g., 15 seconds = 0.25 minutes
    const elapsedHours = (elapsedMinutes / 60).toFixed(2); // e.g., 0.25 min = 0.004 hours

    console.log('⏱️ Stopping timer:', {
      timeLogId: currentTimeLogId,
      projectId: activeProjectId,
      timerType,
      elapsedSeconds,
      elapsedMinutes,
      elapsedHours
    });

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

      const result = await response.json();
      console.log('🔍 Stop timer API response:', { status: response.status, result });

      if (!response.ok) {
        throw new Error(result.error || 'Failed to stop timer');
      }

      // Only reset timer after successful API call
      stopTimer();
      console.log('✅ Timer stopped and reset');

      // Refresh projects to get updated hours
      console.log('🔄 BROWSER: Refreshing projects after timer stop...');
      const projectsResponse = await fetch('/api/projects');
      if (projectsResponse.ok) {
        const data = await projectsResponse.json();
        console.log('✅ BROWSER: Refreshed projects:', data.projects);
        console.log('📊 BROWSER: Updated hours check:', data.projects.map((p: Project) => ({
          id: p.id,
          name: p.name,
          buildingHours: p.buildingHours,
          debuggingHours: p.debuggingHours
        })));
        setProjectsList(data.projects);
      } else {
        console.error('❌ BROWSER: Failed to refresh projects');
      }
    } catch (error) {
      console.error('❌ Error stopping timer:', error);
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

  const handleSaveProjectEdits = async () => {
    if (!selectedProjectId) return;

    try {
      const response = await fetch(`/api/projects/${selectedProjectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedProject),
      });

      if (!response.ok) throw new Error('Failed to update project');

      const { project } = await response.json();
      setProjectsList(prev => prev.map(p => p.id === selectedProjectId ? project : p));
      setIsEditingProject(false);
      setEditedProject({});
    } catch (err) {
      console.error('Error updating project:', err);
      alert('Failed to update project. Please try again.');
    }
  };

  // Calculate metrics (memoized to prevent infinite render loop)
  // FIX: Use projectsList instead of projects to ensure re-calculation on data changes
  const { activeProjects, buildingHours, debuggingHours } = useMemo(() => {
    const active = projectsList.filter(p => p.status !== 'complete' && p.status !== 'paused');
    const building = projectsList.reduce((sum, p) => sum + (p.buildingHours || 0), 0);
    const debugging = projectsList.reduce((sum, p) => sum + (p.debuggingHours || 0), 0);

    console.log('📊 BROWSER: Overview totals calculated:', {
      totalProjects: projectsList.length,
      buildingHours: building,
      debuggingHours: debugging,
      projectBreakdown: projectsList.map(p => ({
        name: p.name,
        buildingHours: p.buildingHours || 0,
        debuggingHours: p.debuggingHours || 0
      }))
    });

    return { activeProjects: active, buildingHours: building, debuggingHours: debugging };
  }, [projectsList]);
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
      const building = p.buildingHours || 0;
      const debugging = p.debuggingHours || 0;
      const total = building + debugging;
      return total > 0 && (debugging / total) > 0.6;
    })
    .map(p => {
      const building = p.buildingHours || 0;
      const debugging = p.debuggingHours || 0;
      const total = building + debugging;
      return {
        type: 'warning',
        title: 'Debugging time elevated',
        description: `${Math.round((debugging / total) * 100)}% of ${p.name} time spent debugging (${debugging.toFixed(1)}h) vs. building (${building.toFixed(1)}h)`,
        action: 'Review debug logs',
        projectId: p.id,
      };
    });

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
  }, [activeProjectId, elapsedSeconds, timerType, incrementSeconds, handleStopTimer, setShowModal]);

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
            {buildingHours.toFixed(2)}
          </div>
          {buildingHours === 0 && <div className="text-xs text-red-500">❌ Still 0 - check console logs</div>}
          <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> this week
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="text-sm text-gray-600 mb-1">Debugging Hours</div>
          <div className="text-3xl font-semibold text-gray-900">
            {debuggingHours.toFixed(2)}
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
                      <h3 className="font-semibold text-gray-900">
                        {project.name}
                      </h3>
                      <button
                        onClick={() => {
                          setSelectedProjectId(project.id);
                          setShowModal('project-details');
                        }}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title="View project details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {formatPlatform(project.platform)}
                      </span>
                      {project.stuckSince && (
                        <span className="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Stuck since {new Date(project.stuckSince).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">{project.nextAction || 'No next action set'}</div>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span className="font-medium text-gray-700">{(project.buildingHours || 0).toFixed(1)}h</span>
                        <span>building</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span className="font-medium text-gray-700">{(project.debuggingHours || 0).toFixed(1)}h</span>
                        <span>debugging</span>
                      </div>
                    </div>
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
                        <div className="font-semibold text-gray-900">{(project.buildingHours || 0).toFixed(1)}h</div>
                      </div>
                      <div>
                        <div className="text-gray-500 mb-1">Debugging Time</div>
                        <div className="font-semibold text-gray-900">{(project.debuggingHours || 0).toFixed(1)}h</div>
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

    if (type === 'project-details') {
      const project = projects.find(p => p.id === selectedProjectId);
      console.log('🔍 BROWSER: Opening project details modal');
      console.log('🔍 BROWSER: Selected project ID:', selectedProjectId);
      console.log('🔍 BROWSER: All projects:', projects);
      console.log('🔍 BROWSER: Found project:', project);
      if (!project) {
        console.error('❌ BROWSER: Project not found!');
        return null;
      }

      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{project.name}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {formatPlatform(project.platform)}
                  </span>
                  <span className={`text-sm px-2 py-1 rounded ${
                    project.priority === 'high' ? 'bg-red-100 text-red-700' :
                    project.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)} Priority
                  </span>
                  <span className={`text-sm px-2 py-1 rounded ${
                    project.status === 'complete' ? 'bg-green-100 text-green-700' :
                    project.status === 'paused' ? 'bg-gray-100 text-gray-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                {!isEditingProject && (
                  <button
                    onClick={() => {
                      setIsEditingProject(true);
                      setEditedProject({
                        description: project.description,
                        whoWillUseIt: project.whoWillUseIt,
                        features: project.features,
                        complexity: project.complexity,
                        priority: project.priority,
                        targetCompletion: project.targetCompletion,
                      });
                    }}
                    className="text-gray-600 hover:text-gray-900 p-2"
                    title="Edit project details"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowModal(null);
                    setSelectedProjectId(null);
                    setIsEditingProject(false);
                    setEditedProject({});
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Description */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">What will this do?</h3>
                {isEditingProject ? (
                  <input
                    type="text"
                    value={editedProject.description || ''}
                    onChange={(e) => setEditedProject({ ...editedProject, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{project.description || 'No description provided'}</p>
                )}
              </div>

              {/* Who will use it */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Who will use it?</h3>
                {isEditingProject ? (
                  <input
                    type="text"
                    value={editedProject.whoWillUseIt || ''}
                    onChange={(e) => setEditedProject({ ...editedProject, whoWillUseIt: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{project.whoWillUseIt || 'Not specified'}</p>
                )}
              </div>

              {/* Features */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Features</h3>
                {isEditingProject ? (
                  <textarea
                    value={editedProject.features || ''}
                    onChange={(e) => setEditedProject({ ...editedProject, features: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 whitespace-pre-wrap">{project.features || 'No features listed'}</p>
                )}
              </div>

              {/* Complexity */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Complexity</h3>
                {isEditingProject ? (
                  <select
                    value={editedProject.complexity || project.complexity}
                    onChange={(e) => setEditedProject({ ...editedProject, complexity: e.target.value as 'simple' | 'medium' | 'complex' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  >
                    <option value="simple">Simple</option>
                    <option value="medium">Medium</option>
                    <option value="complex">Complex</option>
                  </select>
                ) : (
                  <p className="text-gray-900 capitalize">{project.complexity || 'Not specified'}</p>
                )}
              </div>

              {/* Time tracking */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Building Hours</h3>
                  <p className="text-2xl font-semibold text-gray-900">{(project.buildingHours || 0).toFixed(1)}h</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Debugging Hours</h3>
                  <p className="text-2xl font-semibold text-gray-900">{(project.debuggingHours || 0).toFixed(1)}h</p>
                </div>
              </div>

              {/* Progress */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Progress: {project.progress}%</h3>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gray-900 transition-all duration-500"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {/* Target Completion */}
              {project.targetCompletion && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Target Completion</h3>
                  <p className="text-gray-900">{new Date(project.targetCompletion).toLocaleDateString()}</p>
                </div>
              )}

              {/* Created/Updated */}
              <div className="pt-4 border-t border-gray-200 text-xs text-gray-500">
                <p>Created: {new Date(project.createdAt).toLocaleString()}</p>
                <p>Last Updated: {new Date(project.updatedAt).toLocaleString()}</p>
                {project.completedAt && (
                  <p>Completed: {new Date(project.completedAt).toLocaleString()}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              {isEditingProject ? (
                <>
                  <button
                    onClick={() => {
                      setIsEditingProject(false);
                      setEditedProject({});
                    }}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProjectEdits}
                    className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setShowModal(null);
                    setSelectedProjectId(null);
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Close
                </button>
              )}
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
