import React, { useState } from 'react';
import AuthView from './AuthView';
import * as authService from '../../services/authService';

export default function AuthContainer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (phone: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const tokens = await authService.login(phone, password);
      localStorage.setItem('accessToken', tokens.accessToken);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return <AuthView onLogin={handleLogin} loading={loading} error={error} />;
}
