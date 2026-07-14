import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, FileWarning, UserX, Target, Megaphone, ShieldCheck, ScrollText,
  Check, X, ChevronRight, BarChart3,
} from 'lucide-react';
import { useUsers, useUpdateUser, useReports, useUpdateReport, useAlerts, useAuditLogs } from '../../hooks/queries';
import { useMissingPersons, useWantedPersons } from '../../hooks/queries';
import { useAuthStore } from '../../store/auth';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { RoleBadge, ReportStatusBadge } from '../../components/shared/Badges';
import { Badge } from '../../components/ui/Badge';
import { ListSkeleton, EmptyState } from '../../components/ui/Feedback';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Input';
import { formatDate, initials, formatRelative, truncate } from '../../lib/utils';
import type { UserRole } from '../../types';

type Tab = 'overview' | 'users' | 'reports' | 'missing' | 'wanted' | 'alerts' | 'audit';

export function AdminPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const profile = useAuthStore((s) => s.profile);

  if (profile && profile.role !== 'admin') {
    return (
      <div className="page-pad py-10">
        <EmptyState
          icon={<ShieldCheck size={22} />}
          title="Access denied"
          description="You need administrator privileges to view this page."
        />
      </div>
    );
  }

  const tabs: { value: Tab; label: string; icon: typeof Users }[] = [
    { value: 'overview', label: 'Overview', icon: BarChart3 },
    { value: 'users', label: 'Users', icon: Users },
    { value: 'reports', label: 'Reports', icon: FileWarning },
    { value: 'missing', label: 'Missing', icon: UserX },
    { value: 'wanted', label: 'Wanted', icon: Target },
    { value: 'alerts', label: 'Alerts', icon: Megaphone },
    { value: 'audit', label: 'Audit', icon: ScrollText },
  ];

  return (
    <div className="page-pad py-4 space-y-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="text-primary" size={22} />
        <h1 className="text-xl font-bold text-primary">Admin Dashboard</h1>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              tab === t.value ? 'bg-primary text-white' : 'bg-surface-card border border-surface-border text-ink-muted'
            }`}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <Overview />}
      {tab === 'users' && <UsersTab />}
      {tab === 'reports' && <ReportsTab />}
      {tab === 'missing' && <MissingTab />}
      {tab === 'wanted' && <WantedTab />}
      {tab === 'alerts' && <AlertsTab />}
      {tab === 'audit' && <AuditTab />}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, tone }: { label: string; value: number; icon: typeof Users; tone: string }) {
  return (
    <Card className="flex items-center gap-3">
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${tone}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold text-primary leading-none">{value}</p>
        <p className="text-xs text-ink-muted mt-0.5">{label}</p>
      </div>
    </Card>
  );
}

function Overview() {
  const { data: missing } = useMissingPersons();
  const { data: wanted } = useWantedPersons();
  const { data: reports } = useReports();
  const { data: alerts } = useAlerts();
  const { data: users } = useUsers();

  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard label="Missing cases" value={missing?.length ?? 0} icon={UserX} tone="bg-emergency-50 text-emergency" />
      <StatCard label="Wanted" value={wanted?.length ?? 0} icon={Target} tone="bg-warning-50 text-warning-700" />
      <StatCard label="Reports" value={reports?.length ?? 0} icon={FileWarning} tone="bg-secondary-50 text-secondary-700" />
      <StatCard label="Alerts" value={alerts?.length ?? 0} icon={Megaphone} tone="bg-primary-50 text-primary" />
      <StatCard label="Users" value={users?.length ?? 0} icon={Users} tone="bg-success-50 text-success-700" />
      <StatCard label="Pending review" value={reports?.filter((r) => r.status === 'pending_review').length ?? 0} icon={BarChart3} tone="bg-surface-border text-ink-muted" />
    </div>
  );
}

function UsersTab() {
  const { data: users, isLoading } = useUsers();
  const update = useUpdateUser();
  const [editing, setEditing] = useState<{ id: string; role: string } | null>(null);

  if (isLoading) return <ListSkeleton count={3} />;

  return (
    <div className="space-y-2">
      {(users ?? []).map((u) => (
        <Card key={u.id} className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
            {initials(u.full_name || u.email)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-primary truncate">{u.full_name || 'Unnamed'}</p>
            <p className="text-xs text-ink-muted truncate">{u.email}</p>
          </div>
          <button onClick={() => setEditing({ id: u.id, role: u.role })} className="shrink-0">
            <RoleBadge role={u.role as UserRole} />
          </button>
        </Card>
      ))}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Change role"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={async () => {
                if (editing) await update.mutateAsync({ id: editing.id, patch: { role: editing.role } });
                setEditing(null);
              }}
            >
              Save
            </Button>
          </>
        }
      >
        {editing && (
          <Select
            label="Role"
            value={editing.role}
            onChange={(e) => setEditing({ ...editing, role: e.target.value })}
          >
            <option value="citizen">Citizen</option>
            <option value="law_enforcement">Law Enforcement</option>
            <option value="admin">Administrator</option>
          </Select>
        )}
      </Modal>
    </div>
  );
}

function ReportsTab() {
  const { data: reports, isLoading } = useReports();
  const update = useUpdateReport();

  if (isLoading) return <ListSkeleton count={3} />;

  return (
    <div className="space-y-2">
      {(reports ?? []).map((r) => (
        <Card key={r.id} className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Badge tone="secondary">{r.category.replace(/_/g, ' ')}</Badge>
            <ReportStatusBadge status={r.status} />
          </div>
          <p className="text-sm text-ink line-clamp-2">{truncate(r.description, 100)}</p>
          <div className="flex gap-2 pt-1">
            <Button size="sm" variant="outline" onClick={() => update.mutate({ id: r.id, patch: { status: 'verified' } })}>
              <Check size={14} /> Approve
            </Button>
            <Button size="sm" variant="ghost" onClick={() => update.mutate({ id: r.id, patch: { status: 'rejected' } })}>
              <X size={14} /> Reject
            </Button>
            <Link to={`/app/reports/${r.id}`} className="ml-auto">
              <Button size="sm" variant="ghost"><ChevronRight size={14} /></Button>
            </Link>
          </div>
        </Card>
      ))}
    </div>
  );
}

function MissingTab() {
  const { data, isLoading } = useMissingPersons();
  if (isLoading) return <ListSkeleton count={3} />;
  return (
    <div className="space-y-2">
      {(data ?? []).map((p) => (
        <Link key={p.id} to={`/app/missing/${p.id}`}>
          <Card className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg overflow-hidden bg-surface-border shrink-0">
              {p.photo_url && <img src={p.photo_url} alt="" className="h-full w-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-primary truncate">{p.full_name}</p>
              <p className="text-xs text-ink-muted">{p.last_seen_location ?? 'Unknown location'}</p>
            </div>
            <Badge tone={p.status === 'missing' ? 'emergency' : p.status === 'located' ? 'success' : 'neutral'}>
              {p.status}
            </Badge>
          </Card>
        </Link>
      ))}
    </div>
  );
}

function WantedTab() {
  const { data, isLoading } = useWantedPersons();
  if (isLoading) return <ListSkeleton count={3} />;
  return (
    <div className="space-y-2">
      {(data ?? []).map((p) => (
        <Link key={p.id} to={`/app/wanted/${p.id}`}>
          <Card className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg overflow-hidden bg-surface-border shrink-0">
              {p.photo_url && <img src={p.photo_url} alt="" className="h-full w-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-primary truncate">{p.name}</p>
              <p className="text-xs text-ink-muted truncate">{p.charges}</p>
            </div>
            <Badge tone={p.status === 'active' ? 'emergency' : p.status === 'captured' ? 'success' : 'neutral'}>
              {p.status}
            </Badge>
          </Card>
        </Link>
      ))}
    </div>
  );
}

function AlertsTab() {
  const { data: alerts, isLoading } = useAlerts();
  if (isLoading) return <ListSkeleton count={2} />;
  return (
    <div className="space-y-2">
      <Link to="/app/alerts"><Button variant="outline" size="sm" className="mb-2"><Megaphone size={14} /> Manage alerts</Button></Link>
      {(alerts ?? []).map((a) => (
        <Card key={a.id} className="space-y-1">
          <div className="flex items-center justify-between">
            <Badge tone={a.priority === 'critical' ? 'emergency' : a.priority === 'high' ? 'warning' : 'neutral'}>
              {a.priority}
            </Badge>
            <span className="text-[11px] text-ink-subtle">{formatRelative(a.created_at)}</span>
          </div>
          <p className="text-sm font-semibold text-primary">{a.title}</p>
          <p className="text-xs text-ink-muted line-clamp-2">{a.message}</p>
        </Card>
      ))}
    </div>
  );
}

function AuditTab() {
  const { data, isLoading } = useAuditLogs();
  if (isLoading) return <ListSkeleton count={3} />;
  if ((data ?? []).length === 0) {
    return <EmptyState icon={<ScrollText size={22} />} title="No audit logs" description="Actions will appear here." />;
  }
  return (
    <div className="space-y-2">
      {(data ?? []).map((l) => (
        <Card key={l.id} className="space-y-1">
          <div className="flex items-center justify-between">
            <Badge tone="primary">{l.action}</Badge>
            <span className="text-[11px] text-ink-subtle">{formatDate(l.created_at)}</span>
          </div>
          <p className="text-xs text-ink-muted">
            {l.entity_type} {l.entity_id ? `· ${l.entity_id.slice(0, 8)}` : ''}
          </p>
        </Card>
      ))}
    </div>
  );
}
