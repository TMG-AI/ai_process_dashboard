'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface StopLearningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    sources: string[];
    otherSource?: string;
    topic?: string;
    description?: string;
  }) => void;
}

export function StopLearningModal({ isOpen, onClose, onSave }: StopLearningModalProps) {
  const [sources, setSources] = useState<string[]>([]);
  const [otherSource, setOtherSource] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSourceToggle = (source: string) => {
    setSources(prev =>
      prev.includes(source)
        ? prev.filter(s => s !== source)
        : [...prev, source]
    );
  };

  const handleSave = () => {
    onSave({
      sources,
      otherSource: sources.includes('other') ? otherSource : undefined,
      topic: topic || undefined,
      description: description || undefined,
    });
    // Reset form
    setSources([]);
    setOtherSource('');
    setTopic('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Log Learning Session</h3>
            <p className="text-sm text-gray-600 mt-1">Record what you learned</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Learning Sources (select all that apply)
            </label>
            <div className="space-y-2">
              {[
                { value: 'nate-jones', label: 'Nate Jones' },
                { value: 'other-substacks', label: 'Other Substacks' },
                { value: 'tiktok-ai', label: 'TikTok AI' },
                { value: 'claude-code', label: 'Claude Code' },
                { value: 'other', label: 'Other' },
              ].map((source) => (
                <label key={source.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sources.includes(source.value)}
                    onChange={() => handleSourceToggle(source.value)}
                    className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                  />
                  <span className="text-sm text-gray-700">{source.label}</span>
                </label>
              ))}
            </div>
          </div>

          {sources.includes('other') && (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Other Source
              </label>
              <input
                type="text"
                value={otherSource}
                onChange={(e) => setOtherSource(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="Specify other source..."
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Topic (optional)
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="What was the topic?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              What did you learn? (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Describe what you learned..."
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
          >
            Save Learning Log
          </button>
        </div>
      </div>
    </div>
  );
}

interface ManualLearningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    sources: string[];
    otherSource?: string;
    topic?: string;
    description?: string;
    durationMinutes: number;
    date?: string;
  }) => void;
}

export function ManualLearningModal({ isOpen, onClose, onSave }: ManualLearningModalProps) {
  const [sources, setSources] = useState<string[]>([]);
  const [otherSource, setOtherSource] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('30');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const handleSourceToggle = (source: string) => {
    setSources(prev =>
      prev.includes(source)
        ? prev.filter(s => s !== source)
        : [...prev, source]
    );
  };

  const handleSave = () => {
    const totalMinutes = (parseInt(hours) || 0) * 60 + (parseInt(minutes) || 0);

    if (totalMinutes === 0) {
      alert('Please enter a duration greater than 0');
      return;
    }

    onSave({
      sources,
      otherSource: sources.includes('other') ? otherSource : undefined,
      topic: topic || undefined,
      description: description || undefined,
      durationMinutes: totalMinutes,
      date: date || undefined,
    });

    // Reset form
    setSources([]);
    setOtherSource('');
    setTopic('');
    setDescription('');
    setHours('0');
    setMinutes('30');
    setDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Add Learning Time Manually</h3>
            <p className="text-sm text-gray-600 mt-1">Log time you forgot to track</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Duration
            </label>
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="number"
                  min="0"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="Hours"
                />
                <span className="text-xs text-gray-500 mt-1">Hours</span>
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="Minutes"
                />
                <span className="text-xs text-gray-500 mt-1">Minutes</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Learning Sources (select all that apply)
            </label>
            <div className="space-y-2">
              {[
                { value: 'nate-jones', label: 'Nate Jones' },
                { value: 'other-substacks', label: 'Other Substacks' },
                { value: 'tiktok-ai', label: 'TikTok AI' },
                { value: 'claude-code', label: 'Claude Code' },
                { value: 'other', label: 'Other' },
              ].map((source) => (
                <label key={source.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sources.includes(source.value)}
                    onChange={() => handleSourceToggle(source.value)}
                    className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                  />
                  <span className="text-sm text-gray-700">{source.label}</span>
                </label>
              ))}
            </div>
          </div>

          {sources.includes('other') && (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Other Source
              </label>
              <input
                type="text"
                value={otherSource}
                onChange={(e) => setOtherSource(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="Specify other source..."
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Topic (optional)
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="What was the topic?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              What did you learn? (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Describe what you learned..."
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
          >
            Save Learning Log
          </button>
        </div>
      </div>
    </div>
  );
}
