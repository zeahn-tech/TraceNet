import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

type Tone = 'primary' | 'secondary' | 'emergency' | 'success' | 'warning' | 'neutral';

const toneClass: Record<Tone, string> = {
  primary: 'bg-primary-50 text-primary',
  secondary: 'bg-secondary-50 text-secondary-700',
  emergency: 'bg-emergency-50 text-emergency-700',
  success: 'bg-success-50 text-success-700',
  warning: 'bg-warning-50 text-warning-700',
  neutral: 'bg-surface-border/60 text-ink-muted',
};

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return <span className={cn('badge', toneClass[tone], className)}>{children}</span>;
}
