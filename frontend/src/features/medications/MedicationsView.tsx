import React from 'react';
import { Medication } from '../../types/api';

interface Props {
  medications: Medication[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export default function MedicationsView({ medications, loading, error, onRefresh }: Props) {
  return (
    <div className="p-4 bg-[#F3EFE0] dark:bg-[#1E293B] rounded-3xl shadow max-w-md mx-auto">
      <h2 className="text-lg font-semibold mb-2">Medications</h2>
      {loading && <p>Loading…</p>}
      {error && <p className="text-red-500">{error}</p>}
      <button onClick={onRefresh} className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700">Refresh</button>
      <ul className="mt-3 list-disc list-inside">
        {medications.map(m => <li key={m.id}>{m.name} ({m.dosage})</li>)}
      </ul>
    </div>
  );
}
