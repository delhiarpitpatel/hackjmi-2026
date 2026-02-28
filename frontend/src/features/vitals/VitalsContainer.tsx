import React, { useEffect, useState } from 'react';
import { VitalReading } from '../../types/api';
import * as vitalsService from '../../services/vitalsService';
import VitalsView from './VitalsView';

export default function VitalsContainer() {
  const [vitals, setVitals] = useState<VitalReading | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLatest = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await vitalsService.getLatestVital();
      setVitals(data);
    } catch (err: any) {
      setError(err.message || 'Unable to load vitals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLatest();
  }, []);

  return <VitalsView vitals={vitals} loading={loading} error={error} onRefresh={loadLatest} />;
}
