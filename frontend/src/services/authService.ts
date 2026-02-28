// src/services/authService.ts

import apiClient from './apiClient';
import { AuthTokens, User } from '../types/api';

export async function register(data: { name: string; phone: string; password: string }): Promise<User> {
  try {
    const res = await apiClient.post<User>('/auth/register', data);
    return res.data;
  } catch (err) {
    console.error('register error', err);
    throw err;
  }
}

export async function login(phone: string, password: string): Promise<AuthTokens> {
  try {
    const res = await apiClient.post<AuthTokens>('/auth/login', { phone, password });
    return res.data;
  } catch (err) {
    console.error('login error', err);
    throw err;
  }
}

export async function biometricLogin(payload: any): Promise<AuthTokens> {
  try {
    const res = await apiClient.post<AuthTokens>('/auth/biometric-login', payload);
    return res.data;
  } catch (err) {
    console.error('biometricLogin error', err);
    throw err;
  }
}

export async function aadhaarVerify(payload: any): Promise<any> {
  try {
    const res = await apiClient.post('/auth/aadhaar-verify', payload);
    return res.data;
  } catch (err) {
    console.error('aadhaarVerify error', err);
    throw err;
  }
}

export async function refreshToken(refreshToken: string): Promise<AuthTokens> {
  try {
    const res = await apiClient.post<AuthTokens>('/auth/refresh', { refreshToken });
    return res.data;
  } catch (err) {
    console.error('refreshToken error', err);
    throw err;
  }
}
