import { Shield } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Logo({ className, size = 40 }: { className?: string; size?: number }) {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-card',
        className
      )}
      style={{ width: size, height: size }}
    >
      <Shield size={size * 0.55} strokeWidth={2.2} />
    </div>
  );
}

export function LogoMark({ size = 28 }: { size?: number }) {
  return <Logo size={size} />;
}
