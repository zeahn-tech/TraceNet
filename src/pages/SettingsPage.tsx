import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Bell, Globe, LogOut, ChevronRight, Shield, HelpCircle, Info, Download } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { RoleBadge } from '../components/shared/Badges';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { usePWAInstall } from '../hooks/usePwa';
import { userService } from '../services';

export function SettingsPage() {
  const { profile, signOut, refreshProfile } = useAuthStore();
  const navigate = useNavigate();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [agency, setAgency] = useState(profile?.agency ?? '');
  const [saving, setSaving] = useState(false);
  const { canInstall, promptInstall } = usePWAInstall();

  const [notifPush, setNotifPush] = useState(true);
  const [notifEmergency, setNotifEmergency] = useState(true);
  const [language, setLanguage] = useState('en');

  const doLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const saveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await userService.update(profile.id, { full_name: fullName, phone, agency });
      await refreshProfile();
      setEditOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-pad py-4 space-y-5">
      <h1 className="text-xl font-bold text-primary">Settings</h1>

      {/* Profile */}
      <section className="card p-4">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold">
            {(profile?.full_name || profile?.email || '?')[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-primary truncate">{profile?.full_name || 'User'}</p>
            <p className="text-xs text-ink-muted truncate">{profile?.email}</p>
            <div className="mt-1">{profile && <RoleBadge role={profile.role} />}</div>
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full mt-3" onClick={() => setEditOpen(true)}>
          Edit profile
        </Button>
      </section>

      {/* Settings groups */}
      <SettingsGroup title="Account">
        <ToggleRow icon={<Bell size={18} />} label="Push notifications" value={notifPush} onChange={setNotifPush} />
        <ToggleRow icon={<Shield size={18} />} label="Emergency alerts" value={notifEmergency} onChange={setNotifEmergency} />
        <SelectRow
          icon={<Globe size={18} />}
          label="Language"
          value={language}
          onChange={setLanguage}
          options={[
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Español' },
            { value: 'fr', label: 'Français' },
          ]}
        />
      </SettingsGroup>

      <SettingsGroup title="Privacy & Security">
        <LinkRow icon={<Lock size={18} />} label="Privacy policy" to="/app/about" />
        <LinkRow icon={<HelpCircle size={18} />} label="Help & support" to="/app/about" />
      </SettingsGroup>

      <SettingsGroup title="App">
        <LinkRow icon={<Info size={18} />} label="About TraceNet" to="/app/about" />
        {canInstall && <ActionRow icon={<Download size={18} />} label="Install app" onClick={() => promptInstall()} />}
      </SettingsGroup>

      <Button variant="emergency" size="lg" className="w-full" onClick={() => setLogoutOpen(true)}>
        <LogOut size={18} /> Log out
      </Button>

      {/* Edit profile modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit profile"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={saveProfile} disabled={saving}>Save</Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          {profile?.role === 'law_enforcement' && (
            <Input label="Agency" value={agency} onChange={(e) => setAgency(e.target.value)} />
          )}
        </div>
      </Modal>

      {/* Logout confirm */}
      <Modal open={logoutOpen} onClose={() => setLogoutOpen(false)} title="Log out?">
        <p className="text-sm text-ink-muted">You'll need to sign in again to access your dashboard.</p>
        <div className="flex gap-2 mt-4">
          <Button variant="ghost" className="flex-1" onClick={() => setLogoutOpen(false)}>Cancel</Button>
          <Button variant="emergency" className="flex-1" onClick={doLogout}>Log out</Button>
        </div>
      </Modal>
    </div>
  );
}

function SettingsGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="text-[11px] font-semibold text-ink-subtle uppercase tracking-wide mb-1.5 px-1">{title}</p>
      <div className="card divide-y divide-surface-border overflow-hidden">{children}</div>
    </section>
  );
}

function ToggleRow({
  icon,
  label,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-3.5">
      <span className="flex items-center gap-3 text-sm font-medium text-ink">
        <span className="text-secondary">{icon}</span> {label}
      </span>
      <button
        onClick={() => onChange(!value)}
        className={`relative h-6 w-11 rounded-full transition-colors ${value ? 'bg-secondary' : 'bg-surface-border'}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`}
        />
      </button>
    </div>
  );
}

function SelectRow({
  icon,
  label,
  value,
  onChange,
  options,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex items-center justify-between p-3.5">
      <span className="flex items-center gap-3 text-sm font-medium text-ink">
        <span className="text-secondary">{icon}</span> {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm font-medium text-ink bg-transparent border-none focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function LinkRow({ icon, label, to }: { icon: React.ReactNode; label: string; to: string }) {
  return (
    <a href={to} className="flex items-center justify-between p-3.5 hover:bg-primary-50">
      <span className="flex items-center gap-3 text-sm font-medium text-ink">
        <span className="text-secondary">{icon}</span> {label}
      </span>
      <ChevronRight size={16} className="text-ink-subtle" />
    </a>
  );
}

function ActionRow({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center justify-between p-3.5 w-full hover:bg-primary-50">
      <span className="flex items-center gap-3 text-sm font-medium text-ink">
        <span className="text-secondary">{icon}</span> {label}
      </span>
      <ChevronRight size={16} className="text-ink-subtle" />
    </button>
  );
}
