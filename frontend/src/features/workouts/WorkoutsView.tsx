import React from 'react';
import { WorkoutPlan } from '../../types/api';

interface Props {
  plan: WorkoutPlan | null;
  loading: boolean;
  error: string | null;
  onGenerate: () => void;
}

export default function WorkoutsView({ plan, loading, error, onGenerate }: Props) {
  return (
    <div className="p-4 bg-[#F3EFE0] dark:bg-[#1E293B] rounded-3xl shadow max-w-md mx-auto">
      <h2 className="text-lg font-semibold mb-2">Workout Plan</h2>
      <button onClick={onGenerate} disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-50">{loading ? 'Generating…' : 'Generate'}</button>
      {error && <p className="text-red-500">{error}</p>}
      {plan && (
        <div className="mt-3">
          {plan.exercises.map((ex, idx) => (
            <div key={idx} className="mb-2">
              <p>{ex.name} {ex.sets ? `- ${ex.sets} sets` : ''}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
