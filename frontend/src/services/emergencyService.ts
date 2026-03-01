import { apiClient } from '../api/client';
import { EmergencyEvent, EmergencyContact } from '../types/api';

export const getEmergencyHistory = () =>
  apiClient.get<EmergencyEvent[]>('/emergency/history');

export const listEmergencyContacts = () =>
  apiClient.get<EmergencyContact[]>('/emergency/contacts');

export const triggerSOS = (
  triggerMethod: 'button' | 'voice' | 'fall_detection' | 'auto',
  latitude?: number,
  longitude?: number,
) =>
  apiClient.post<EmergencyEvent>('/emergency/trigger', {
    trigger_method: triggerMethod,
    latitude,
    longitude,
  });

export const addContact = (data: {
  name: string;
  relation: string;
  phone: string;
  is_primary?: boolean;
}) => apiClient.post<EmergencyContact>('/emergency/contacts', data);

export const deleteContact = (id: string) =>
  apiClient.delete<null>(`/emergency/contacts/${id}`);