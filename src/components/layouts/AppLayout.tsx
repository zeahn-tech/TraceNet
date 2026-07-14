import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Home, Search, Plus, Bell, User } from 'lucide-react';
import { Logo } from '../brand/Logo';
import { useAuthStore } from '../../store/auth';
import { useNotifications } from '../../hooks/queries';
import { cn } from '../../lib/utils';

const navItems = [
  { to: '/app', icon: Home, label: 'Home', end: true },
  { to: '/app/search', icon: Search, label: 'Search', end: false },
  { to: '/app/report', icon: Plus, label: 'Report', end: false, center: true },
  { to: '/app/notifications', icon: Bell, label: 'Alerts', end: false },
  { to: '/app/profile', icon: User, label: 'Profile', end: false },
];

export function AppLayout() {
  const profile = useAuthStore((s) => s.profile);
  const session = useAuthStore((s) => s.session);
  const { data: notifs } = useNotifications(session?.user.id);
  const unread = notifs?.filter((n) => !n.read).length ?? 0;
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface flex flex-col max-w-md mx-auto">
      <header className="sticky top-0 z-30 bg-primary text-white px-4 py-3 flex items-center justify-between safe-bottom">
        <button onClick={() => navigate('/app')} className="flex items-center gap-2">
          <Logo size={28} />
          <div className="leading-tight text-left">
            <p className="text-sm font-bold">TraceNet</p>
            <p className="text-[10px] text-white/70">Together for Safer Communities</p>
          </div>
        </button>
        {profile && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/80 hidden xs:inline">{profile.full_name || profile.email}</span>
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold">
                {(profile.full_name || profile.email || '?')[0]?.toUpperCase()}
              </div>
            )}
          </div>
        )}
      </header>

      <main className="flex-1 pb-20">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-surface-card border-t border-surface-border shadow-nav z-40 safe-bottom">
        <div className="flex items-stretch justify-around px-2 py-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-colors flex-1',
                  item.center && 'relative',
                  isActive ? 'text-secondary' : 'text-ink-muted'
                )
              }
            >
              {item.center ? (
                <span className="absolute -top-5 h-11 w-11 rounded-full bg-secondary text-white flex items-center justify-center shadow-cardHover">
                  <item.icon size={22} />
                </span>
              ) : (
                <span className="relative">
                  <item.icon size={22} />
                  {item.label === 'Alerts' && unread > 0 && (
                    <span className="absolute -top-1 -right-2 h-4 min-w-4 px-1 rounded-full bg-emergency text-white text-[9px] font-bold flex items-center justify-center">
                      {unread}
                    </span>
                  )}
                </span>
              )}
              <span className={item.center ? 'mt-6' : ''}>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
