import React, { useState } from 'react';

interface Props {
  onLogin: (phone: string, password: string) => void;
  loading: boolean;
  error: string | null;
}

export default function AuthView({ onLogin, loading, error }: Props) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="p-6 bg-app-card rounded-3xl shadow max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Login</h2>
      {error && <p className="text-red-500">{error}</p>}
      <input
        className="w-full mb-2 p-2 border rounded"
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <input
        type="password"
        className="w-full mb-4 p-2 border rounded"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        onClick={() => onLogin(phone, password)}
        disabled={loading}
        className="w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </div>
  );
}
