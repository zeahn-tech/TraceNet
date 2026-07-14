import { useState } from 'react';
import { Megaphone, Plus, Trash2, Loader2, Filter } from 'lucide-react';
import { useAlerts, useCreateAlert, useDeleteAlert } from '../hooks/queries';
import { AlertCard } from '../components/shared/Cards';
import { ListSkeleton, EmptyState } from '../components/ui/Feedback';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Textarea, Select } from '../components/ui/Input';
import { useAuthStore } from '../store/auth';
import { cn } from '../lib/utils';
import type { AlertPriority, AlertType } from '../types';

const priorities: { value: AlertPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];
const types: { value: AlertType; label: string }[] = [
  { value: 'emergency', label: 'Emergency' },
  { value: 'crime_warning', label: 'Crime Warning' },
  { value: 'public_notice', label: 'Public Notice' },
  { value: 'case_update', label: 'Case Update' },
];

export function AlertsPage() {
  const { data, isLoading } = useAlerts();
  const profile = useAuthStore((s) => s.profile);
  const canPublish = profile && (profile.role === 'law_enforcement' || profile.role === 'admin');
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  const filtered = (data ?? []).filter((a) => filter === 'all' || a.priority === filter);

  return (
    <div className="page-pad py-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary">Alerts</h1>
        {canPublish && (
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus size={16} /> New alert
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        <Filter size={14} className="text-ink-subtle shrink-0" />
        {['all', 'critical', 'high', 'medium', 'low'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors capitalize',
              filter === f ? 'bg-primary text-white' : 'bg-surface-card border border-surface-border text-ink-muted'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <ListSkeleton count={3} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Megaphone size={22} />} title="No alerts" description="There are no active alerts in your area." />
      ) : (
        <div className="space-y-3">
          {filtered.map((a, i) => (
            <div key={a.id} className="relative">
              <AlertCard alert={a} index={i} />
              {canPublish && profile?.role === 'admin' && <DeleteButton id={a.id} />}
            </div>
          ))}
        </div>
      )}

      {canPublish && <CreateAlertModal open={open} onClose={() => setOpen(false)} />}
    </div>
  );
}

function DeleteButton({ id }: { id: string }) {
  const del = useDeleteAlert();
  return (
    <button
      onClick={() => del.mutate(id)}
      className="absolute top-2 right-2 p-1.5 rounded-lg text-ink-subtle hover:bg-emergency-50 hover:text-emergency"
      aria-label="Delete alert"
    >
      <Trash2 size={14} />
    </button>
  );
}

function CreateAlertModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const create = useCreateAlert();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<AlertType>('public_notice');
  const [priority, setPriority] = useState<AlertPriority>('medium');
  const [region, setRegion] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!title.trim() || !message.trim()) return;
    setError(null);
    try {
      await create.mutateAsync({
        title: title.trim(),
        message: message.trim(),
        type,
        priority,
        region: region.trim() || null,
      });
      setTitle('');
      setMessage('');
      setRegion('');
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to publish');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Publish Alert"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={submit} disabled={create.isPending}>
            {create.isPending ? <Loader2 size={16} className="animate-spin" /> : <Megaphone size={16} />}
            Publish
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Alert headline" />
        <Textarea label="Message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Details of the alert…" />
        <div className="grid grid-cols-2 gap-3">
          <Select label="Type" value={type} onChange={(e) => setType(e.target.value as AlertType)}>
            {types.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </Select>
          <Select label="Priority" value={priority} onChange={(e) => setPriority(e.target.value as AlertPriority)}>
            {priorities.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </Select>
        </div>
        <Input label="Region (optional)" value={region} onChange={(e) => setRegion(e.target.value)} placeholder="e.g. Downtown" />
        {error && <p className="text-xs text-emergency">{error}</p>}
      </div>
    </Modal>
  );
}
