'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, CheckCircle2 } from 'lucide-react';
import { ProjectPRD } from '@/lib/types';

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

interface PRDBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (prd: ProjectPRD) => void;
  initialData?: {
    name: string;
    description?: string;
    whoWillUseIt?: string;
    platform?: string;
  };
  existingPRD?: ProjectPRD;
}

export function PRDBuilderModal({ isOpen, onClose, onSave, initialData, existingPRD }: PRDBuilderModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [extractedPRD, setExtractedPRD] = useState<ProjectPRD | null>(existingPRD || null);
  const [completenessScore, setCompletenessScore] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Start the interview
      const greeting = existingPRD
        ? `I see you already have a PRD for "${initialData?.name}". Would you like to review and update it, or start fresh?`
        : `Let's build a Product Requirements Document for "${initialData?.name}" together!\n\nI'll ask you some questions to understand your project better. You can answer in your own words, and I'll help organize everything.\n\nLet's start: **Why are you building this project?** What problem does it solve or what value does it provide?`;

      setMessages([{ role: 'assistant', content: greeting }]);
    }
  }, [isOpen, messages.length, initialData?.name, existingPRD]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    calculateCompleteness();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extractedPRD]);

  const calculateCompleteness = () => {
    if (!extractedPRD) {
      setCompletenessScore(0);
      return;
    }

    let score = 0;
    const weights = {
      whyBuilding: 20,
      apisRequired: 15,
      dataStorage: 10,
      authenticationNeeds: 10,
      learningNeeds: 10,
      resources: 10,
      knownRisks: 10,
      anticipatedBlockers: 10,
      confidenceLevel: 5,
    };

    if (extractedPRD.whyBuilding) score += weights.whyBuilding;
    if (extractedPRD.apisRequired && extractedPRD.apisRequired.length > 0) score += weights.apisRequired;
    if (extractedPRD.dataStorage) score += weights.dataStorage;
    if (extractedPRD.authenticationNeeds) score += weights.authenticationNeeds;
    if (extractedPRD.learningNeeds && extractedPRD.learningNeeds.length > 0) score += weights.learningNeeds;
    if (extractedPRD.resources && extractedPRD.resources.length > 0) score += weights.resources;
    if (extractedPRD.knownRisks && extractedPRD.knownRisks.length > 0) score += weights.knownRisks;
    if (extractedPRD.anticipatedBlockers && extractedPRD.anticipatedBlockers.length > 0) score += weights.anticipatedBlockers;
    if (extractedPRD.confidenceLevel) score += weights.confidenceLevel;

    setCompletenessScore(score);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    const newUserMessage: Message = { role: 'user', content: userInput };
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/prd/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, newUserMessage],
          projectContext: {
            name: initialData?.name,
            description: initialData?.description,
            whoWillUseIt: initialData?.whoWillUseIt,
            platform: initialData?.platform,
          },
          currentPRD: extractedPRD,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);

        if (data.prd) {
          setExtractedPRD(data.prd);
        }

        if (data.isComplete) {
          setIsComplete(true);
        }
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again or type "done" to finish with what we have.'
        }]);
      }
    } catch (error) {
      console.error('Interview error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again or type "done" to finish with what we have.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    if (extractedPRD) {
      onSave({
        ...extractedPRD,
        completenessScore,
        updatedAt: new Date().toISOString(),
        createdAt: extractedPRD.createdAt || new Date().toISOString(),
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                {existingPRD ? 'Edit PRD' : 'Create PRD'} - AI Interview
              </h3>
              <p className="text-sm text-gray-600 mt-1">{initialData?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-gray-500">Completeness</div>
              <div className={`text-2xl font-bold ${
                completenessScore >= 80 ? 'text-green-600' :
                completenessScore >= 50 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {completenessScore}%
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-gray-900 text-white'
                    : 'bg-purple-50 text-purple-900 border border-purple-200'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-3 h-3 text-purple-600" />
                    <span className="text-xs font-medium text-purple-700">Claude</span>
                  </div>
                )}
                <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-gray-200 flex-shrink-0">
          {isComplete && extractedPRD ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800 mb-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">PRD Interview Complete!</span>
                </div>
                <p className="text-sm text-green-700">
                  Your PRD is {completenessScore}% complete. You can review it in the project details after saving.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsComplete(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Continue Editing
                </button>
                <button
                  onClick={handleFinish}
                  className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                >
                  Save PRD
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your answer... (or type 'done' to finish)"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent disabled:opacity-50"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !userInput.trim()}
                  className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>
              {completenessScore >= 50 && (
                <button
                  onClick={handleFinish}
                  className="w-full px-4 py-2 text-sm text-purple-700 hover:text-purple-900 font-medium"
                >
                  I&apos;m done - save PRD now →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
