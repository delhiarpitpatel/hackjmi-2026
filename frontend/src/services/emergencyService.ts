// src/services/emergencyService.ts

import apiClient from './apiClient';
import { EmergencyEvent, EmergencyContact } from '../types/api';

export async function triggerEmergency(payload: any): Promise<EmergencyEvent> {
  try {
    const res = await apiClient.post<EmergencyEvent>('/emergency/trigger', payload);
    return res.data;
  } catch (err) {
    console.error('triggerEmergency error', err);
    throw err;
  }
}

export async function updateEmergencyStatus(id: string, status: 'resolved' | 'cancelled'): Promise<EmergencyEvent> {
  try {
    const res = await apiClient.patch<EmergencyEvent>(`/emergency/${id}`, { status });
    return res.data;
  } catch (err) {
    console.error('updateEmergencyStatus error', err);
    throw err;
  }
}

export async function getEmergencyHistory(): Promise<EmergencyEvent[]> {
  try {
    const res = await apiClient.get<EmergencyEvent[]>('/emergency/history');
    return res.data;
  } catch (err) {
    console.error('getEmergencyHistory error', err);
    throw err;
  }
}

export async function addEmergencyContact(contact: Omit<EmergencyContact, 'id'>): Promise<EmergencyContact> {
  try {
    const res = await apiClient.post<EmergencyContact>('/emergency/contacts', contact);
    return res.data;
  } catch (err) {
    console.error('addEmergencyContact error', err);
    throw err;
  }
}

export async function listEmergencyContacts(): Promise<EmergencyContact[]> {
  try {
    const res = await apiClient.get<EmergencyContact[]>('/emergency/contacts');
    return res.data;
  } catch (err) {
    console.error('listEmergencyContacts error', err);
    throw err;
  }
}

export async function removeEmergencyContact(id: string): Promise<void> {
  try {
    await apiClient.delete(`/emergency/contacts/${id}`);
  } catch (err) {
    console.error('removeEmergencyContact error', err);
    throw err;
  }
}
