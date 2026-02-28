import React from 'react';
import { EmergencyEvent, EmergencyContact } from '../../types/api';

interface Props {
  history: EmergencyEvent[] | null;
  contacts: EmergencyContact[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export default function EmergencyView({ history, contacts, loading, error, onRefresh }: Props) {
  return (
    <div className="p-4 bg-app-card rounded-3xl shadow">
      <h2 className="text-lg font-semibold mb-2 text-app-danger">Emergency Dashboard</h2>
      {loading && <p>Loading…</p>}
      {error && <p className="text-app-danger">{error}</p>}
      <button
        onClick={onRefresh}
        className="mt-2 px-6 py-4 bg-app-danger border-2 border-app-primary text-white rounded-2xl hover:bg-red-700"
      >
        Refresh
      </button>
      {/* placeholder for history and contacts listing */}
      <div className="mt-4">
        <h3 className="font-medium">Contacts</h3>
        {contacts.length === 0 ? (
          <p>No contacts added.</p>
        ) : (
          <ul className="list-disc list-inside">
            {contacts.map((c) => (
              <li key={c.id}>{c.name} ({c.phone})</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
