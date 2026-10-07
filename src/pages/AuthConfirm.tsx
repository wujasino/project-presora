import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { FloatingPathsBackground } from '@/components/ui/floating-paths';
import { Wordmark } from '@/components/Wordmark';

type Status = 'loading' | 'success' | 'error';

export default function AuthConfirm() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Supabase appends token_hash + type to the URL for email confirmation —
    // this shared endpoint also handles password-recovery links (type=recovery),
    // not just signup confirmation, so `type` has to allow for that.
    const params = new URLSearchParams(window.location.search);
    const tokenHash = params.get('token_hash');
    const type = params.get('type') as 'signup' | 'email' | 'recovery' | 'email_change' | 'invite' | null;

    const verifyToken = async () => {
      if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
        if (error) {
          setErrorMsg(error.message);
          setStatus('error');
        } else if (type === 'recovery') {
          // A recovery link just signed the user in via a one-time token —
          // send them straight to setting a new password instead of the
          // dashboard, or anyone who intercepts/reuses the link (or the user
          // themselves, absent-mindedly) lands inside the account without
          // ever being prompted to actually change the password they forgot.
          navigate('/reset-password', { replace: true });
        } else {
          setStatus('success');
          setTimeout(() => navigate('/dashboard'), 3000);
        }
      } else {
        // Might be the old hash-based flow — check for an active session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setStatus('success');
          setTimeout(() => navigate('/dashboard'), 3000);
        } else {
          setErrorMsg('No confirmation token in URL. The link may have expired.');
          setStatus('error');
        }
      }
    };

    verifyToken();
  }, [navigate]);

  return (
    <FloatingPathsBackground position={1} className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm text-center"
      >
        <div className="rounded-2xl border border-[hsl(var(--glass-border))] bg-background/80 backdrop-blur-xl p-8 space-y-5">

          {/* Logo */}
          <Link to="/" className="inline-block">
            <Wordmark className="text-xl" />
          </Link>

          {status === 'loading' && (
            <>
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Loader2 className="w-7 h-7 text-primary animate-spin" />
              </div>
              <div>
                <h1 className="text-xl font-display text-foreground">Verifying account…</h1>
                <p className="text-sm text-muted-foreground mt-1">Just a moment, verifying your link.</p>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto"
              >
                <CheckCircle2 className="w-7 h-7 text-green-500" />
              </motion.div>
              <div>
                <h1 className="text-xl font-display text-foreground">Account activated!</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  You will be redirected to the dashboard shortly…
                </p>
              </div>
              <Button asChild className="w-full">
                <Link to="/dashboard">Go to dashboard →</Link>
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                <XCircle className="w-7 h-7 text-destructive" />
              </div>
              <div>
                <h1 className="text-xl font-display text-foreground">Invalid link</h1>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {errorMsg || 'This link has expired or was already used. Register again or contact support.'}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button asChild className="w-full">
                  <Link to="/register">Register again</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/login">Back to login</Link>
                </Button>
              </div>
            </>
          )}

        </div>
      </motion.div>
    </FloatingPathsBackground>
  );
}
