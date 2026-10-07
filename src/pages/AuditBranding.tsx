import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Palette, Building2, Upload, Loader2, Save, Check, Lock, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePlan, isAgencyPlan, useSessionUser } from '@/hooks/useAccountInfo';

/**
 * /audit-branding — white-label identity for the client-ready audit at
 * /audit/:id (letterhead, "Prepared by", closing CTA).
 *
 * Lives under Tools rather than in Settings: it isn't an account preference,
 * it's the configuration of a deliverable, and it sits next to Reports where
 * the audits it brands are actually opened.
 *
 * Reads/writes `profiles` directly instead of going through
 * useAuditBranding — that hook is a read-only, fail-soft projection for the
 * report, and reusing it here would hide a save failure behind its Presora
 * fallback. On this screen a missing migration has to be said out loud.
 */
const AuditBranding = () => {
  const queryClient = useQueryClient();
  const { data: plan = 'Free' } = usePlan();
  const { data: sessionUser } = useSessionUser();
  const userId = sessionUser?.id ?? null;
  const canBrand = isAgencyPlan(plan);

  const [branding, setBranding] = useState({ name: '', logoUrl: '', contactEmail: '', website: '' });
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const MISSING_COLUMNS_HINT =
    'Branding columns are missing — run the 20240135_agency_branding.sql migration in Supabase.';

  useEffect(() => {
    if (!userId || !canBrand || loaded) return;
    (async () => {
      const { data, error: loadError } = await supabase
        .from('profiles')
        .select('agency_name, agency_logo_url, agency_contact_email, agency_website')
        .eq('id', userId)
        .single();
      if (loadError) {
        setError(loadError.code === '42703' ? MISSING_COLUMNS_HINT : 'Could not load your branding settings.');
      } else if (data) {
        setBranding({
          name: data.agency_name ?? '',
          logoUrl: data.agency_logo_url ?? '',
          contactEmail: data.agency_contact_email ?? '',
          website: data.agency_website ?? '',
        });
      }
      setLoaded(true);
    })();
  }, [userId, canBrand, loaded]);

  const edit = (patch: Partial<typeof branding>) => {
    setBranding(prev => ({ ...prev, ...patch }));
    setSaved(false);
  };

  const handleLogoFile = async (file: File) => {
    if (!userId) return;
    setError(null);

    if (!file.type.startsWith('image/')) { setError('Please choose an image file'); return; }
    if (file.size > 2 * 1024 * 1024) { setError('Logo must be under 2MB'); return; }

    setLogoUploading(true);
    try {
      const ALLOWED_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'svg'];
      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
      if (!ALLOWED_EXTS.includes(ext)) throw new Error('Please choose a PNG, JPG, WEBP or SVG file');

      // Same bucket as avatars, distinct filename — one less bucket to
      // provision, and the existing per-user-folder RLS policy already
      // covers `${userId}/…`.
      const storagePath = `${userId}/agency-logo.${ext}`;
      const { error: storageError } = await supabase.storage
        .from('avatars')
        .upload(storagePath, file, { upsert: true, contentType: file.type });
      if (storageError) throw storageError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(storagePath);
      edit({ logoUrl: `${data.publicUrl}?t=${Date.now()}` });
    } catch (err) {
      setError(err?.message ?? 'Upload failed, please try again');
    } finally {
      setLogoUploading(false);
    }
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    setError(null);
    setSaved(false);

    // Empty string means "unset" — write NULL so the report falls back to
    // Presora branding rather than rendering an empty letterhead.
    const orNull = (v: string) => v.trim() || null;

    const { error: saveError } = await supabase
      .from('profiles')
      .update({
        agency_name: orNull(branding.name),
        agency_logo_url: orNull(branding.logoUrl),
        agency_contact_email: orNull(branding.contactEmail),
        agency_website: orNull(branding.website),
      })
      .eq('id', userId);

    if (saveError) {
      setError(saveError.code === '42703' ? MISSING_COLUMNS_HINT : saveError.message);
    } else {
      setSaved(true);
      queryClient.invalidateQueries({ queryKey: ['audit-branding'] });
      setTimeout(() => setSaved(false), 2500);
    }
    setSaving(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-start gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <Palette className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Client branding</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            Put your own identity on the client-ready audit. The report letterhead and its
            closing “get in touch” block use these details, so a PDF you forward to a client
            points them back to you — not to Presora. Set once, applies to every audit.
          </p>
        </div>
      </div>

      {!canBrand ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <Lock className="w-6 h-6 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">Available on the Agency plan</p>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1">
            Branded, client-ready audit exports are part of the Agency plan.
          </p>
          <Link
            to="/pricing"
            className="inline-flex items-center gap-1.5 px-4 py-2 mt-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            See the Agency plan <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-6">
          {/* Logo */}
          <div className="space-y-2">
            <Label htmlFor="agency-logo">Logo</Label>
            <div className="flex items-center gap-4">
              <div className="w-28 h-14 rounded-lg border border-border bg-accent/30 flex items-center justify-center shrink-0 overflow-hidden">
                {branding.logoUrl
                  ? <img src={branding.logoUrl} alt="" className="max-h-12 max-w-24 object-contain" />
                  : <Building2 className="w-5 h-5 text-muted-foreground" />}
              </div>
              <div className="flex items-center gap-2">
                <input
                  ref={logoInputRef}
                  id="agency-logo"
                  name="agency-logo"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLogoFile(file);
                  }}
                />
                <Button type="button" size="sm" variant="outline" disabled={logoUploading} onClick={() => logoInputRef.current?.click()}>
                  {logoUploading
                    ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Uploading…</>
                    : <><Upload className="w-3.5 h-3.5 mr-1.5" /> Upload logo</>}
                </Button>
                {branding.logoUrl && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => edit({ logoUrl: '' })}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, WEBP or SVG, up to 2MB. A wide logo on a transparent background prints best.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="agency-name">Company name</Label>
            <Input
              id="agency-name"
              name="agency-name"
              maxLength={60}
              placeholder="Your agency's name"
              value={branding.name}
              onChange={(e) => edit({ name: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to keep the Presora wordmark on the report.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="agency-contact-email">Contact email</Label>
            <Input
              id="agency-contact-email"
              name="agency-contact-email"
              type="email"
              maxLength={160}
              placeholder="hello@youragency.com"
              value={branding.contactEmail}
              onChange={(e) => edit({ contactEmail: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Shown at the end of every audit as the address the client should reply to.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="agency-website">Website</Label>
            <Input
              id="agency-website"
              name="agency-website"
              type="url"
              maxLength={200}
              placeholder="https://youragency.com"
              value={branding.website}
              onChange={(e) => edit({ website: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Must start with http:// or https:// — anything else is left off the report.
            </p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex items-center gap-3 pt-1">
            <Button onClick={handleSave} disabled={saving || !loaded}>
              {saving
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…</>
                : saved
                ? <><Check className="w-4 h-4 mr-2" /> Saved</>
                : <><Save className="w-4 h-4 mr-2" /> Save branding</>}
            </Button>
            <Link to="/reports" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5">
              Open a report to preview <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditBranding;
