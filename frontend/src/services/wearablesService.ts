import { apiClient } from '../api/client';
import { ConnectedWearable, WearableProvider } from '../types/api';

export async function getProviders(): Promise<WearableProvider[]> {
  const res = await apiClient.get<{ providers: string[]; total_devices_supported: number }>(
    '/wearables/providers',
  );
  // Convert string list → WearableProvider shape used in WearablesView
  return res.providers.map(name => ({ id: name, name }));
}

export const listWearables = () =>
  apiClient.get<ConnectedWearable[]>('/wearables');

export const connectWearable = (data: {
  provider: string;
  access_token: string;
  refresh_token?: string;
}) =>
  apiClient.post<ConnectedWearable>('/wearables/connect', data);

export const disconnectWearable = (id: string) =>
  apiClient.delete<null>(`/wearables/${id}`);
