import { apiClient } from '../api/client';
import { Medication } from '../types/api';

export const listMedications = () =>
  apiClient.get<Medication[]>('/medications');

export const addMedication = (data: {
  name: string;
  dosage: string;
  frequency: string;
  times?: string[];
  with_food?: boolean;
}) => apiClient.post<Medication>('/medications', data);

export const deleteMedication = (id: string) =>
  apiClient.delete<null>(`/medications/${id}`);