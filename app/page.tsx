"use client";

import React, { useState, useEffect } from 'react';
import { Clock, Play, Pause, AlertCircle, CheckCircle2, Circle, ArrowRight, Plus, ChevronDown, X, TrendingUp } from 'lucide-react';

export default function Home() {
  const [currentView, setCurrentView] = useState('home');
  const [activeTimer, setActiveTimer] = useState<number | null>(null);
  const [timerType, setTimerType] = useState<'building' | 'debugging' | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [showModal, setShowModal] = useState<string | null>(null);
  const [wizardStep, setWizardStep] = useState(1);
  const [expandedProject, setExpandedProject] = useState<number | null>(null);

  const projects = [
    {
      id: 1,
      name: 'Digital Twins',
      platform: 'Agent',
      status: 'In Progress',
      progress: 65,
      hoursLogged: 6.5,
      buildingHours: 2.0,
      debuggingHours: 4.5,
      nextAction: 'Resolve API timeout in workflow',
      daysActive: 12,
      alert: 'Stuck for 4 days'
    },
    {
      id: 2,
      name: 'TMG Contract Creation',
      platform: 'GPT',
      status: 'In Progress',
      progress: 40,
      hoursLogged: 3.2,
      buildingHours: 3.0,
      debuggingHours: 0.2,
      nextAction: 'Add contract examples to system prompt',
      daysActive: 5
    },
    {
      id: 3,
      name: 'ChatMPT Media Planning',
      platform: 'Cursor',
      status: 'In Progress',
      progress: 15,
      hoursLogged: 1.5,
      buildingHours: 1.5,
      debuggingHours: 0,
      nextAction: 'Design dashboard layout',
      daysActive: 3
    }
  ];

  const insights = [
    {
      type: 'warning',
      title: 'Debugging time elevated',
      description: '70% of Digital Twins time spent debugging (4.5h) vs. building (2.0h)',
      action: 'Review debug logs'
    }
  ];

  useEffect(() => {
    if (!activeTimer) return;

    const interval = setInterval(() => {
      setTimerSeconds(prev => {
        const newSeconds = prev + 1;

        if (timerType === 'debugging') {
          if (newSeconds === 10) setShowModal('debug-60min');
          if (newSeconds === 15) {
            setShowModal('debug-90min');
            setActiveTimer(null);
            setTimerType(null);
          }
        } else if (timerType === 'building') {
          if (newSeconds === 20) setShowModal('building-2hr');
        }

        return newSeconds;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer, timerType]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const HomeView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="text-sm text-gray-600 mb-1">Active Projects</div>
          <div className="text-3xl font-semibold text-gray-900">{projects.length}</div>
          <div className="text-xs text-gray-500 mt-1">of 3 max</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="text-sm text-gray-600 mb-1">Building Hours</div>
          <div className="text-3xl font-semibold text-gray-900">
            {projects.reduce((acc, p) => acc + p.buildingHours, 0).toFixed(1)}
          </div>
          <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> this week
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="text-sm text-gray-600 mb-1">Debugging Hours</div>
          <div className="text-3xl font-semibold text-gray-900">
            {projects.reduce((acc, p) => acc + p.debuggingHours, 0).toFixed(1)}
          </div>
          <div className="text-xs text-amber-600 mt-1">this week</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="text-sm text-gray-600 mb-1">Completed</div>
          <div className="text-3xl font-semibold text-gray-900">1</div>
          <div className="text-xs text-gray-500 mt-1">this month</div>
        </div>
      </div>

      {insights.map((insight, idx) => (
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
              if (projects.length >= 3) {
                setShowModal('limit');
              } else {
                setCurrentView('wizard');
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>

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
                        {project.platform}
                      </span>
                      {project.alert && (
                        <span className="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {project.alert}
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
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500 mb-1">Building Time</div>
                        <div className="font-semibold text-gray-900">{project.buildingHours.toFixed(1)}h</div>
                      </div>
                      <div>
                        <div className="text-gray-500 mb-1">Debugging Time</div>
                        <div className="font-semibold text-gray-900">{project.debuggingHours.toFixed(1)}h</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  {activeTimer === project.id ? (
                    <button
                      onClick={() => {
                        setActiveTimer(null);
                        setTimerType(null);
                        setTimerSeconds(0);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 font-medium text-sm"
                    >
                      <Pause className="w-4 h-4" />
                      Stop Timer
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setActiveTimer(project.id);
                          setTimerType('building');
                          setTimerSeconds(0);
                        }}
                        disabled={activeTimer !== null}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-100 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Play className="w-4 h-4" />
                        Start Building
                      </button>
                      <button
                        onClick={() => {
                          setActiveTimer(project.id);
                          setTimerType('debugging');
                          setTimerSeconds(0);
                        }}
                        disabled={activeTimer !== null}
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
      </div>
    </div>
  );

  const Modal = ({ type }: { type: string }) => {
    if (type === 'limit') {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Limit Reached</h3>
            <p className="text-gray-600 mb-4">
              You&apos;re already managing 3 active projects. Complete or pause one before starting another.
            </p>
            <button
              onClick={() => setShowModal(null)}
              className="w-full px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
            >
              Got It
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
                  setActiveTimer(null);
                  setTimerType(null);
                  setTimerSeconds(0);
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
              onClick={() => {
                setShowModal(null);
                setTimerSeconds(0);
              }}
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
                  setActiveTimer(null);
                  setTimerType(null);
                  setTimerSeconds(0);
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
                <button
                  onClick={() => setCurrentView('home')}
                  className={`text-sm font-medium ${
                    currentView === 'home' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
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

            {activeTimer && (
              <div className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
                timerType === 'building' ? 'bg-gray-100' : 'bg-red-50'
              }`}>
                <Clock className={`w-4 h-4 ${timerType === 'building' ? 'text-gray-600' : 'text-red-600'}`} />
                <span className={`text-sm font-medium ${timerType === 'building' ? 'text-gray-900' : 'text-red-900'}`}>
                  {timerType === 'building' ? 'Building' : 'Debugging'}: {projects.find(p => p.id === activeTimer)?.name}
                </span>
                <span className={`font-mono text-sm ${timerType === 'building' ? 'text-gray-700' : 'text-red-700'}`}>
                  {formatTime(timerSeconds)}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {currentView === 'home' && <HomeView />}
      </main>

      <div className="fixed bottom-6 right-6 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-xs">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Demo Controls</div>
        <div className="space-y-2">
          <button
            onClick={() => {
              setTimerType('debugging');
              setTimerSeconds(9);
            }}
            className="w-full text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-700"
          >
            Debug 60min nudge
          </button>
          <button
            onClick={() => {
              setTimerType('debugging');
              setTimerSeconds(14);
            }}
            className="w-full text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-700"
          >
            Debug 90min stop
          </button>
          <button
            onClick={() => {
              setTimerType('building');
              setTimerSeconds(19);
            }}
            className="w-full text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-700"
          >
            Building 2hr nudge
          </button>
          <button
            onClick={() => setShowModal('limit')}
            className="w-full text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-700"
          >
            Show project limiter
          </button>
        </div>
      </div>

      {showModal && <Modal type={showModal} />}
    </div>
  );
}
