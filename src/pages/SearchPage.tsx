import { useState, useMemo } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { useMissingPersons, useWantedPersons, useReports, useAlerts } from '../hooks/queries';
import { MissingPersonCard, WantedPersonCard, ReportCard, AlertCard } from '../components/shared/Cards';
import { ListSkeleton, EmptyState } from '../components/ui/Feedback';
import { cn } from '../lib/utils';

const tabs = [
  { value: 'all', label: 'All' },
  { value: 'people', label: 'People' },
  { value: 'reports', label: 'Reports' },
  { value: 'alerts', label: 'Alerts' },
];

export function SearchPage() {
  const [q, setQ] = useState('');
  const [tab, setTab] = useState('all');
  const { data: missing } = useMissingPersons();
  const { data: wanted } = useWantedPersons();
  const { data: reports } = useReports();
  const { data: alerts } = useAlerts();

  const results = useMemo(() => {
    const term = q.toLowerCase().trim();
    if (!term) return { missing: [], wanted: [], reports: [], alerts: [] };
    return {
      missing: (missing ?? []).filter(
        (p) => p.full_name.toLowerCase().includes(term) || (p.last_seen_location ?? '').toLowerCase().includes(term)
      ),
      wanted: (wanted ?? []).filter(
        (p) => p.name.toLowerCase().includes(term) || (p.charges ?? '').toLowerCase().includes(term)
      ),
      reports: (reports ?? []).filter(
        (r) => r.description.toLowerCase().includes(term) || (r.location ?? '').toLowerCase().includes(term)
      ),
      alerts: (alerts ?? []).filter(
        (a) => a.title.toLowerCase().includes(term) || a.message.toLowerCase().includes(term)
      ),
    };
  }, [q, missing, wanted, reports, alerts]);

  const loading = !missing && !wanted && !reports && !alerts;
  const total =
    results.missing.length + results.wanted.length + results.reports.length + results.alerts.length;

  return (
    <div className="page-pad py-4 space-y-4">
      <h1 className="text-xl font-bold text-primary">Search</h1>

      <div className="relative">
        <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle" />
        <input
          autoFocus
          className="input pl-9"
          placeholder="Search people, cases, reports, alerts…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
              tab === t.value ? 'bg-primary text-white' : 'bg-surface-card border border-surface-border text-ink-muted'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {!q.trim() ? (
        <EmptyState icon={<SearchIcon size={22} />} title="Start typing" description="Search across people, cases, reports, and alerts." />
      ) : loading ? (
        <ListSkeleton count={3} />
      ) : total === 0 ? (
        <EmptyState icon={<SearchIcon size={22} />} title="No results" description={`No matches for "${q}".`} />
      ) : (
        <div className="space-y-5">
          {(tab === 'all' || tab === 'people') && (
            <>
              {results.missing.length > 0 && (
                <section className="space-y-2">
                  <p className="text-xs font-semibold text-ink-subtle uppercase tracking-wide">Missing Persons</p>
                  {results.missing.map((p, i) => <MissingPersonCard key={p.id} person={p} index={i} />)}
                </section>
              )}
              {results.wanted.length > 0 && (
                <section className="space-y-2">
                  <p className="text-xs font-semibold text-ink-subtle uppercase tracking-wide">Wanted</p>
                  {results.wanted.map((p, i) => <WantedPersonCard key={p.id} person={p} index={i} />)}
                </section>
              )}
            </>
          )}
          {(tab === 'all' || tab === 'reports') && results.reports.length > 0 && (
            <section className="space-y-2">
              <p className="text-xs font-semibold text-ink-subtle uppercase tracking-wide">Reports</p>
              {results.reports.map((r, i) => <ReportCard key={r.id} report={r} index={i} />)}
            </section>
          )}
          {(tab === 'all' || tab === 'alerts') && results.alerts.length > 0 && (
            <section className="space-y-2">
              <p className="text-xs font-semibold text-ink-subtle uppercase tracking-wide">Alerts</p>
              {results.alerts.map((a, i) => <AlertCard key={a.id} alert={a} index={i} />)}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
