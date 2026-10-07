import { useState, useEffect, useMemo } from 'react';
import { ChatWidgetShell, type ChatMsg } from '@/components/ui/chat-widget-shell';
import { supabase } from '@/lib/supabase';
import { AnalysisResult } from '@/types/analysis';

interface ResultChatWidgetProps {
  result: AnalysisResult;
}

const DIM_LABEL: Record<keyof AnalysisResult['dimensions'], string> = {
  authority: 'authority',
  sentiment: 'sentiment',
  accuracy: 'accuracy',
  mentions: 'mention rate',
  recency: 'recency',
};

const normalize = (v: number) => (typeof v === 'number' && !isNaN(v) ? (v <= 1 ? v * 100 : v) : 50);

// Authenticated "result interpreter" chat — explains THIS scan result and
// what to do about it. Sends the in-memory AnalysisResult with every
// message; nothing about the result is persisted server-side beyond the
// single request (see netlify/functions/explain-result.js).
export function ResultChatWidget({ result }: ResultChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const weakestDim = useMemo(() => {
    const entries = Object.entries(result.dimensions) as [keyof AnalysisResult['dimensions'], number][];
    return entries.reduce((min, cur) => (normalize(cur[1]) < normalize(min[1]) ? cur : min), entries[0]);
  }, [result.dimensions]);

  // Fresh conversation whenever the underlying result changes (new scan / different report).
  useEffect(() => {
    setMessages([{
      role: 'assistant',
      text: `Hi! I can walk you through ${result.brandName}'s result — why any dimension scored the way it did, and what to do next. Your ${DIM_LABEL[weakestDim[0]]} is the lowest at ${Math.round(normalize(weakestDim[1]))}%, if you want to start there.`,
    }]);
    setInput('');
    setError('');
  }, [result.id, result.brandName, weakestDim]);

  const suggestions = useMemo(() => [
    `Why is my ${DIM_LABEL[weakestDim[0]]} score low?`,
    'What should I fix first?',
    'How do I improve my overall score?',
  ], [weakestDim]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setError('');
    const next = [...messages, { role: 'user' as const, text: trimmed }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Please sign in again to use the assistant.');

      const res = await fetch('/.netlify/functions/explain-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          messages: next,
          result: {
            brandName: result.brandName,
            timestamp: result.timestamp,
            trustScore: result.trustScore,
            dimensions: result.dimensions,
            sources: result.sources,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Something went wrong.');
      setMessages(m => [...m, { role: 'assistant', text: data.reply || "Sorry, I didn't catch that." }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ChatWidgetShell
      title="Explain my result"
      messages={messages}
      loading={loading}
      error={error}
      input={input}
      onInputChange={setInput}
      onSend={send}
      suggestions={suggestions}
      open={open}
      onOpenChange={setOpen}
    />
  );
}

export default ResultChatWidget;
