import { useState } from 'react';
import { Search } from 'lucide-react';
import { useWantedPersons } from '../../hooks/queries';
import { WantedPersonCard } from '../../components/shared/Cards';
import { ListSkeleton, EmptyState } from '../../components/ui/Feedback';
import { cn } from '../../lib/utils';

const filters = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'captured', label: 'Captured' },
  { value: 'closed', label: 'Closed' },
];

export function WantedPersonsListPage() {
  const [status, setStatus] = useState('all');
  const [q, setQ] = useState('');
  const { data, isLoading } = useWantedPersons(status);

  const filtered = (data ?? []).filter((p) =>
    p.name.toLowerCase().includes(q.toLowerCase()) ||
    (p.charges ?? '').toLowerCase().includes(q.toLowerCase()) ||
    (p.agency ?? '').toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="page-pad py-4 space-y-4">
      <h1 className="text-xl font-bold text-primary">Wanted Individuals</h1>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
        <input
          className="input pl-9"
          placeholder="Search by name, charges, agency…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatus(f.value)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
              status === f.value ? 'bg-primary text-white' : 'bg-surface-card border border-surface-border text-ink-muted'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <ListSkeleton count={3} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Search size={22} />} title="No wanted notices found" />
      ) : (
        <div className="space-y-3">
          {filtered.map((p, i) => (
            <WantedPersonCard key={p.id} person={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
