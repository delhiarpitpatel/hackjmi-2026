import { apiClient } from '../api/client';
import { UserResponse } from '../types/api';

export const getProfile = () =>
  apiClient.get<UserResponse>('/users/me');

export const updateProfile = (data: Partial<{
  full_name: string;
  email: string;
  mobility_level: string;
  language: string;
  preferences: {
    font_size: number;
    high_contrast: boolean;
    voice_enabled: boolean;
  };
}>) => apiClient.patch<UserResponse>('/users/me', data);


// Maps backend UserResponse → legacy User shape used in UsersView
export async function getProfileLegacy() {
  const res = await getProfile();
  return {
    ...res,
    name: res.full_name,           // UsersView uses user.name
    deviceName: res.full_name,
  };
}
