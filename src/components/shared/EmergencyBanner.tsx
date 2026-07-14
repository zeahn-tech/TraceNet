import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Volume2 } from 'lucide-react';
import { useState } from 'react';
import type { Alert } from '../../types';
import { PriorityBadge, AlertTypeBadge } from '../shared/Badges';
import { cn } from '../../lib/utils';

export function EmergencyBanner({ alerts }: { alerts: Alert[] }) {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [soundOn, setSoundOn] = useState(false);

  const active = alerts
    .filter((a) => a.priority === 'critical' || a.priority === 'high')
    .filter((a) => !dismissed.includes(a.id))
    .slice(0, 1);

  if (active.length === 0) return null;
  const alert = active[0];
  const critical = alert.priority === 'critical';

  const dismiss = () => setDismissed((d) => [...d, alert.id]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className={cn(
          'rounded-2xl border p-4 shadow-card',
          critical ? 'bg-emergency text-white border-emergency-600' : 'bg-warning-50 border-warning-200 text-warning-900'
        )}
      >
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className={critical ? 'animate-pulse-soft' : ''} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold">{alert.title}</p>
              <PriorityBadge priority={alert.priority} />
              <AlertTypeBadge type={alert.type} />
            </div>
            <p className={cn('text-xs mt-1', critical ? 'text-white/90' : 'text-warning-800')}>
              {alert.message}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSoundOn((s) => !s)}
              className={cn('p-1.5 rounded-lg', soundOn ? 'bg-white/30' : 'hover:bg-white/10')}
              aria-label="Toggle sound"
            >
              <Volume2 size={16} />
            </button>
            <button
              onClick={dismiss}
              className="p-1.5 rounded-lg hover:bg-white/10"
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
