// Shared, cached ElevenLabs voice catalog — used by list-voices.js (returns
// it to the client for the Settings picker) and tts.js (validates a
// requested voiceId is real before spending a paid synthesis call on it).
// Cached in-memory per warm function instance since the voice list rarely
// changes; avoids hitting ElevenLabs on every request from every user.

const CACHE_TTL_MS = 10 * 60 * 1000;
let cache = { voices: null, fetchedAt: 0 };

// ElevenLabs voice ids are short alphanumeric strings. Enforcing this shape
// server-side (in addition to the real-id check below) means a malformed or
// path-traversal-style value never even reaches the cache/network lookup.
const VOICE_ID_SHAPE = /^[A-Za-z0-9]{10,40}$/;

async function fetchVoicesFromElevenLabs(apiKey) {
  const res = await fetch('https://api.elevenlabs.io/v1/voices', {
    headers: { 'xi-api-key': apiKey },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    throw new Error(`ElevenLabs voices fetch failed: ${res.status}`);
  }
  const data = await res.json();
  return (data.voices || []).map((v) => ({
    id: v.voice_id,
    name: v.name,
    previewUrl: v.preview_url || null,
    category: v.category || null,
    labels: v.labels || {},
  }));
}

/** Returns the cached voice list, refreshing it if stale. */
export async function getVoices(apiKey) {
  const fresh = Date.now() - cache.fetchedAt < CACHE_TTL_MS;
  if (fresh && cache.voices) return cache.voices;

  const voices = await fetchVoicesFromElevenLabs(apiKey);
  cache = { voices, fetchedAt: Date.now() };
  return voices;
}

/** True only for a voiceId that is both well-formed and a real, current ElevenLabs voice. */
export async function isValidVoiceId(apiKey, voiceId) {
  if (typeof voiceId !== 'string' || !VOICE_ID_SHAPE.test(voiceId)) return false;
  try {
    const voices = await getVoices(apiKey);
    return voices.some((v) => v.id === voiceId);
  } catch (err) {
    console.error('Voice validation lookup failed:', err.message);
    return false;
  }
}
