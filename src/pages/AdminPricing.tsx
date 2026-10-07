import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Tag, Loader2, CheckCircle2, AlertCircle, Megaphone } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useIsAdmin } from '@/hooks/useAccountInfo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const AdminPricing = () => {
  const { data: isAdmin = false, isLoading } = useIsAdmin();
  const [email, setEmail] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState('');
  const [yearlyPrice, setYearlyPrice] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!email.trim()) {
      setStatus('error');
      setMessage('Email is required.');
      return;
    }
    setStatus('loading');
    setMessage('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('You must be signed in.');

      const res = await fetch('/.netlify/functions/set-custom-plan-price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          email: email.trim(),
          monthlyPrice: monthlyPrice.trim() === '' ? null : Number(monthlyPrice),
          yearlyPrice: yearlyPrice.trim() === '' ? null : Number(yearlyPrice),
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to save.');

      setStatus('ok');
      setMessage(`Saved for ${result.email} (${result.plan} plan).`);
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
            <Tag className="w-4.5 h-4.5 text-primary" />
          </div>
          <h1 className="text-2xl font-display text-foreground">Custom plan price</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-6 ml-12">
          Records a negotiated quote for one account (e.g. an Agency plan deal). Informational only —
          this does <strong>not</strong> change what Stripe actually charges them.
        </p>

        <div className="space-y-5 rounded-2xl border border-border bg-card/60 p-6">
          <div>
            <label htmlFor="price-email" className="text-xs font-medium text-muted-foreground mb-1.5 block">Account email</label>
            <Input
              id="price-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@company.com"
              className="bg-background"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="price-monthly" className="text-xs font-medium text-muted-foreground mb-1.5 block">Monthly price ($)</label>
              <Input
                id="price-monthly"
                type="number"
                min="0"
                step="0.01"
                value={monthlyPrice}
                onChange={(e) => setMonthlyPrice(e.target.value)}
                placeholder="220.00"
                className="bg-background"
              />
            </div>
            <div>
              <label htmlFor="price-yearly" className="text-xs font-medium text-muted-foreground mb-1.5 block">Yearly price ($)</label>
              <Input
                id="price-yearly"
                type="number"
                min="0"
                step="0.01"
                value={yearlyPrice}
                onChange={(e) => setYearlyPrice(e.target.value)}
                placeholder="2112.00"
                className="bg-background"
              />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground/70">
            Leave a field blank to clear that override.
          </p>

          {message && (
            <div className={`flex items-center gap-2 text-sm ${status === 'ok' ? 'text-emerald-500' : 'text-red-500'}`}>
              {status === 'ok' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              {message}
            </div>
          )}

          <Button onClick={handleSubmit} disabled={status === 'loading'} className="w-full gap-2">
            {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Tag className="w-4 h-4" />}
            Save price
          </Button>
        </div>

        <Link to="/admin/announcements" className="mt-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <Megaphone className="w-3.5 h-3.5" /> Go to announcements
        </Link>
      </div>
    </div>
  );
};

export default AdminPricing;
