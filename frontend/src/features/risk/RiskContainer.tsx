import React, { useEffect, useState } from 'react';
import { RiskPrediction } from '../../types/api';
import * as riskService from '../../services/riskService';
import RiskView from './RiskView';

export default function RiskContainer() {
  const [history, setHistory] = useState<RiskPrediction[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const h = await riskService.getRiskHistory();
      setHistory(h);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return <RiskView history={history} loading={loading} error={error} onRefresh={load} />;
}
