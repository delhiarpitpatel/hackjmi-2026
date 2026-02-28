import React, { useState } from 'react';
import { WorkoutPlan } from '../../types/api';
import * as workoutsService from '../../services/workoutsService';
import WorkoutsView from './WorkoutsView';

export default function WorkoutsContainer() {
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await workoutsService.generateWorkoutPlan({});
      setPlan(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return <WorkoutsView plan={plan} loading={loading} error={error} onGenerate={generate} />;
}
