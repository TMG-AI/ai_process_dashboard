'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface DebugSixtyMinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (data: { attempts: string; hypothesis: string }) => void;
  onSwitchTasks: () => void;
}

export function DebugSixtyMinModal({
  isOpen,
  onClose,
  onContinue,
  onSwitchTasks
}: DebugSixtyMinModalProps) {
  const [attempts, setAttempts] = useState('');
  const [hypothesis, setHypothesis] = useState('');
  const [showHelper, setShowHelper] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleContinue = () => {
    onContinue({ attempts, hypothesis });
    setAttempts('');
    setHypothesis('');
  };

  const claudePrompt = `Please analyze our debugging session over the last 60 minutes. Create a summary with:

1. **What we tried** - List each debugging approach as a separate bullet point (e.g., "Checked console logs", "Added breakpoints", "Tested API endpoint")

2. **Current hypothesis** - One clear sentence about what you think is causing the issue

Format your response like this:

**Attempts:**
- [First thing we tried]
- [Second thing we tried]
- [Third thing we tried]

**Hypothesis:**
[Your one-sentence hypothesis about the root cause]`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(claudePrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Debug Session: 60 Minutes</h3>
          <p className="text-sm text-gray-600 mt-1">Time to document your progress</p>
        </div>

        <div className="p-6 space-y-4">
          {/* Claude Code Helper */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <button
              onClick={() => setShowHelper(!showHelper)}
              className="w-full flex items-center justify-between text-left"
            >
              <span className="text-sm font-medium text-purple-900">
                💡 Debugging in Claude Code? Get auto-summary
              </span>
              <span className="text-purple-600 text-xs">
                {showHelper ? '▼' : '▶'}
              </span>
            </button>

            {showHelper && (
              <div className="mt-3 space-y-3">
                <p className="text-xs text-purple-800">
                  <strong>How it works:</strong> Copy this prompt, paste it into Claude Code, and Claude will generate a summary of what you&apos;ve been debugging.
                </p>

                <div className="bg-white border border-purple-300 rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700">Prompt for Claude Code:</span>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono bg-gray-50 p-2 rounded border border-gray-200 max-h-32 overflow-y-auto">
                    {claudePrompt}
                  </pre>
                </div>

                <ol className="text-xs text-purple-800 space-y-1 pl-4">
                  <li>1. Click &quot;Copy&quot; above</li>
                  <li>2. Paste into Claude Code</li>
                  <li>3. Claude will generate a summary</li>
                  <li>4. Copy Claude&apos;s response and paste below</li>
                </ol>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              What have you tried?
            </label>
            <textarea
              value={attempts}
              onChange={(e) => setAttempts(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="List the debugging approaches you've attempted..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Current hypothesis
            </label>
            <input
              type="text"
              value={hypothesis}
              onChange={(e) => setHypothesis(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="What do you think is causing the issue?"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-900">
              <strong>Tip:</strong> If you&apos;re stuck, consider asking a colleague or taking a break.
              Fresh eyes often spot issues faster.
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={handleContinue}
            disabled={!attempts.trim()}
            className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Log & Continue (30 min)
          </button>
          <button
            onClick={onSwitchTasks}
            className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            Switch Tasks
          </button>
        </div>
      </div>
    </div>
  );
}

interface DebugNinetyMinModalProps {
  isOpen: boolean;
  onEnd: () => void;
  onTakeBreak: () => void;
  onContinueAnyway: () => void;
}

export function DebugNinetyMinModal({
  isOpen,
  onEnd,
  onTakeBreak,
  onContinueAnyway
}: DebugNinetyMinModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Debug Session: 90 Minutes</h3>
          <p className="text-sm text-gray-600 mt-1">Recommended limit reached</p>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-4">
            You&apos;ve been debugging for 90 minutes. Research shows taking a break or getting fresh perspective often leads to faster resolution.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-900">
              <strong>⚠️ Extended Debugging Alert:</strong> If you continue, the timer will show a warning indicator. Consider taking a break and coming back with fresh eyes.
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 space-y-2">
          <button
            onClick={onTakeBreak}
            className="w-full px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
          >
            Take a Break
          </button>
          <button
            onClick={onContinueAnyway}
            className="w-full px-4 py-2.5 border border-amber-500 text-amber-700 rounded-lg hover:bg-amber-50 font-medium"
          >
            Continue Anyway (Timer Will Show Warning)
          </button>
          <button
            onClick={onEnd}
            className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            End Session
          </button>
        </div>
      </div>
    </div>
  );
}

interface BuildingTwoHourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  onTakeBreak: () => void;
}

export function BuildingTwoHourModal({
  isOpen,
  onClose,
  onContinue,
  onTakeBreak
}: BuildingTwoHourModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Building Session: 2 Hours</h3>
          <p className="text-sm text-gray-600 mt-1">Consider taking a break</p>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-4">
            You&apos;ve been building for 2 hours. Taking a short break can help maintain focus and code quality.
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="text-sm font-medium text-gray-900 mb-1">Quick checkpoint:</div>
            <div className="text-sm text-gray-600">What have you accomplished in this session?</div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onContinue}
            className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
          >
            Continue Building
          </button>
          <button
            onClick={onTakeBreak}
            className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            Take Break
          </button>
        </div>
      </div>
    </div>
  );
}

interface ProjectLimiterModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Array<{
    id: string;
    name: string;
    status: string;
    buildingHours: number;
    debuggingHours: number;
  }>;
  onPauseProject: (projectId: string) => void;
}

export function ProjectLimiterModal({
  isOpen,
  onClose,
  projects,
  onPauseProject
}: ProjectLimiterModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Active Project Limit Reached</h3>
          <p className="text-sm text-gray-600 mt-1">
            You have 3 active projects. To maintain focus, pause one before starting new work.
          </p>
        </div>

        <div className="p-6">
          <div className="space-y-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{project.name}</h4>
                  <div className="text-sm text-gray-600 mt-1 capitalize">
                    {project.status} • {(project.buildingHours + project.debuggingHours).toFixed(1)}h logged
                  </div>
                </div>
                <button
                  onClick={() => onPauseProject(project.id)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
                >
                  Pause
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
