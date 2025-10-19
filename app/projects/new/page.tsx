'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

interface ProjectFormData {
  name: string;
  description: string;
  whoWillUseIt: string;
  platform: 'n8n' | 'claude-code' | 'lovable' | 'other';
  features: string;
  complexity: 'simple' | 'medium' | 'complex';
  priority: 'low' | 'medium' | 'high';
  targetCompletion?: string;
}

export default function NewProjectPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ProjectFormData>({
    defaultValues: {
      priority: 'medium',
      platform: 'n8n',
      complexity: 'medium',
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
          description: data.description,
          whoWillUseIt: data.whoWillUseIt,
          platform: data.platform,
          features: data.features,
          complexity: data.complexity,
          priority: data.priority,
          targetCompletion: data.targetCompletion,
          status: 'planning',
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Create New Project</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="space-y-6">
            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Project Name *
              </label>
              <input
                {...register('name', { required: 'Project name is required' })}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="e.g., CRM Data Sync"
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* What will this do? */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                What will this do? *
              </label>
              <input
                {...register('description', { required: 'Description is required' })}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="e.g., Auto-sync CRM contacts to spreadsheet daily"
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* Who will use it? */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Who will use it? *
              </label>
              <input
                {...register('whoWillUseIt', { required: 'User is required' })}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="e.g., Just me, Sales team, Sarah from contracts"
              />
              {errors.whoWillUseIt && (
                <p className="text-sm text-red-600 mt-1">{errors.whoWillUseIt.message}</p>
              )}
            </div>

            {/* Platform */}
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

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Features *
              </label>
              <textarea
                {...register('features', { required: 'Features are required' })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="Describe the key features..."
              />
              {errors.features && (
                <p className="text-sm text-red-600 mt-1">{errors.features.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Complexity */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Complexity *
                </label>
                <select
                  {...register('complexity', { required: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="simple">Simple</option>
                  <option value="medium">Medium</option>
                  <option value="complex">Complex</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Priority *
                </label>
                <select
                  {...register('priority', { required: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            {/* Target Completion */}
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

          {/* Submit Button */}
          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
