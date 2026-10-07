/**
 * Blocks webhook URLs that resolve to private/internal/reserved addresses —
 * without this, a registered webhook URL pointing at e.g. a cloud metadata
 * endpoint (169.254.169.254) or an internal service (10.x/172.16-31.x/
 * 192.168.x, localhost) would have our own server make a request to it on
 * the user's behalf (SSRF). Used both when a webhook is created
 * (dev-webhooks.js) and again right before every delivery
 * (webhookDelivery.js) — DNS can change between registration and firing
 * (DNS rebinding), so a create-time-only check isn't enough.
 */
import dns from 'dns';
import net from 'net';

const isPrivateIPv4 = (ip) => {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return true;
  const [a, b] = parts;
  if (a === 0) return true;               // "this network"
  if (a === 10) return true;              // RFC1918
  if (a === 127) return true;             // loopback
  if (a === 169 && b === 254) return true; // link-local, incl. cloud metadata (169.254.169.254)
  if (a === 172 && b >= 16 && b <= 31) return true; // RFC1918
  if (a === 192 && b === 168) return true; // RFC1918
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  return false;
};

const isPrivateIPv6 = (ip) => {
  const lower = ip.toLowerCase();
  if (lower === '::1' || lower === '::') return true;
  if (lower.startsWith('fc') || lower.startsWith('fd')) return true; // fc00::/7 unique local
  if (/^fe[89ab]/.test(lower)) return true; // fe80::/10 link-local
  if (lower.startsWith('::ffff:')) { // IPv4-mapped IPv6
    const v4 = lower.split(':').pop();
    return net.isIPv4(v4) ? isPrivateIPv4(v4) : true;
  }
  return false;
};

const isPrivateIp = (ip) => {
  if (net.isIPv4(ip)) return isPrivateIPv4(ip);
  if (net.isIPv6(ip)) return isPrivateIPv6(ip);
  return true; // unrecognized format — fail closed
};

/**
 * @throws {Error} with a user-facing message if the URL isn't a safe,
 * publicly-routable HTTPS endpoint.
 */
export async function assertPublicHttpsUrl(rawUrl) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error('Invalid URL');
  }
  if (parsed.protocol !== 'https:') throw new Error('URL must use https://');
  if (!parsed.hostname || parsed.hostname === 'localhost') throw new Error('That host is not allowed');

  // URL.hostname keeps the brackets for a literal IPv6 host (e.g. "[::1]") —
  // dns.lookup() needs the bare address.
  const hostname = parsed.hostname.replace(/^\[|\]$/g, '');

  let addresses;
  try {
    addresses = await dns.promises.lookup(hostname, { all: true, verbatim: true });
  } catch {
    throw new Error('Could not resolve host');
  }
  if (!addresses || addresses.length === 0) throw new Error('Could not resolve host');

  for (const { address } of addresses) {
    if (isPrivateIp(address)) {
      throw new Error('URL resolves to a private or internal address, which is not allowed');
    }
  }
}
