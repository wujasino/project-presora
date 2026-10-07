import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useSessionUser } from '@/hooks/useAccountInfo';

/**
 * White-label identity for the client-ready audit at /audit/:id.
 *
 * Falls back to Presora's own branding whenever the agency hasn't filled
 * theirs in — and, critically, also when the 20240135 migration hasn't been
 * applied yet. Selecting a column Postgres doesn't have is a hard error
 * (42703), so this query is kept OUT of the shared ['profile-flags'] select:
 * a missing column must degrade the report's letterhead, never break the
 * report itself.
 */
export interface AuditBranding {
  /** Name shown on the cover and in "Prepared by". Null = show the Presora wordmark. */
  name: string | null;
  logoUrl: string | null;
  contactEmail: string;
  website: string | null;
  /** True once the agency has supplied at least a name — drives the "Powered by" line. */
  isWhiteLabeled: boolean;
}

export const PRESORA_CONTACT_EMAIL = 'contact.presora@gmail.com';

const PRESORA_BRANDING: AuditBranding = {
  name: null,
  logoUrl: null,
  contactEmail: PRESORA_CONTACT_EMAIL,
  website: null,
  isWhiteLabeled: false,
};

// Mirrors the CHECK constraints in the 20240135 migration. Applied on read
// as well as on write so a row that predates a constraint (or was written by
// a service-role path) still can't stretch the report's header.
const clamp = (value: unknown, max: number): string | null => {
  const text = typeof value === 'string' ? value.trim() : '';
  return text ? text.slice(0, max) : null;
};

// Only http(s) — a javascript: or data: URL in agency_logo_url would other-
// wise land straight in an <img src> on a page the agency prints and mails.
const safeHttpUrl = (value: unknown, max: number): string | null => {
  const raw = clamp(value, max);
  if (!raw) return null;
  try {
    const parsed = new URL(raw);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? raw : null;
  } catch {
    return null;
  }
};

const fetchAuditBranding = async (userId: string): Promise<AuditBranding> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('agency_name, agency_logo_url, agency_contact_email, agency_website')
    .eq('id', userId)
    .single();

  if (error || !data) return PRESORA_BRANDING;

  const name = clamp(data.agency_name, 60);
  return {
    name,
    logoUrl: safeHttpUrl(data.agency_logo_url, 500),
    contactEmail: clamp(data.agency_contact_email, 160) ?? PRESORA_CONTACT_EMAIL,
    website: safeHttpUrl(data.agency_website, 200),
    isWhiteLabeled: Boolean(name),
  };
};

export const useAuditBranding = () => {
  const { data: sessionUser, isLoading: userLoading } = useSessionUser();
  const userId = sessionUser?.id ?? null;
  const query = useQuery({
    queryKey: ['audit-branding', userId],
    queryFn: () => fetchAuditBranding(userId as string),
    enabled: !userLoading && !!userId,
    staleTime: 5 * 60 * 1000,
  });
  return { ...query, data: query.data ?? PRESORA_BRANDING };
};
