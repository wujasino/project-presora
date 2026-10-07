import type { Server } from 'node:http';
import { test, expect } from '@playwright/test';
import { startFunctionServer, closeServer, loadHandler } from './functionServer';

// contact.js's rate limiter is an in-process Map keyed by IP — every test
// below uses its own fake x-nf-client-connection-ip so tests stay
// independent regardless of run order, except the rate-limit test itself,
// which deliberately reuses one IP.
const validPayload = { name: 'Jane Doe', email: 'jane@example.com', subject: 'Question', message: 'This message is long enough to pass validation.' };

let server: Server;
let baseURL: string;

test.beforeAll(async () => {
  process.env.SUPABASE_URL = 'https://e2e-placeholder.supabase.co';
  process.env.SUPABASE_SERVICE_KEY = 'e2e-placeholder-key';
  delete process.env.RESEND_API_KEY;
  const handler = await loadHandler('netlify/functions/contact.js');
  ({ server, url: baseURL } = await startFunctionServer(handler));
});

test.afterAll(async () => { await closeServer(server); });

test.describe('POST /.netlify/functions/contact — contract', () => {
  test('OPTIONS preflight returns 204 with CORS headers', async ({ request }) => {
    const res = await request.fetch(baseURL, { method: 'OPTIONS', headers: { origin: 'https://presora.app' } });
    expect(res.status()).toBe(204);
    expect(res.headers()['access-control-allow-methods']).toContain('POST');
  });

  test('rejects non-POST methods with 405', async ({ request }) => {
    const res = await request.get(baseURL);
    expect(res.status()).toBe(405);
  });

  test('rejects malformed JSON with 400', async ({ request }) => {
    const res = await request.post(baseURL, {
      headers: { 'content-type': 'text/plain', 'x-nf-client-connection-ip': '10.0.0.1' },
      data: '{not valid json',
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toMatch(/json/i);
  });

  test('rejects a name under 2 characters', async ({ request }) => {
    const res = await request.post(baseURL, {
      headers: { 'x-nf-client-connection-ip': '10.0.0.2' },
      data: { ...validPayload, name: 'A' },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toMatch(/name/i);
  });

  test('rejects an invalid email address', async ({ request }) => {
    const res = await request.post(baseURL, {
      headers: { 'x-nf-client-connection-ip': '10.0.0.3' },
      data: { ...validPayload, email: 'not-an-email' },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toMatch(/email/i);
  });

  test('rejects a message under 10 characters', async ({ request }) => {
    const res = await request.post(baseURL, {
      headers: { 'x-nf-client-connection-ip': '10.0.0.4' },
      data: { ...validPayload, message: 'short' },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toMatch(/message/i);
  });

  test('rejects a payload over 8KB with 413', async ({ request }) => {
    const res = await request.post(baseURL, {
      headers: { 'x-nf-client-connection-ip': '10.0.0.5' },
      data: { ...validPayload, message: 'x'.repeat(9 * 1024) },
    });
    expect(res.status()).toBe(413);
  });

  test('accepts a valid payload and echoes the allowed origin in CORS headers', async ({ request }) => {
    const res = await request.post(baseURL, {
      headers: { origin: 'https://presora.app', 'x-nf-client-connection-ip': '10.0.0.6' },
      data: validPayload,
    });
    expect(res.status()).toBe(200);
    expect(res.headers()['access-control-allow-origin']).toBe('https://presora.app');
  });

  test('does not reflect an untrusted Origin — falls back to the canonical domain', async ({ request }) => {
    const res = await request.post(baseURL, {
      headers: { origin: 'https://evil.example.com', 'x-nf-client-connection-ip': '10.0.0.7' },
      data: validPayload,
    });
    expect(res.headers()['access-control-allow-origin']).toBe('https://presora.app');
  });

  test('rate limits after 5 requests from the same IP within the window', async ({ request }) => {
    const ip = '10.0.0.100';
    for (let i = 0; i < 5; i++) {
      const res = await request.post(baseURL, { headers: { 'x-nf-client-connection-ip': ip }, data: validPayload });
      expect(res.status(), `request ${i + 1}/5 should be accepted`).toBe(200);
    }
    const sixth = await request.post(baseURL, { headers: { 'x-nf-client-connection-ip': ip }, data: validPayload });
    expect(sixth.status()).toBe(429);
  });

  test('a Supabase outage does not crash the handler — degrades to a clean 200', async ({ request }) => {
    // This endpoint's DB insert failure is intentionally non-fatal (best-effort
    // save, see contact.js) — confirms that holds even when the "outage" is a
    // real network failure (unreachable host), not just a mocked DB error.
    const res = await request.post(baseURL, {
      headers: { 'x-nf-client-connection-ip': '10.0.0.8' },
      data: validPayload,
    });
    expect(res.status()).toBe(200);
    expect((await res.json()).success).toBe(true);
  });
});
