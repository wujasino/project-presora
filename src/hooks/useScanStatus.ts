import { useQuery } from '@tanstack/react-query';

/**
 * Whether brand scanning is currently accepting requests.
 *
 * Lets the UI offer stored reports up front while the kill-switch is on,
 * rather than letting someone type a brand, sit through the progress
 * animation and land on an error. Purely advisory — analyze.js re-checks the
 * real flag server-side on every scan.
 *
 * Fails OPEN: a fetch failure resolves to `true`, so a blip in this endpoint
 * can never make the app tell users scanning is down when it isn't.
 */
const fetchScanStatus = async (): Promise<boolean> => {
  try {
    const res = await fetch('/.netlify/functions/scan-status');
    if (!res.ok) return true;
    const json = await res.json();
    return json?.enabled !== false;
  } catch {
    return true;
  }
};

export const useScanStatus = () => {
  const query = useQuery({
    queryKey: ['scan-status'],
    queryFn: fetchScanStatus,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });
  return { ...query, enabled: query.data !== false };
};
