'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface ProjectFormData {
  // Step 1
  problemStatement: string;
  targetUser: string;
  source: 'internal' | 'colleague' | 'leadership';

  // Step 2
  name: string;
  coreFeature1: string;
  coreFeature2: string;
  coreFeature3: string;
  outOfScope: string;
  estimatedHours: number;
  platform: 'n8n' | 'claude-code' | 'lovable' | 'other';

  // Step 3
  potentialRisks: string;
  mitigationStrategy: string;
  priority: 'low' | 'medium' | 'high';
  targetCompletion?: string;
}

export default function NewProjectPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, trigger } = useForm<ProjectFormData>({
    mode: 'onChange',
    defaultValues: {
      priority: 'medium',
      source: 'internal',
      platform: 'n8n',
    }
  });

  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/projects/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          problemStatement: data.problemStatement,
          targetUser: data.targetUser,
          mvpScope: [data.coreFeature1, data.coreFeature2, data.coreFeature3].filter(Boolean),
          outOfScope: data.outOfScope,
          platform: data.platform,
          estimatedHours: data.estimatedHours,
          potentialRisks: data.potentialRisks,
          mitigationStrategy: data.mitigationStrategy,
          priority: data.priority,
          status: 'planning',
          nextAction: 'Start development',
        }),
      });

      if (response.ok) {
        router.push('/dashboard');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof ProjectFormData)[] = [];

    if (currentStep === 1) {
      fieldsToValidate = ['problemStatement', 'targetUser', 'source'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['name', 'coreFeature1', 'outOfScope', 'estimatedHours', 'platform'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Create New Project</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 1 ? 'bg-gray-900 text-white' : 'bg-gray-200'
              }`}>
                {currentStep > 1 ? <CheckCircle2 className="w-5 h-5" /> : '1'}
              </div>
              <span className="text-sm font-medium">Define</span>
            </div>

            <div className={`flex-1 h-0.5 mx-4 ${currentStep >= 2 ? 'bg-gray-900' : 'bg-gray-200'}`} />

            <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 2 ? 'bg-gray-900 text-white' : 'bg-gray-200'
              }`}>
                {currentStep > 2 ? <CheckCircle2 className="w-5 h-5" /> : '2'}
              </div>
              <span className="text-sm font-medium">Scope</span>
            </div>

            <div className={`flex-1 h-0.5 mx-4 ${currentStep >= 3 ? 'bg-gray-900' : 'bg-gray-200'}`} />

            <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-gray-900' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= 3 ? 'bg-gray-900 text-white' : 'bg-gray-200'
              }`}>
                3
              </div>
              <span className="text-sm font-medium">Plan</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg border border-gray-200 p-6">
          {/* STEP 1: Define Problem */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  What problem are you solving? *
                </label>
                <textarea
                  {...register('problemStatement', { required: 'Problem statement is required' })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="Describe the problem this project will solve..."
                />
                {errors.problemStatement && (
                  <p className="text-sm text-red-600 mt-1">{errors.problemStatement.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Who is this for? *
                </label>
                <input
                  {...register('targetUser', { required: 'Target user is required' })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="e.g., 'Heather - contracts team' or 'Internal - all builders'"
                />
                {errors.targetUser && (
                  <p className="text-sm text-red-600 mt-1">{errors.targetUser.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Project Source *
                </label>
                <select
                  {...register('source', { required: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="internal">Internal Initiative</option>
                  <option value="colleague">Colleague Request</option>
                  <option value="leadership">Leadership Priority</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 2: Define Scope */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Project Name *
                </label>
                <input
                  {...register('name', { required: 'Project name is required' })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="Give your project a clear name"
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Core Features (Minimum 1 required) *
                </label>
                <input
                  {...register('coreFeature1', { required: 'At least one core feature is required' })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="Feature 1"
                />
                {errors.coreFeature1 && (
                  <p className="text-sm text-red-600 mb-2">{errors.coreFeature1.message}</p>
                )}
                <input
                  {...register('coreFeature2')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="Feature 2 (optional)"
                />
                <input
                  {...register('coreFeature3')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="Feature 3 (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  What are you NOT building in v1? *
                </label>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <textarea
                    {...register('outOfScope', { required: 'Out of scope items are required' })}
                    rows={3}
                    className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent bg-white"
                    placeholder="Be explicit about what you're cutting to stay focused..."
                  />
                  {errors.outOfScope && (
                    <p className="text-sm text-red-600 mt-1">{errors.outOfScope.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Estimated Hours *
                  </label>
                  <input
                    {...register('estimatedHours', { required: true, min: 0 })}
                    type="number"
                    step="0.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Platform *
                  </label>
                  <select
                    {...register('platform', { required: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  >
                    <option value="n8n">n8n</option>
                    <option value="claude-code">Claude Code</option>
                    <option value="lovable">Lovable</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Plan Execution */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Potential Risks
                </label>
                <p className="text-sm text-gray-600 mb-2">Pre-mortem: Imagine this fails. Why?</p>
                <textarea
                  {...register('potentialRisks')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="What could go wrong with this project?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Mitigation Strategy
                </label>
                <textarea
                  {...register('mitigationStrategy')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="How will you handle these risks if they occur?"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Priority
                  </label>
                  <select
                    {...register('priority')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Target Completion
                  </label>
                  <input
                    {...register('targetCompletion')}
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-8">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Project'}
              </button>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
