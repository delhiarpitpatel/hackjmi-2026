import React, { useEffect, useState } from 'react';
import { Medication } from '../../types/api';
import * as medsService from '../../services/medicationsService';
import MedicationsView from './MedicationsView';

export default function MedicationsContainer() {
  const [list, setList] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const meds = await medsService.listMedications();
      setList(meds);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return <MedicationsView medications={list} loading={loading} error={error} onRefresh={load} />;
}
