import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Logo } from '../../components/brand/Logo';
import { useAuthStore } from '../../store/auth';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Min 6 characters'),
});
type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const [show, setShow] = useState(false);
  const { signIn, signInWithGoogle, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setBusy(true);
    clearError();
    const { error } = await signIn(data.email, data.password);
    setBusy(false);
    if (!error) navigate('/app');
  };

  const google = async () => {
    setGoogleBusy(true);
    await signInWithGoogle();
    setGoogleBusy(false);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="bg-gradient-to-br from-primary to-secondary-700 px-6 pt-12 pb-16 rounded-b-3xl">
        <Logo size={48} className="mb-4" />
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="text-white/80 text-sm mt-1">Sign in to continue protecting your community.</p>
      </div>

      <motion.div
        className="flex-1 px-6 -mt-8"
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="card p-5 space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              id="email"
              type="email"
              label="Email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <div className="relative">
              <Input
                id="password"
                type={show ? 'text' : 'password'}
                label="Password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-9 text-ink-subtle hover:text-primary"
                aria-label={show ? 'Hide' : 'Show'}
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {error && <p className="text-xs text-emergency">{error}</p>}
            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={busy}>
              {busy ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
              Sign in
            </Button>
          </form>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-surface-border" />
            <span className="text-xs text-ink-subtle">or</span>
            <div className="h-px flex-1 bg-surface-border" />
          </div>

          <Button variant="outline" size="lg" className="w-full" onClick={google} disabled={googleBusy}>
            {googleBusy ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
              </svg>
            )}
            Continue with Google
          </Button>
        </div>

        <div className="mt-6 flex flex-col items-center gap-2 text-sm">
          <Link to="/register" className="text-secondary font-medium hover:underline">
            Create an account
          </Link>
          <Link to="/forgot-password" className="text-ink-muted hover:text-primary">
            Forgot password?
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
