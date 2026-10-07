const BLOCKLIST = [
  // hate / violence
  'nigger','nigga','chink','spic','kike','faggot','tranny',
  'terrorist','bomb making','how to kill','suicide method',
  // spam / scam signals
  'buy followers','crypto pump','click here to win','you have been selected',
  // explicit
  'porn','xxx','onlyfans','escort','sex service',
  // injections
  'ignore previous instructions','disregard the above','jailbreak',
];

const BLOCKLIST_RE = new RegExp(
  BLOCKLIST.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'),
  'i'
);

/**
 * Returns { flagged: boolean, reason?: string }
 * Uses OpenAI Moderation API when OPENAI_API_KEY is set, falls back to blocklist.
 */
export async function moderate(text) {
  const openaiKey = process.env.OPENAI_API_KEY;

  if (openaiKey) {
    try {
      const res = await fetch('https://api.openai.com/v1/moderations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({ input: text.slice(0, 10_000) }),
        signal: AbortSignal.timeout(6_000),
      });

      if (res.ok) {
        const data = await res.json();
        const result = data.results?.[0];
        if (result?.flagged) {
          const topCategory = Object.entries(result.categories ?? {})
            .filter(([, v]) => v)
            .map(([k]) => k)[0] ?? 'policy violation';
          return { flagged: true, reason: `Content flagged: ${topCategory}` };
        }
        return { flagged: false };
      }
    } catch {
      // fall through to blocklist
    }
  }

  // Blocklist fallback
  if (BLOCKLIST_RE.test(text)) {
    return { flagged: true, reason: 'Content contains prohibited terms' };
  }

  return { flagged: false };
}
