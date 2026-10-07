import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const VOICE_PREFS_KEY = 'bb_voice_prefs';

export interface VoicePrefs {
  enabled: boolean;
  voiceId: string;
}

export const DEFAULT_VOICE_PREFS: VoicePrefs = {
  enabled: false,
  voiceId: 'EXAVITQu4vr4xnSDxMaL',
};

// Static fallback shown before the real ElevenLabs catalog loads (or if that
// fetch fails) — fetchAvailableVoices() below returns the full, live list.
export const AVAILABLE_VOICES = [
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah',    description: 'Wyraźna, profesjonalna' },
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel',   description: 'Głęboki, spokojny'     },
  { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', description: 'Ciepła, naturalna'     },
  { id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum',   description: 'Dynamiczny, energiczny' },
];

export interface ElevenLabsVoice {
  id: string;
  name: string;
  previewUrl: string | null;
  category: string | null;
  labels: Record<string, string>;
}

/** Live voice catalog from the account's ElevenLabs API key. Requires sign-in. */
export async function fetchAvailableVoices(): Promise<ElevenLabsVoice[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];
  try {
    const res = await fetch('/.netlify/functions/list-voices', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.voices) ? data.voices : [];
  } catch {
    return [];
  }
}

export function loadVoicePrefs(): VoicePrefs {
  try {
    return { ...DEFAULT_VOICE_PREFS, ...JSON.parse(localStorage.getItem(VOICE_PREFS_KEY) || '{}') };
  } catch {
    return DEFAULT_VOICE_PREFS;
  }
}

export function saveVoicePrefs(prefs: VoicePrefs) {
  localStorage.setItem(VOICE_PREFS_KEY, JSON.stringify(prefs));
}

export function useTTS() {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => () => { audioRef.current?.pause(); }, []);

  const speak = async (text: string, voiceId?: string) => {
    const prefs = loadVoicePrefs();
    if (!prefs.enabled) return;

    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const res = await fetch('/.netlify/functions/tts', {
        method: 'POST',
        headers,
        body: JSON.stringify({ text, voiceId: voiceId ?? prefs.voiceId }),
      });
      if (!res.ok) throw new Error(await res.text());

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => { setPlaying(false); URL.revokeObjectURL(url); };
      audio.onerror = () => { setPlaying(false); setError('Błąd odtwarzania'); };
      await audio.play();
      setPlaying(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const stop = () => {
    audioRef.current?.pause();
    setPlaying(false);
  };

  return { speak, stop, playing, loading, error };
}
