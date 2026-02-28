import React, { useState } from 'react';
import { ChatMessage } from '../../types/api';

interface Props {
  sessionId: string;
  setSessionId: (id: string) => void;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  onSend: (text: string) => void;
}

export default function ChatView({ sessionId, setSessionId, messages, loading, error, onSend }: Props) {
  const [input, setInput] = useState('');

  return (
    <div className="p-4 bg-app-card rounded-3xl shadow max-w-md mx-auto">
      <h2 className="text-lg font-semibold mb-2">Chat</h2>
      <input type="text" placeholder="Session ID" value={sessionId} onChange={e => setSessionId(e.target.value)} className="border p-2 rounded mb-2 w-full" />
      <button onClick={() => onSend(input)} disabled={loading || !input} className="px-4 py-2 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-50 mb-2">Send</button>
      {error && <p className="text-red-500">{error}</p>}
      <div className="mt-3 max-h-60 overflow-y-auto border p-2">
        {messages.map(m => (
          <p key={m.id}><strong>{m.sender}:</strong> {m.text}</p>
        ))}
      </div>
    </div>
  );
}
