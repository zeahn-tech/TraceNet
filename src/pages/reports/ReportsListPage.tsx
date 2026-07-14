import { useState } from 'react';
import { Search } from 'lucide-react';
import { useReports } from '../../hooks/queries';
import { ReportCard } from '../../components/shared/Cards';
import { ListSkeleton, EmptyState } from '../../components/ui/Feedback';
import { cn } from '../../lib/utils';

const statusFilters: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'pending_review', label: 'Pending' },
  { value: 'verified', label: 'Verified' },
  { value: 'resolved', label: 'Resolved' },
];

const categoryFilters: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'theft', label: 'Theft' },
  { value: 'violence', label: 'Violence' },
  { value: 'fraud', label: 'Fraud' },
  { value: 'missing_person', label: 'Missing' },
  { value: 'suspicious_activity', label: 'Suspicious' },
  { value: 'other', label: 'Other' },
];

export function ReportsListPage() {
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [q, setQ] = useState('');
  const { data, isLoading } = useReports(status, category);

  const filtered = (data ?? []).filter((r) =>
    r.description.toLowerCase().includes(q.toLowerCase()) ||
    (r.location ?? '').toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="page-pad py-4 space-y-4">
      <h1 className="text-xl font-bold text-primary">Crime Reports</h1>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
        <input
          className="input pl-9"
          placeholder="Search reports…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div>
        <p className="text-[11px] text-ink-subtle font-medium mb-1.5 uppercase tracking-wide">Category</p>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {categoryFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setCategory(f.value)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
                category === f.value ? 'bg-secondary text-white' : 'bg-surface-card border border-surface-border text-ink-muted'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[11px] text-ink-subtle font-medium mb-1.5 uppercase tracking-wide">Status</p>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {statusFilters.map((f) => (
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
      </div>

      {isLoading ? (
        <ListSkeleton count={3} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Search size={22} />} title="No reports found" />
      ) : (
        <div className="space-y-3">
          {filtered.map((r, i) => (
            <ReportCard key={r.id} report={r} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
