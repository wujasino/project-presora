import { supabase } from '@/lib/supabase';

// Enterprise SAML 2.0 SSO. Supabase Auth acts as the Service Provider (SP) —
// this only works once an SSO connection has been registered for the
// customer's email domain via the Supabase CLI (`supabase sso add
// --type saml --metadata-url <their IdP metadata URL> --domains
// their-company.com`), which requires the SSO add-on to be enabled on the
// Supabase project. Until a domain has a registered connection, Supabase
// returns a normal auth error (e.g. "No SSO provider assigned for domain"),
// which is surfaced to the user like any other login error.
//
// Presora's own SP metadata (given to the customer's IdP admin to set up
// trust) lives at: <VITE_SUPABASE_URL>/auth/v1/sso/saml/metadata
export async function signInWithSSODomain(domain: string): Promise<void> {
  const trimmed = domain.trim().toLowerCase();
  if (!trimmed) {
    throw new Error('Enter your company domain.');
  }

  const origin = (import.meta.env.VITE_SITE_URL as string | undefined) ?? window.location.origin;

  const { data, error } = await supabase.auth.signInWithSSO({
    domain: trimmed,
    options: { redirectTo: `${origin}/dashboard` },
  });

  if (error) throw error;
  if (!data?.url) throw new Error('SSO is not set up for this domain yet.');

  window.location.assign(data.url);
}

export default signInWithSSODomain;
