import { Bell, BellOff, CheckCheck } from 'lucide-react';
import { useNotifications } from '../hooks/queries';
import { useAuthStore } from '../store/auth';
import { notificationService } from '../services';
import { useQueryClient } from '@tanstack/react-query';
import { qk } from '../hooks/queries';
import { ListSkeleton, EmptyState } from '../components/ui/Feedback';
import { Button } from '../components/ui/Button';
import { formatRelative } from '../lib/utils';

export function NotificationsPage() {
  const session = useAuthStore((s) => s.session);
  const { data, isLoading } = useNotifications(session?.user.id);
  const qc = useQueryClient();

  const markAll = async () => {
    if (!session) return;
    await notificationService.markAllRead(session.user.id);
    qc.invalidateQueries({ queryKey: qk.notifications(session.user.id) });
  };

  const markOne = async (id: string) => {
    await notificationService.markRead(id);
    if (session) qc.invalidateQueries({ queryKey: qk.notifications(session.user.id) });
  };

  if (!session) {
    return (
      <div className="page-pad py-4">
        <EmptyState icon={<Bell size={22} />} title="Sign in to see notifications" />
      </div>
    );
  }

  return (
    <div className="page-pad py-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary">Notifications</h1>
        {(data ?? []).some((n) => !n.read) && (
          <Button size="sm" variant="ghost" onClick={markAll}>
            <CheckCheck size={14} /> Mark all read
          </Button>
        )}
      </div>

      {isLoading ? (
        <ListSkeleton count={3} />
      ) : (data ?? []).length === 0 ? (
        <EmptyState icon={<BellOff size={22} />} title="No notifications" description="You're all caught up." />
      ) : (
        <div className="space-y-2">
          {(data ?? []).map((n) => (
            <button
              key={n.id}
              onClick={() => markOne(n.id)}
              className={`card p-3 w-full text-left flex gap-3 ${n.read ? 'opacity-70' : 'border-secondary-200'}`}
            >
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${n.read ? 'bg-surface-border text-ink-muted' : 'bg-secondary text-white'}`}>
                <Bell size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-primary">{n.title}</p>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-secondary shrink-0" />}
                </div>
                {n.body && <p className="text-xs text-ink-muted mt-0.5">{n.body}</p>}
                <p className="text-[11px] text-ink-subtle mt-1">{formatRelative(n.created_at)}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
