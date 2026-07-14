import { useNavigate } from 'react-router-dom';
import { Settings, ShieldCheck, ChevronRight, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { RoleBadge } from '../components/shared/Badges';
import { usePWAInstall } from '../hooks/usePwa';
import { Download } from 'lucide-react';

export function ProfilePage() {
  const { profile, signOut } = useAuthStore();
  const navigate = useNavigate();
  const { canInstall, promptInstall } = usePWAInstall();

  return (
    <div className="page-pad py-4 space-y-5">
      <div className="card p-4 flex items-center gap-3">
        <div className="h-16 w-16 rounded-2xl bg-primary text-white flex items-center justify-center text-xl font-bold">
          {(profile?.full_name || profile?.email || '?')[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-primary truncate">{profile?.full_name || 'User'}</p>
          <p className="text-xs text-ink-muted truncate">{profile?.email}</p>
          <div className="mt-1">{profile && <RoleBadge role={profile.role} />}</div>
        </div>
      </div>

      <div className="card divide-y divide-surface-border overflow-hidden">
        <Row icon={<Settings size={18} />} label="Settings" onClick={() => navigate('/app/settings')} />
        <Row icon={<ShieldCheck size={18} />} label="About TraceNet" onClick={() => navigate('/app/about')} />
        {canInstall && <Row icon={<Download size={18} />} label="Install app" onClick={() => promptInstall()} />}
      </div>

      <button
        onClick={async () => {
          await signOut();
          navigate('/login');
        }}
        className="card p-3.5 w-full flex items-center justify-between hover:bg-emergency-50 transition-colors"
      >
        <span className="flex items-center gap-3 text-sm font-medium text-emergency">
          <LogOut size={18} /> Log out
        </span>
      </button>
    </div>
  );
}

function Row({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center justify-between p-3.5 w-full hover:bg-primary-50">
      <span className="flex items-center gap-3 text-sm font-medium text-ink">
        <span className="text-secondary">{icon}</span> {label}
      </span>
      <ChevronRight size={16} className="text-ink-subtle" />
    </button>
  );
}
