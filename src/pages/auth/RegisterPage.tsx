import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { User, Building2, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Logo } from '../../components/brand/Logo';
import { useAuthStore } from '../../store/auth';
import type { UserRole } from '../../types';

const schema = z
  .object({
    full_name: z.string().min(2, 'Enter your full name'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(6, 'Min 6 characters'),
    role: z.enum(['citizen', 'law_enforcement', 'admin']),
    agency: z.string().optional(),
  })
  .refine((d) => d.role !== 'law_enforcement' || (d.agency ?? '').length > 0, {
    path: ['agency'],
    message: 'Agency is required for law enforcement',
  });
type FormData = z.infer<typeof schema>;

const roles: { value: UserRole; label: string; description: string }[] = [
  { value: 'citizen', label: 'Citizen', description: 'Report and follow safety cases' },
  { value: 'law_enforcement', label: 'Law Enforcement', description: 'Manage and verify cases' },
  { value: 'admin', label: 'Administrator', description: 'Full platform oversight' },
];

export function RegisterPage() {
  const { signUp, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [role, setRole] = useState<UserRole>('citizen');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { role: 'citizen' } });

  const onSubmit = async (data: FormData) => {
    setBusy(true);
    clearError();
    const { error } = await signUp(data.email, data.password, {
      full_name: data.full_name,
      role: data.role,
      agency: data.agency,
    });
    setBusy(false);
    if (!error) navigate('/app');
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="bg-gradient-to-br from-primary to-secondary-700 px-6 pt-12 pb-16 rounded-b-3xl">
        <Logo size={44} className="mb-4" />
        <h1 className="text-2xl font-bold text-white">Create your account</h1>
        <p className="text-white/80 text-sm mt-1">Join the community working for safer streets.</p>
      </div>

      <motion.div
        className="flex-1 px-6 -mt-8 pb-10"
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="card p-5 space-y-4">
          <div>
            <label className="label">I am joining as</label>
            <div className="grid grid-cols-1 gap-2">
              {roles.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => {
                    setRole(r.value);
                    setValue('role', r.value);
                  }}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                    role === r.value
                      ? 'border-secondary bg-secondary-50'
                      : 'border-surface-border hover:bg-primary-50'
                  }`}
                >
                  <div
                    className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                      role === r.value ? 'bg-secondary text-white' : 'bg-surface-border text-ink-muted'
                    }`}
                  >
                    {r.value === 'citizen' ? <User size={18} /> : <Building2 size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary">{r.label}</p>
                    <p className="text-xs text-ink-muted">{r.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              id="full_name"
              label="Full name"
              placeholder="Jane Doe"
              error={errors.full_name?.message}
              {...register('full_name')}
            />
            <Input
              id="email"
              type="email"
              label="Email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              id="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
            {watch('role') === 'law_enforcement' && (
              <Input
                id="agency"
                label="Agency"
                placeholder="e.g. Chicago PD"
                error={errors.agency?.message}
                {...register('agency')}
              />
            )}
            {error && <p className="text-xs text-emergency">{error}</p>}
            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={busy}>
              {busy ? <Loader2 size={18} className="animate-spin" /> : null}
              Create account
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-ink-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-secondary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
