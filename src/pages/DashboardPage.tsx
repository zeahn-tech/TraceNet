import { Link } from 'react-router-dom';
import { Search, Plus, AlertTriangle, UserPlus, ShieldCheck, Megaphone } from 'lucide-react';
import { useMissingPersons, useWantedPersons, useReports, useAlerts } from '../hooks/queries';
import { EmergencyBanner } from '../components/shared/EmergencyBanner';
import {
  SectionHeader,
  MissingPersonCard,
  WantedPersonCard,
  ReportCard,
  AlertCard,
} from '../components/shared/Cards';
import { ListSkeleton, EmptyState } from '../components/ui/Feedback';
import { useAuthStore } from '../store/auth';
import { RoleBadge } from '../components/shared/Badges';

export function DashboardPage() {
  const { data: missing, isLoading: ml } = useMissingPersons('missing');
  const { data: wanted, isLoading: wl } = useWantedPersons('active');
  const { data: reports, isLoading: rl } = useReports('verified');
  const { data: alerts, isLoading: al } = useAlerts();
  const profile = useAuthStore((s) => s.profile);

  return (
    <div className="page-pad py-4 space-y-6">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-ink-muted">Welcome back</p>
          <h1 className="text-xl font-bold text-primary">{profile?.full_name || 'Citizen'}</h1>
        </div>
        {profile && <RoleBadge role={profile.role} />}
      </div>

      {/* Emergency banner */}
      {al ? <EmergencyBanner alerts={alerts ?? []} /> : null}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <QuickAction to="/app/report" icon={Plus} label="Report" tone="secondary" />
        <QuickAction to="/app/search" icon={Search} label="Search" tone="primary" />
        <QuickAction to="/app/missing" icon={UserPlus} label="Missing" tone="primary" />
        <QuickAction to="/app/alerts" icon={Megaphone} label="Alerts" tone="secondary" />
      </div>

      {/* Recent alerts */}
      <section>
        <SectionHeader title="Recent Alerts" to="/app/alerts" count={alerts?.length} />
        {al ? (
          <ListSkeleton count={2} />
        ) : (alerts ?? []).length === 0 ? (
          <EmptyState icon={<ShieldCheck size={22} />} title="No active alerts" description="Your area has no current alerts." />
        ) : (
          <div className="space-y-3">
            {(alerts ?? []).slice(0, 3).map((a, i) => (
              <AlertCard key={a.id} alert={a} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Missing persons */}
      <section>
        <SectionHeader title="Missing Persons" to="/app/missing" count={missing?.length} />
        {ml ? (
          <ListSkeleton count={3} />
        ) : (missing ?? []).length === 0 ? (
          <EmptyState icon={<AlertTriangle size={22} />} title="No active missing cases" />
        ) : (
          <div className="space-y-3">
            {(missing ?? []).slice(0, 4).map((p, i) => (
              <MissingPersonCard key={p.id} person={p} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Wanted */}
      <section>
        <SectionHeader title="Wanted Individuals" to="/app/wanted" count={wanted?.length} />
        {wl ? (
          <ListSkeleton count={2} />
        ) : (wanted ?? []).length === 0 ? (
          <EmptyState icon={<ShieldCheck size={22} />} title="No active wanted notices" />
        ) : (
          <div className="space-y-3">
            {(wanted ?? []).slice(0, 3).map((p, i) => (
              <WantedPersonCard key={p.id} person={p} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Nearby reports */}
      <section>
        <SectionHeader title="Nearby Reports" to="/app/reports" count={reports?.length} />
        {rl ? (
          <ListSkeleton count={2} />
        ) : (reports ?? []).length === 0 ? (
          <EmptyState icon={<ShieldCheck size={22} />} title="No verified reports nearby" />
        ) : (
          <div className="space-y-3">
            {(reports ?? []).slice(0, 3).map((r, i) => (
              <ReportCard key={r.id} report={r} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function QuickAction({
  to,
  icon: Icon,
  label,
  tone,
}: {
  to: string;
  icon: typeof Plus;
  label: string;
  tone: 'primary' | 'secondary';
}) {
  return (
    <Link
      to={to}
      className={`card p-4 flex items-center gap-3 hover:shadow-cardHover transition-shadow ${
        tone === 'secondary' ? 'bg-secondary-50 border-secondary-100' : ''
      }`}
    >
      <div
        className={`h-10 w-10 rounded-xl flex items-center justify-center ${
          tone === 'secondary' ? 'bg-secondary text-white' : 'bg-primary text-white'
        }`}
      >
        <Icon size={20} />
      </div>
      <span className="text-sm font-semibold text-primary">{label}</span>
    </Link>
  );
}
