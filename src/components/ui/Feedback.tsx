import type { ReactNode } from 'react';

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-4 flex gap-3">
          <Skeleton className="h-16 w-16 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      <div className="h-14 w-14 rounded-2xl bg-primary-50 text-primary flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-primary">{title}</h3>
      {description && <p className="mt-1 text-sm text-ink-muted max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-6">
      <div className="h-14 w-14 rounded-2xl bg-emergency-50 text-emergency flex items-center justify-center mb-3">
        <span className="text-xl font-bold">!</span>
      </div>
      <h3 className="text-base font-semibold text-primary">Something went wrong</h3>
      <p className="mt-1 text-sm text-ink-muted max-w-xs">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-outline mt-4">
          Try again
        </button>
      )}
    </div>
  );
}
