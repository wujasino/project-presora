import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Megaphone, Loader2, CheckCircle2, AlertCircle, Tag } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useIsAdmin } from '@/hooks/useAccountInfo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const PLAN_OPTIONS = ['Free', 'Starter', 'Solo', 'Business', 'Agency'] as const;

const AdminAnnouncements = () => {
  const { data: isAdmin = false, isLoading } = useIsAdmin();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [planScope, setPlanScope] = useState<string[]>([]);
  const [expiresAt, setExpiresAt] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const togglePlan = (p: string) =>
    setPlanScope((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim()) {
      setStatus('error');
      setMessage('Title and message are required.');
      return;
    }
    setStatus('loading');
    setMessage('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('You must be signed in.');

      const res = await fetch('/.netlify/functions/send-announcement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          planScope,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to send.');

      setStatus('ok');
      setMessage(`Sent to ${result.sent} account${result.sent === 1 ? '' : 's'}.`);
      setTitle('');
      setBody('');
      setPlanScope([]);
      setExpiresAt('');
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Unknown error.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Megaphone className="w-4.5 h-4.5 text-primary" />
          </div>
          <h1 className="text-2xl font-display text-foreground">Send announcement</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-6 ml-12">
          Broadcasts a notification straight into every matching account's bell.
        </p>

        <div className="space-y-5 rounded-2xl border border-border bg-card/60 p-6">
          <div>
            <label htmlFor="announcement-title" className="text-xs font-medium text-muted-foreground mb-1.5 block">Title</label>
            <input
              id="announcement-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              placeholder="Pricing update"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground"
            />
          </div>

          <div>
            <label htmlFor="announcement-body" className="text-xs font-medium text-muted-foreground mb-1.5 block">Message</label>
            <textarea
              id="announcement-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={2000}
              rows={4}
              placeholder="Solo and Business plan prices are changing on..."
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground resize-none"
            />
          </div>

          <div>
            <span className="text-xs font-medium text-muted-foreground mb-1.5 block">Applies to</span>
            <div className="flex flex-wrap gap-2">
              {PLAN_OPTIONS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePlan(p)}
                  aria-pressed={planScope.includes(p)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                    planScope.includes(p)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:border-primary/40'
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground/70 mt-1.5">
              Nothing selected = sent to every account. Selecting plans both targets delivery and shows as a badge on the notification.
            </p>
          </div>

          <div>
            <label htmlFor="announcement-expiry" className="text-xs font-medium text-muted-foreground mb-1.5 block">Hide after (optional)</label>
            <input
              id="announcement-expiry"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground"
            />
            <p className="text-[11px] text-muted-foreground/70 mt-1.5">
              After this time the notification stops appearing in the bell — leave blank to keep it until read.
            </p>
          </div>

          {message && (
            <div className={cn('flex items-center gap-2 text-sm', status === 'ok' ? 'text-emerald-500' : 'text-red-500')}>
              {status === 'ok' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              {message}
            </div>
          )}

          <Button onClick={handleSubmit} disabled={status === 'loading'} className="w-full gap-2">
            {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Megaphone className="w-4 h-4" />}
            Send announcement
          </Button>
        </div>

        <Link to="/admin/pricing" className="mt-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <Tag className="w-3.5 h-3.5" /> Go to custom plan pricing
        </Link>
      </div>
    </div>
  );
};

export default AdminAnnouncements;
