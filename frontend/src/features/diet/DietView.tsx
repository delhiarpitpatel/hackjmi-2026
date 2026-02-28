import React from 'react';
import { MealPlan } from '../../types/api';

interface Props {
  plan: MealPlan | null;
  date: string;
  setDate: (d: string) => void;
  loading: boolean;
  error: string | null;
  onFetch: () => void;
}

export default function DietView({ plan, date, setDate, loading, error, onFetch }: Props) {
  return (
    <div className="p-4 bg-[#F3EFE0] dark:bg-[#1E293B] rounded-3xl shadow max-w-md mx-auto">
      <h2 className="text-lg font-semibold mb-2">Diet Plan</h2>
      <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border p-2 rounded mb-2" />
      <button onClick={onFetch} disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-50">{loading ? 'Loading…' : 'Get Plan'}</button>
      {error && <p className="text-red-500">{error}</p>}
      {plan && (
        <div className="mt-3">
          {plan.meals.map((m, idx) => (
            <div key={idx} className="mb-2">
              <h3 className="font-medium capitalize">{m.mealType}</h3>
              <p>{m.items.join(', ')}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
