import React from 'react';
import { ConnectedWearable, WearableProvider } from '../../types/api';

interface Props {
  providers: WearableProvider[];
  devices: ConnectedWearable[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export default function WearablesView({ providers, devices, loading, error, onRefresh }: Props) {
  return (
    <div className="p-4 bg-[#F3EFE0] dark:bg-[#1E293B] rounded-3xl shadow">
      <h2 className="text-lg font-semibold mb-2">Wearables</h2>
      {loading && <p>Loading…</p>}
      {error && <p className="text-red-500">{error}</p>}
      <button onClick={onRefresh} className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700">Refresh</button>
      {/* simple listing */}
      <div className="mt-3">
        <h3 className="font-medium">Connected Devices</h3>
        {devices.length === 0 ? <p>No devices</p> : <ul className="list-disc list-inside">
          {devices.map(d => <li key={d.id}>{d.deviceName}</li>)}
        </ul>}
      </div>
    </div>
  );
}
