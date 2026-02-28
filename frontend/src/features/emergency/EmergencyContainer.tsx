import React, { useEffect, useState } from 'react';
import { EmergencyEvent, EmergencyContact } from '../../types/api';
import * as emergencyService from '../../services/emergencyService';
import EmergencyView from './EmergencyView';

export default function EmergencyContainer() {
  const [history, setHistory] = useState<EmergencyEvent[] | null>(null);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [hist, conts] = await Promise.all([
        emergencyService.getEmergencyHistory(),
        emergencyService.listEmergencyContacts(),
      ]);
      setHistory(hist);
      setContacts(conts);
    } catch (err: any) {
      setError(err.message || 'Failed to load emergency data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <EmergencyView
      history={history}
      contacts={contacts}
      loading={loading}
      error={error}
      onRefresh={loadData}
    />
  );
}
