// src/context/AppContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, VitalReading, EmergencyEvent } from '../types/api';
import * as userService from '../services/userService';
import * as vitalsService from '../services/vitalsService';

interface AppState {
  user: User | null;
  latestVitals: VitalReading | null;
  emergencyStatus: EmergencyEvent | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  refreshVitals: () => Promise<void>;
  setEmergencyStatus: (e: EmergencyEvent | null) => void;
}

const defaultState: AppState = {
  user: null,
  latestVitals: null,
  emergencyStatus: null,
  loading: false,
  error: null,
  refreshUser: async () => {},
  refreshVitals: async () => {},
  setEmergencyStatus: () => {},
};

const AppContext = createContext<AppState>(defaultState);

export function useAppContext() {
  return useContext(AppContext);
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [latestVitals, setLatestVitals] = useState<VitalReading | null>(null);
  const [emergencyStatus, setEmergencyStatus] = useState<EmergencyEvent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = async () => {
    setLoading(true);
    setError(null);
    try {
      const profile = await userService.getProfile();
      setUser(profile);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user');
    } finally {
      setLoading(false);
    }
  };

  const refreshVitals = async () => {
    setLoading(true);
    setError(null);
    try {
      const vitals = await vitalsService.getLatestVital();
      setLatestVitals(vitals);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch vitals');
    } finally {
      setLoading(false);
    }
  };

  // pull initial data once on mount
  useEffect(() => {
    refreshUser();
    refreshVitals();
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        latestVitals,
        emergencyStatus,
        loading,
        error,
        refreshUser,
        refreshVitals,
        setEmergencyStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
