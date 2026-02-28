import React from 'react';
import { User } from '../../types/api';

interface Props {
  user: User | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export default function UsersView({ user, loading, error, onRefresh }: Props) {
  return (
    <div className="p-4 bg-app-card rounded-3xl shadow max-w-md mx-auto">
      <h2 className="text-lg font-semibold mb-2">Profile</h2>
      {loading && <p>Loading…</p>}
      {error && <p className="text-red-500">{error}</p>}
      {user && (
        <div>
          <p>Name: {user.name}</p>
          <p>Phone: {user.phone}</p>
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
