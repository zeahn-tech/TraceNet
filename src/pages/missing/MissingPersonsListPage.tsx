import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { useMissingPersons } from '../../hooks/queries';
import { MissingPersonCard } from '../../components/shared/Cards';
import { Button } from '../../components/ui/Button';
import { ListSkeleton, EmptyState } from '../../components/ui/Feedback';
import { cn } from '../../lib/utils';

const filters = [
  { value: 'all', label: 'All' },
  { value: 'missing', label: 'Missing' },
  { value: 'located', label: 'Located' },
  { value: 'closed', label: 'Closed' },
];

export function MissingPersonsListPage() {
  const [status, setStatus] = useState('all');
  const [q, setQ] = useState('');
  const { data, isLoading } = useMissingPersons(status);
  const navigate = useNavigate();

  const filtered = (data ?? []).filter((p) =>
    p.full_name.toLowerCase().includes(q.toLowerCase()) ||
    (p.last_seen_location ?? '').toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="page-pad py-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary">Missing Persons</h1>
        <Button size="sm" onClick={() => navigate('/app/missing/new')}>
          <Plus size={16} /> New case
        </Button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
        <input
          className="input pl-9"
          placeholder="Search by name or location…"
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
        <ListSkeleton count={4} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Search size={22} />}
          title="No cases found"
          description="Try a different filter or search term."
          action={<Button size="sm" onClick={() => navigate('/app/missing/new')}>Create a case</Button>}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((p, i) => (
            <MissingPersonCard key={p.id} person={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
