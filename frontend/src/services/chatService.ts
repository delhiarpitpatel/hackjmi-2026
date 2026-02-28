// src/services/chatService.ts

import apiClient from './apiClient';
import { ChatMessage } from '../types/api';

export async function sendMessage(sessionId: string, text: string): Promise<ChatMessage> {
  try {
    const res = await apiClient.post<ChatMessage>('/chat/message', { sessionId, text });
    return res.data;
  } catch (err) {
    console.error('sendMessage error', err);
    throw err;
  }
}

export async function getChatHistory(sessionId: string): Promise<ChatMessage[]> {
  try {
    const res = await apiClient.get<ChatMessage[]>(`/chat/sessions/${sessionId}/history`);
    return res.data;
  } catch (err) {
    console.error('getChatHistory error', err);
    throw err;
  }
}
