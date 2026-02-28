import React from 'react';
import { VitalReading } from '../../types/api';

interface Props {
  vitals: VitalReading | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export default function VitalsView({ vitals, loading, error, onRefresh }: Props) {
  return (
    <div className="p-4 bg-app-card rounded-3xl shadow">
      <h2 className="text-lg font-semibold mb-2">Latest Vitals</h2>
      {loading && <p>Loading…</p>}
      {error && <p className="text-red-500">{error}</p>}
      {vitals && (
        <div>
          <p className="text-gray-700">{vitals.type}: {vitals.value}{vitals.unit}</p>
          <p className="text-sm text-gray-400">{new Date(vitals.timestamp).toLocaleString()}</p>
        </div>
      )}
      <button
        onClick={onRefresh}
        className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700"
      >
        Refresh
      </button>
    </div>
  );
}
