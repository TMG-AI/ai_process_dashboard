'use client';

import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Sparkles, Plus, Trash2 } from 'lucide-react';
import { ProjectPRD } from '@/lib/types';

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
  const [step, setStep] = useState(1);
  const [isAIAssisting, setIsAIAssisting] = useState(false);

  // Form state
  const [whyBuilding, setWhyBuilding] = useState(existingPRD?.whyBuilding || '');
  const [apisRequired, setApisRequired] = useState<string[]>(existingPRD?.apisRequired || []);
  const [newApi, setNewApi] = useState('');
  const [dataStorage, setDataStorage] = useState(existingPRD?.dataStorage || '');
  const [authenticationNeeds, setAuthenticationNeeds] = useState(existingPRD?.authenticationNeeds || '');

  const [learningNeeds, setLearningNeeds] = useState<string[]>(existingPRD?.learningNeeds || []);
  const [newLearning, setNewLearning] = useState('');
  const [researchEffort, setResearchEffort] = useState<'low' | 'medium' | 'high'>(existingPRD?.researchEffort || 'medium');
  const [resources, setResources] = useState<string[]>(existingPRD?.resources || []);
  const [newResource, setNewResource] = useState('');

  const [externalDependencies, setExternalDependencies] = useState<ProjectPRD['externalDependencies']>(
    existingPRD?.externalDependencies || []
  );
  const [anticipatedBlockers, setAnticipatedBlockers] = useState<string[]>(existingPRD?.anticipatedBlockers || []);
  const [newBlocker, setNewBlocker] = useState('');

  const [knownRisks, setKnownRisks] = useState<string[]>(existingPRD?.knownRisks || []);
  const [newRisk, setNewRisk] = useState('');
  const [confidenceLevel, setConfidenceLevel] = useState<'high' | 'medium' | 'low'>(existingPRD?.confidenceLevel || 'medium');

  if (!isOpen) return null;

  const handleAddItem = (value: string, setValue: (v: string) => void, array: string[], setArray: (arr: string[]) => void) => {
    if (value.trim()) {
      setArray([...array, value.trim()]);
      setValue('');
    }
  };

  const handleRemoveItem = (index: number, array: string[], setArray: (arr: string[]) => void) => {
    setArray(array.filter((_, i) => i !== index));
  };

  const handleAddDependency = () => {
    setExternalDependencies([
      ...(externalDependencies || []),
      { type: 'other', description: '' }
    ]);
  };

  const handleRemoveDependency = (index: number) => {
    setExternalDependencies(externalDependencies?.filter((_, i) => i !== index));
  };

  const handleUpdateDependency = (index: number, field: string, value: string) => {
    const updated = [...(externalDependencies || [])];
    updated[index] = { ...updated[index], [field]: value };
    setExternalDependencies(updated);
  };

  const handleAIAssist = async (section: string) => {
    setIsAIAssisting(true);
    try {
      const response = await fetch('/api/prd/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section,
          projectContext: {
            name: initialData?.name,
            description: initialData?.description,
            whoWillUseIt: initialData?.whoWillUseIt,
            platform: initialData?.platform,
            whyBuilding,
            apisRequired,
            dataStorage,
            learningNeeds,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Apply AI suggestions based on section
        if (section === 'technical' && data.suggestions) {
          if (data.suggestions.apis) {
            setApisRequired([...apisRequired, ...data.suggestions.apis]);
          }
          if (data.suggestions.dataStorage) {
            setDataStorage(data.suggestions.dataStorage);
          }
          if (data.suggestions.auth) {
            setAuthenticationNeeds(data.suggestions.auth);
          }
        } else if (section === 'learning' && data.suggestions) {
          if (data.suggestions.learningNeeds) {
            setLearningNeeds([...learningNeeds, ...data.suggestions.learningNeeds]);
          }
          if (data.suggestions.resources) {
            setResources([...resources, ...data.suggestions.resources]);
          }
        } else if (section === 'risks' && data.suggestions) {
          if (data.suggestions.risks) {
            setKnownRisks([...knownRisks, ...data.suggestions.risks]);
          }
          if (data.suggestions.blockers) {
            setAnticipatedBlockers([...anticipatedBlockers, ...data.suggestions.blockers]);
          }
        }
      }
    } catch (error) {
      console.error('AI assist error:', error);
      alert('AI assistance temporarily unavailable. Please continue filling out the form.');
    } finally {
      setIsAIAssisting(false);
    }
  };

  const handleSave = () => {
    const prd: ProjectPRD = {
      whyBuilding: whyBuilding || undefined,
      apisRequired: apisRequired.length > 0 ? apisRequired : undefined,
      dataStorage: dataStorage || undefined,
      authenticationNeeds: authenticationNeeds || undefined,
      learningNeeds: learningNeeds.length > 0 ? learningNeeds : undefined,
      researchEffort,
      resources: resources.length > 0 ? resources : undefined,
      externalDependencies: externalDependencies && externalDependencies.length > 0 ? externalDependencies : undefined,
      anticipatedBlockers: anticipatedBlockers.length > 0 ? anticipatedBlockers : undefined,
      knownRisks: knownRisks.length > 0 ? knownRisks : undefined,
      confidenceLevel,
      createdAt: existingPRD?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSave(prd);
  };

  const totalSteps = 4;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {existingPRD ? 'Edit PRD' : 'Create PRD'} - Step {step} of {totalSteps}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {step === 1 && 'Project Overview'}
              {step === 2 && 'Technical Approach'}
              {step === 3 && 'Learning & Prerequisites'}
              {step === 4 && 'Risks & Review'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Step 1: Overview */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <div className="text-blue-600 font-medium text-sm flex-shrink-0">Project Context:</div>
                  <div className="text-sm text-blue-800">
                    <div><strong>Name:</strong> {initialData?.name}</div>
                    {initialData?.description && <div><strong>Description:</strong> {initialData.description}</div>}
                    {initialData?.whoWillUseIt && <div><strong>Users:</strong> {initialData.whoWillUseIt}</div>}
                    {initialData?.platform && <div><strong>Platform:</strong> {initialData.platform}</div>}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Why are you building this? <span className="text-gray-500">(Business value / problem it solves)</span>
                </label>
                <textarea
                  value={whyBuilding}
                  onChange={(e) => setWhyBuilding(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="e.g., This will save 10 hours/week by automating customer onboarding..."
                />
              </div>
            </div>
          )}

          {/* Step 2: Technical Approach */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">Technical Details</h4>
                <button
                  onClick={() => handleAIAssist('technical')}
                  disabled={isAIAssisting}
                  className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 text-sm font-medium disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  {isAIAssisting ? 'AI Thinking...' : 'AI Assist'}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  APIs Required <span className="text-gray-500">(Press Enter to add)</span>
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newApi}
                      onChange={(e) => setNewApi(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddItem(newApi, setNewApi, apisRequired, setApisRequired);
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="e.g., Anthropic Claude API, Stripe, SendGrid..."
                    />
                    <button
                      onClick={() => handleAddItem(newApi, setNewApi, apisRequired, setApisRequired)}
                      className="px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {apisRequired.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {apisRequired.map((api, index) => (
                        <div key={index} className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm">
                          <span>{api}</span>
                          <button
                            onClick={() => handleRemoveItem(index, apisRequired, setApisRequired)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Data Storage <span className="text-gray-500">(What data? Where stored?)</span>
                </label>
                <textarea
                  value={dataStorage}
                  onChange={(e) => setDataStorage(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="e.g., User data in Redis, Files in Vercel Blob Storage..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Authentication Needs <span className="text-gray-500">(Does it need auth? What kind?)</span>
                </label>
                <input
                  type="text"
                  value={authenticationNeeds}
                  onChange={(e) => setAuthenticationNeeds(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="e.g., Single-user with NextAuth, OAuth with Google, None..."
                />
              </div>
            </div>
          )}

          {/* Step 3: Learning & Prerequisites */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">Learning & Dependencies</h4>
                <button
                  onClick={() => handleAIAssist('learning')}
                  disabled={isAIAssisting}
                  className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 text-sm font-medium disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  {isAIAssisting ? 'AI Thinking...' : 'AI Assist'}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  What do you need to learn first?
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newLearning}
                      onChange={(e) => setNewLearning(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddItem(newLearning, setNewLearning, learningNeeds, setLearningNeeds);
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="e.g., How to use Claude function calling, Stripe webhooks..."
                    />
                    <button
                      onClick={() => handleAddItem(newLearning, setNewLearning, learningNeeds, setLearningNeeds)}
                      className="px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {learningNeeds.length > 0 && (
                    <div className="space-y-1">
                      {learningNeeds.map((need, index) => (
                        <div key={index} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                          <span className="flex-1 text-sm">{need}</span>
                          <button
                            onClick={() => handleRemoveItem(index, learningNeeds, setLearningNeeds)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Research Effort
                </label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map((effort) => (
                    <button
                      key={effort}
                      onClick={() => setResearchEffort(effort)}
                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium ${
                        researchEffort === effort
                          ? 'bg-gray-900 text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {effort.charAt(0).toUpperCase() + effort.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Resources (Links to docs, tutorials)
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={newResource}
                      onChange={(e) => setNewResource(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddItem(newResource, setNewResource, resources, setResources);
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="https://docs.anthropic.com/..."
                    />
                    <button
                      onClick={() => handleAddItem(newResource, setNewResource, resources, setResources)}
                      className="px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {resources.length > 0 && (
                    <div className="space-y-1">
                      {resources.map((resource, index) => (
                        <div key={index} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                          <a
                            href={resource}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-sm text-blue-600 hover:underline truncate"
                          >
                            {resource}
                          </a>
                          <button
                            onClick={() => handleRemoveItem(index, resources, setResources)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-900">
                    External Dependencies
                  </label>
                  <button
                    onClick={handleAddDependency}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    + Add Dependency
                  </button>
                </div>
                {externalDependencies && externalDependencies.length > 0 ? (
                  <div className="space-y-3">
                    {externalDependencies.map((dep, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <select
                            value={dep.type}
                            onChange={(e) => handleUpdateDependency(index, 'type', e.target.value)}
                            className="text-sm border-gray-300 rounded px-2 py-1"
                          >
                            <option value="colleague-input">Colleague Input</option>
                            <option value="api-key">API Key</option>
                            <option value="service-access">Service Access</option>
                            <option value="data-source">Data Source</option>
                            <option value="other">Other</option>
                          </select>
                          <button
                            onClick={() => handleRemoveDependency(index)}
                            className="text-gray-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={dep.description}
                          onChange={(e) => handleUpdateDependency(index, 'description', e.target.value)}
                          placeholder="Describe what you need..."
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        />
                        {dep.type === 'colleague-input' && (
                          <input
                            type="text"
                            value={dep.who || ''}
                            onChange={(e) => handleUpdateDependency(index, 'who', e.target.value)}
                            placeholder="Who?"
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic">No external dependencies</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Anticipated Blockers
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newBlocker}
                      onChange={(e) => setNewBlocker(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddItem(newBlocker, setNewBlocker, anticipatedBlockers, setAnticipatedBlockers);
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="e.g., Waiting for API approval, Complex authentication..."
                    />
                    <button
                      onClick={() => handleAddItem(newBlocker, setNewBlocker, anticipatedBlockers, setAnticipatedBlockers)}
                      className="px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {anticipatedBlockers.length > 0 && (
                    <div className="space-y-1">
                      {anticipatedBlockers.map((blocker, index) => (
                        <div key={index} className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-lg">
                          <span className="flex-1 text-sm">{blocker}</span>
                          <button
                            onClick={() => handleRemoveItem(index, anticipatedBlockers, setAnticipatedBlockers)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Risks & Review */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">Risk Assessment</h4>
                <button
                  onClick={() => handleAIAssist('risks')}
                  disabled={isAIAssisting}
                  className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 text-sm font-medium disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  {isAIAssisting ? 'AI Thinking...' : 'AI Assist'}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Known Risks
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newRisk}
                      onChange={(e) => setNewRisk(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddItem(newRisk, setNewRisk, knownRisks, setKnownRisks);
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="e.g., API rate limits, Complex data migration..."
                    />
                    <button
                      onClick={() => handleAddItem(newRisk, setNewRisk, knownRisks, setKnownRisks)}
                      className="px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {knownRisks.length > 0 && (
                    <div className="space-y-1">
                      {knownRisks.map((risk, index) => (
                        <div key={index} className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg">
                          <span className="flex-1 text-sm">{risk}</span>
                          <button
                            onClick={() => handleRemoveItem(index, knownRisks, setKnownRisks)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Confidence Level <span className="text-gray-500">(How clear is the path?)</span>
                </label>
                <div className="flex gap-2">
                  {(['high', 'medium', 'low'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setConfidenceLevel(level)}
                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium ${
                        confidenceLevel === level
                          ? 'bg-gray-900 text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <h4 className="font-medium text-blue-900 mb-2">PRD Summary</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Why Building:</strong> {whyBuilding || <span className="text-gray-500">Not specified</span>}</div>
                  <div><strong>APIs:</strong> {apisRequired.length > 0 ? apisRequired.join(', ') : <span className="text-gray-500">None listed</span>}</div>
                  <div><strong>Learning Needs:</strong> {learningNeeds.length > 0 ? learningNeeds.length + ' items' : <span className="text-gray-500">None</span>}</div>
                  <div><strong>Dependencies:</strong> {externalDependencies && externalDependencies.length > 0 ? externalDependencies.length + ' items' : <span className="text-gray-500">None</span>}</div>
                  <div><strong>Risks:</strong> {knownRisks.length > 0 ? knownRisks.length + ' identified' : <span className="text-gray-500">None listed</span>}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-3 sticky bottom-0 bg-white">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
          )}
          {step < totalSteps ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
            >
              Save PRD
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
