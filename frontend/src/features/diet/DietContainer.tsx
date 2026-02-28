import React, { useState } from 'react';
import { MealPlan } from '../../types/api';
import * as dietService from '../../services/dietService';
import DietView from './DietView';

export default function DietContainer() {
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [date, setDate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlan = async () => {
    if (!date) return;
    setLoading(true);
    setError(null);
    try {
      const data = await dietService.getMealPlan(date);
      setPlan(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return <DietView plan={plan} date={date} setDate={setDate} loading={loading} error={error} onFetch={fetchPlan} />;
}
