import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { moderate } from "./_lib/moderation.js";

if (!globalThis.WebSocket) {
  globalThis.WebSocket = ws;
}

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY;
const MAX_CHARS = 50_000;
const EXTERNAL_TIMEOUT_MS = 20_000;

function chunkText(text, size = 800, overlap = 150) {
  const chunks = [];
  for (let i = 0; i < text.length; i += size - overlap) {
    chunks.push(text.slice(i, i + size).trim());
    if (i + size >= text.length) break;
  }
  return chunks.filter(Boolean);
}

async function embedBatch(inputs) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), EXTERNAL_TIMEOUT_MS);
  try {
    const res = await fetch("https://api.voyageai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${VOYAGE_API_KEY}`,
      },
      body: JSON.stringify({ model: "voyage-3.5", input: inputs, input_type: "document" }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Voyage embedding failed`);
    const data = await res.json();
    return data.data.sort((a, b) => a.index - b.index).map((d) => d.embedding);
  } finally {
    clearTimeout(id);
  }
}

export async function handler(event) {
  if (event.httpMethod !== "POST")
    return { statusCode: 405, body: "Method Not Allowed" };

  if (event.body && event.body.length > (MAX_CHARS + 2048)) {
    return { statusCode: 413, body: JSON.stringify({ error: "Payload too large" }) };
  }

  try {
    const token = event.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (!token) return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };

    let brandName, text;
    try {
      ({ brandName, text } = JSON.parse(event.body || "{}"));
    } catch {
      return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
    }

    if (!brandName || typeof brandName !== "string" || brandName.trim().length === 0)
      return { statusCode: 400, body: JSON.stringify({ error: "Missing brandName" }) };
    if (!text || typeof text !== "string")
      return { statusCode: 400, body: JSON.stringify({ error: "Missing text" }) };
    if (text.length > MAX_CHARS)
      return { statusCode: 413, body: JSON.stringify({ error: `Text too long (max ${MAX_CHARS} chars)` }) };

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { autoRefreshToken: false, persistSession: false },
      realtime: { transport: ws, params: { eventsPerSecond: 0 } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
    }

    // Moderation check
    const modResult = await moderate(`${brandName} ${text}`);
    if (modResult.flagged) {
      return { statusCode: 422, body: JSON.stringify({ error: modResult.reason || 'Content not allowed' }) };
    }

    const chunks = chunkText(text);
    if (chunks.length === 0)
      return { statusCode: 400, body: JSON.stringify({ error: "No content to save" }) };

    const embeddings = await embedBatch(chunks);

    const rows = chunks.map((content, i) => ({
      user_id: user.id,
      brand_name: brandName.trim(),
      content,
      embedding: JSON.stringify(embeddings[i]),
    }));

    const { error } = await supabase.from("brand_knowledge").insert(rows);
    if (error) throw error;

    return { statusCode: 200, body: JSON.stringify({ inserted: rows.length }) };
  } catch (err) {
    console.error("ingest-knowledge error:", err.message);
    return { statusCode: 500, body: JSON.stringify({ error: "Failed to save knowledge. Please try again." }) };
  }
}
