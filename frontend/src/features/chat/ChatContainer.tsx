import React, { useEffect, useState } from 'react';
import { ChatMessage } from '../../types/api';
import * as chatService from '../../services/chatService';
import ChatView from './ChatView';

export default function ChatContainer() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = async () => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    try {
      const hist = await chatService.getChatHistory(sessionId);
      setMessages(hist);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadHistory(); }, [sessionId]);

  const send = async (text: string) => {
    if (!sessionId) return;
    try {
      const msg = await chatService.sendMessage(sessionId, text);
      setMessages((prev) => [...prev, msg]);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return <ChatView sessionId={sessionId} setSessionId={setSessionId} messages={messages} loading={loading} error={error} onSend={send} />;
}
