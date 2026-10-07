import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ShieldOff, Loader2, CheckCircle2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';

type Step = 'idle' | 'qr' | 'verify' | 'done' | 'disabling';

interface Props {
  onStatusChange?: (enabled: boolean) => void;
}

export function TotpSetup({ onStatusChange }: Props) {
  const [enrolled, setEnrolled] = useState<boolean | null>(null);
  const [step, setStep] = useState<Step>('idle');
  const [qrUrl, setQrUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [factorId, setFactorId] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    checkEnrollment();
  }, []);

  const checkEnrollment = async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    const hasTOTP = data?.totp?.some(f => f.status === 'verified') ?? false;
    setEnrolled(hasTOTP);
    if (hasTOTP) {
      const factor = data?.totp?.find(f => f.status === 'verified');
      if (factor) setFactorId(factor.id);
    }
  };

  const handleEnroll = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: err } = await supabase.auth.mfa.enroll({ factorType: 'totp', issuer: 'Presora', friendlyName: 'Presora Authenticator' });
      if (err) throw err;
      setQrUrl(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactorId(data.id);
      setStep('qr');
    } catch (err) {
      setError(err instanceof Error ? err.message : '2FA configuration error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;
    setLoading(true);
    setError('');
    try {
      const { data: challengeData, error: challengeErr } = await supabase.auth.mfa.challenge({ factorId });
      if (challengeErr) throw challengeErr;

      const { error: verifyErr } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code,
      });
      if (verifyErr) throw verifyErr;

      setEnrolled(true);
      setStep('done');
      onStatusChange?.(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code. Please try again.');
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;
    setLoading(true);
    setError('');
    try {
      // Must challenge + verify before unenrolling
      const { data: challengeData, error: challengeErr } = await supabase.auth.mfa.challenge({ factorId });
      if (challengeErr) throw challengeErr;

      const { error: verifyErr } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code,
      });
      if (verifyErr) throw verifyErr;

      const { error: unenrollErr } = await supabase.auth.mfa.unenroll({ factorId });
      if (unenrollErr) throw unenrollErr;

      setEnrolled(false);
      setStep('idle');
      setCode('');
      setFactorId('');
      onStatusChange?.(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code.');
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (enrolled === null) {
    return <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">

        {/* ── Idle: enrolled ── */}
        {enrolled && step !== 'disabling' && (
          <motion.div key="enrolled" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span className="font-medium">Authenticator enabled</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Your account is protected by two-factor authentication. You will be prompted for a code from your app on every login.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="text-red-400 border-red-500/30 hover:bg-red-500/10"
              onClick={() => { setStep('disabling'); setCode(''); setError(''); }}
            >
              <ShieldOff className="w-3.5 h-3.5 mr-1.5" />
              Disable 2FA
            </Button>
          </motion.div>
        )}

        {/* ── Disabling: confirm with code ── */}
        {step === 'disabling' && (
          <motion.div key="disabling" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <p className="text-sm text-foreground font-medium">Confirm disabling 2FA</p>
            <p className="text-xs text-muted-foreground">Enter the code from your authenticator app to disable protection.</p>
            <form onSubmit={handleDisable} className="space-y-3">
              <Label htmlFor="totp-disable-code" className="sr-only">Authenticator code</Label>
              <Input
                id="totp-disable-code"
                name="totp-code"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                inputMode="numeric"
                maxLength={6}
                className="h-10 text-center text-xl tracking-widest font-bold"
                autoFocus
              />
              {error && <p className="text-xs text-red-400">{error}</p>}
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="ghost" onClick={() => { setStep('idle'); setCode(''); setError(''); }}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" variant="destructive" className="flex-1" disabled={loading || code.length < 6}>
                  {loading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <ShieldOff className="w-3.5 h-3.5 mr-1.5" />}
                  Disable 2FA
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        {/* ── Not enrolled ── */}
        {!enrolled && step === 'idle' && (
          <motion.div key="not-enrolled" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Add an extra layer of protection. Once enabled, you will be prompted for a one-time code from your app (Google Authenticator, Authy, etc.) on every login.
            </p>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <Button size="sm" variant="outline" onClick={handleEnroll} disabled={loading}>
              {loading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />}
              Enable Authenticator
            </Button>
          </motion.div>
        )}

        {/* ── QR code step ── */}
        {step === 'qr' && (
          <motion.div key="qr" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <p className="text-sm font-medium text-foreground">Scan QR code</p>
            <p className="text-xs text-muted-foreground">
              Open the Google Authenticator, Authy, or similar app and scan the QR code below.
            </p>
            <div className="flex justify-center">
              <div className="p-3 rounded-xl bg-white border border-[hsl(var(--glass-border))]">
                <img src={qrUrl} alt="TOTP QR Code" className="w-40 h-40" />
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">Can't scan? Enter the key manually:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 rounded-lg bg-muted text-xs font-mono text-foreground break-all">
                  {secret}
                </code>
                <Button type="button" size="sm" variant="outline" onClick={copySecret} className="shrink-0">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </div>
            <Button size="sm" className="w-full" onClick={() => { setStep('verify'); setCode(''); setError(''); }}>
              Next — enter verification code
            </Button>
          </motion.div>
        )}

        {/* ── Verify code ── */}
        {step === 'verify' && (
          <motion.div key="verify" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <p className="text-sm font-medium text-foreground">Verification</p>
            <p className="text-xs text-muted-foreground">Enter the 6-digit code from your authenticator app to confirm setup.</p>
            <form onSubmit={handleVerify} className="space-y-3">
              <Label htmlFor="totp-verify-code" className="sr-only">Authenticator code</Label>
              <Input
                id="totp-verify-code"
                name="totp-code"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                inputMode="numeric"
                maxLength={6}
                className="h-10 text-center text-xl tracking-widest font-bold"
                autoFocus
              />
              {error && <p className="text-xs text-red-400">{error}</p>}
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="ghost" onClick={() => setStep('qr')}>Back</Button>
                <Button type="submit" size="sm" className="flex-1" disabled={loading || code.length < 6}>
                  {loading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />}
                  Activate 2FA
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        {/* ── Done ── */}
        {step === 'done' && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-3 text-emerald-400">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <div>
              <p className="text-sm font-medium">2FA enabled!</p>
              <p className="text-xs text-muted-foreground">Your account is now protected by the authenticator.</p>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
