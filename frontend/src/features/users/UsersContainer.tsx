import React, { useEffect, useState } from 'react';
import { User } from '../../types/api';
import * as userService from '../../services/userService';
import UsersView from './UsersView';

export default function UsersContainer() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const profile = await userService.getProfile();
      setUser(profile);
    } catch (err: any) {
      setError(err.message); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProfile(); }, []);

  return <UsersView user={user} loading={loading} error={error} onRefresh={loadProfile} />;
}
