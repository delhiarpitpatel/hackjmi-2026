import { apiClient } from '../api/client';
import { ChatMessage, ChatHistoryResponse } from '../types/api';

export async function sendMessage(sessionId: string | null, text: string): Promise<ChatMessage> {
  const res = await apiClient.post<ChatMessage>('/chat/message', {
    message: text,
    session_id: sessionId || null,
  });
  return res;
}

export async function getChatHistory(sessionId: string): Promise<ChatMessage[]> {
  const res = await apiClient.get<ChatHistoryResponse>(`/chat/sessions/${sessionId}/history`);
  // Normalize backend shape to what ChatView expects
  return res.messages.map(m => ({
    ...m,
    id: m.message_id,
    sender: m.role === 'user' ? 'You' : 'CareCompanion',
    text: m.content,
  }));
}