import React from 'react';
import { RiskPrediction } from '../../types/api';

interface Props {
  history: RiskPrediction[] | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export default function RiskView({ history, loading, error, onRefresh }: Props) {
  return (
    <div className="p-4 bg-app-card rounded-3xl shadow max-w-md mx-auto">
      <h2 className="text-lg font-semibold mb-2">Risk History</h2>
      {loading && <p>Loading…</p>}
      {error && <p className="text-red-500">{error}</p>}
      <button onClick={onRefresh} className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700">Refresh</button>
      <ul className="mt-3 list-disc list-inside">
        {history?.map(r => (
          <li key={r.id}>{r.type}: {r.score}</li>
        ))}
      </ul>
    </div>
  );
}
