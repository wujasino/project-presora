import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, KeyRound, Copy, Check, ShieldCheck, ArrowRight, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { FloatingPathsBackground } from '@/components/ui/floating-paths';
import { Wordmark } from '@/components/Wordmark';

// Generate a readable backup code: XXXX-XXXX-XXXX-XXXX
function generateBackupCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const seg = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${seg()}-${seg()}-${seg()}-${seg()}`;
}

// Lightweight hash — we store SHA-256 so the plain code never persists in DB
async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

type Step = 'form' | 'code' | 'invalid';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('form');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  // Supabase puts the recovery token in the URL hash; exchange it for a session
  useEffect(() => {
    const hash = window.location.hash;
    // Handle both #access_token=... (old) and ?code=... (PKCE) flows
    if (hash.includes('type=recovery') || hash.includes('access_token')) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setHasSession(true);
        } else {
          setStep('invalid');
        }
      });
    } else {
      // Check if already signed in via recovery redirect (PKCE)
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setHasSession(true);
        } else {
          setStep('invalid');
        }
      });
    }
  }, []);

  const strength = (() => {
    if (password.length === 0) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const strengthLabel = ['', 'Weak', 'Medium', 'Good', 'Strong'][strength];
  const strengthColor = ['', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'][strength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      const { error: updateErr } = await supabase.auth.updateUser({ password });
      if (updateErr) throw updateErr;

      // Generate backup code and store its hash
      const code = generateBackupCode();
      const hash = await sha256(code);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('recovery_codes').upsert(
          { user_id: user.id, code_hash: hash, created_at: new Date().toISOString(), used_at: null },
          { onConflict: 'user_id' }
        );
      }

      setBackupCode(code);
      setStep('code');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(backupCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <FloatingPathsBackground position={1} className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/">
            <Wordmark className="text-2xl" />
          </Link>
        </div>

        <AnimatePresence mode="wait">

          {/* ── INVALID LINK ── */}
          {step === 'invalid' && (
            <motion.div
              key="invalid"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-destructive/30 bg-background/80 backdrop-blur-xl p-8 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-destructive" />
              </div>
              <h1 className="text-xl font-display text-foreground mb-2">Invalid or expired link</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Password reset links expire after 1 hour. Request a new link.
              </p>
              <Button asChild className="w-full">
                <Link to="/login">Back to login</Link>
              </Button>
            </motion.div>
          )}

          {/* ── PASSWORD FORM ── */}
          {step === 'form' && hasSession && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-[hsl(var(--glass-border))] bg-background/80 backdrop-blur-xl p-8"
            >
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="w-7 h-7 text-primary" />
                </div>
                <h1 className="text-2xl font-display text-foreground">New password</h1>
                <p className="text-sm text-muted-foreground mt-1">Enter a new password for your account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="password" className="text-sm font-medium">New password</Label>
                  <div className="relative mt-1.5">
                    <Input
                      id="password"
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="pr-10"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {password.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1 h-1">
                        {[1, 2, 3, 4].map(i => (
                          <div
                            key={i}
                            className={`flex-1 rounded-full transition-colors ${i <= strength ? strengthColor : 'bg-muted'}`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">{strengthLabel}</p>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirm" className="text-sm font-medium">Repeat password</Label>
                  <div className="relative mt-1.5">
                    <Input
                      id="confirm"
                      type={showConfirm ? 'text' : 'password'}
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="Repeat new password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirm.length > 0 && password !== confirm && (
                    <p className="text-xs text-destructive mt-1">Passwords do not match</p>
                  )}
                </div>

                {error && (
                  <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Change password <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>
            </motion.div>
          )}

          {/* ── BACKUP CODE ── */}
          {step === 'code' && (
            <motion.div
              key="code"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl border border-primary/20 bg-background/80 backdrop-blur-xl p-8"
            >
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-7 h-7 text-green-500" />
                </div>
                <h1 className="text-2xl font-display text-foreground">Password changed!</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Save the backup code below in a safe place.
                </p>
              </div>

              {/* Code display */}
              <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 mb-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground text-center mb-3">
                  Backup code — shown only once
                </p>
                <div className="flex items-center justify-between gap-3">
                  <code className="font-mono text-lg font-bold text-foreground tracking-[0.2em] flex-1 text-center select-all">
                    {backupCode}
                  </code>
                  <button
                    onClick={copyCode}
                    className="shrink-0 w-9 h-9 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                    aria-label="Copy code"
                  >
                    {copied
                      ? <Check className="w-4 h-4 text-green-500" />
                      : <Copy className="w-4 h-4 text-primary" />}
                  </button>
                </div>
              </div>

              <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-3 py-2.5 mb-6">
                <p className="text-xs text-yellow-600 dark:text-yellow-400 leading-relaxed">
                  <strong>Important:</strong> this code allows you to reset access to your account if you forget your password.
                  Save it in a password manager or print it. <strong>We will not show it again.</strong>
                </p>
              </div>

              <Button className="w-full" onClick={() => navigate('/dashboard')}>
                Go to dashboard <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </FloatingPathsBackground>
  );
}
