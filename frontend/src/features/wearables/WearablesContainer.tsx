import React, { useEffect, useState } from 'react';
import { ConnectedWearable, WearableProvider } from '../../types/api';
import * as wearablesService from '../../services/wearablesService';
import WearablesView from './WearablesView';

export default function WearablesContainer() {
  const [providers, setProviders] = useState<WearableProvider[]>([]);
  const [devices, setDevices] = useState<ConnectedWearable[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prov, devs] = await Promise.all([
        wearablesService.getProviders(),
        wearablesService.listWearables(),
      ]);
      setProviders(prov);
      setDevices(devs);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return <WearablesView providers={providers} devices={devices} loading={loading} error={error} onRefresh={load} />;
}
