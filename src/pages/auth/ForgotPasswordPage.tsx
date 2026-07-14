import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Logo } from '../../components/brand/Logo';
import { supabase } from '../../lib/supabase';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setBusy(false);
    if (error) setError(error.message);
    else setDone(true);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="bg-gradient-to-br from-primary to-secondary-700 px-6 pt-12 pb-16 rounded-b-3xl">
        <Logo size={44} className="mb-4" />
        <h1 className="text-2xl font-bold text-white">Reset password</h1>
        <p className="text-white/80 text-sm mt-1">We'll send a recovery link to your email.</p>
      </div>

      <div className="flex-1 px-6 -mt-8 pb-10">
        <div className="card p-5 space-y-4">
          {done ? (
            <div className="text-center py-6">
              <CheckCircle size={48} className="mx-auto text-success mb-3" />
              <h3 className="text-base font-semibold text-primary">Check your inbox</h3>
              <p className="mt-1 text-sm text-ink-muted">
                If an account exists for {email}, a reset link is on its way.
              </p>
              <Link to="/login" className="inline-block mt-4 text-secondary font-medium hover:underline">
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <Input
                id="email"
                type="email"
                label="Email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {error && <p className="text-xs text-emergency">{error}</p>}
              <Button type="submit" variant="primary" size="lg" className="w-full" disabled={busy}>
                {busy ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
                Send reset link
              </Button>
            </form>
          )}
        </div>
        <Link
          to="/login"
          className="mt-6 flex items-center justify-center gap-1.5 text-sm text-ink-muted hover:text-primary"
        >
          <ArrowLeft size={16} /> Back to sign in
        </Link>
      </div>
    </div>
  );
}
