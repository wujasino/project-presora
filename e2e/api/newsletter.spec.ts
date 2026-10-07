import type { Server } from 'node:http';
import { test, expect } from '@playwright/test';
import { startFunctionServer, closeServer, loadHandler } from './functionServer';

let server: Server;
let baseURL: string;

test.beforeAll(async () => {
  process.env.SUPABASE_URL = 'https://e2e-nonexistent-host-test.supabase.co';
  process.env.SUPABASE_SERVICE_KEY = 'e2e-placeholder-key';
  delete process.env.MAILCHIMP_API_KEY;
  delete process.env.RESEND_API_KEY;
  const handler = await loadHandler('netlify/functions/newsletter.js');
  ({ server, url: baseURL } = await startFunctionServer(handler));
});

test.afterAll(async () => { await closeServer(server); });

test.describe('POST /.netlify/functions/newsletter — contract', () => {
  test('rejects non-POST methods with 405', async ({ request }) => {
    const res = await request.get(baseURL);
    expect(res.status()).toBe(405);
  });

  test('rejects malformed JSON with 400', async ({ request }) => {
    const res = await request.post(baseURL, {
      headers: { 'content-type': 'text/plain', 'x-nf-client-connection-ip': '10.0.1.1' },
      data: '{not valid json',
    });
    expect(res.status()).toBe(400);
  });

  test('rejects an invalid email address', async ({ request }) => {
    const res = await request.post(baseURL, {
      headers: { 'x-nf-client-connection-ip': '10.0.1.2' },
      data: { email: 'not-an-email' },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toMatch(/email/i);
  });

  test('rejects a payload over 4KB with 413', async ({ request }) => {
    const res = await request.post(baseURL, {
      headers: { 'x-nf-client-connection-ip': '10.0.1.3' },
      data: { email: 'test@example.com', padding: 'x'.repeat(5 * 1024) },
    });
    expect(res.status()).toBe(413);
  });

  test('a Supabase outage returns a clean 500, not a raw crash', async ({ request }) => {
    // Regression-shaped test: newsletter-preference.js (a sibling function)
    // used to have no top-level try/catch and turned exactly this scenario
    // into a bare 502 instead of JSON — see this session's earlier fix.
    // newsletter.js already handles it correctly; this pins that down.
    const res = await request.post(baseURL, {
      headers: { 'x-nf-client-connection-ip': '10.0.1.4' },
      data: { email: 'db-outage-test@example.com' },
    });
    expect(res.status()).toBe(500);
    expect((await res.json()).error).toBeTruthy();
  });

  test('rate limits after 5 requests from the same IP within the window', async ({ request }) => {
    const ip = '10.0.1.200';
    for (let i = 0; i < 5; i++) {
      const res = await request.post(baseURL, { headers: { 'x-nf-client-connection-ip': ip }, data: { email: `user${i}@example.com` } });
      expect(res.status(), `request ${i + 1}/5 should not be rate-limited yet`).not.toBe(429);
    }
    const sixth = await request.post(baseURL, { headers: { 'x-nf-client-connection-ip': ip }, data: { email: 'user6@example.com' } });
    expect(sixth.status()).toBe(429);
  });

  test('does not reflect an untrusted Origin — falls back to the canonical domain', async ({ request }) => {
    const res = await request.post(baseURL, {
      headers: { origin: 'https://evil.example.com', 'x-nf-client-connection-ip': '10.0.1.5' },
      data: { email: 'origin-test@example.com' },
    });
    expect(res.headers()['access-control-allow-origin']).toBe('https://presora.app');
  });
});
