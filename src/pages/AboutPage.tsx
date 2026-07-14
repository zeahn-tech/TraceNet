import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, Share2, Star, Info, ChevronRight, Download } from 'lucide-react';
import { Logo } from '../components/brand/Logo';
import { ShareButton } from '../components/shared/ShareButton';
import { usePWAInstall } from '../hooks/usePwa';
import { useState } from 'react';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';

export function AboutPage() {
  const { canInstall, promptInstall } = usePWAInstall();
  const [rateOpen, setRateOpen] = useState(false);

  return (
    <div className="page-pad py-4 space-y-5">
      <div className="flex flex-col items-center text-center pt-4">
        <Logo size={64} className="mb-3" />
        <h1 className="text-2xl font-bold text-primary">TraceNet</h1>
        <p className="text-sm text-ink-muted mt-1">Together for Safer Communities</p>
        <span className="badge bg-primary-50 text-primary mt-2">Version 1.0.0</span>
      </div>

      <div className="card p-4 text-sm text-ink-muted space-y-3 leading-relaxed">
        <p>
          TraceNet is a community-driven public safety platform connecting citizens and law enforcement.
        </p>
        <p>
          The platform enables users to report sightings, share safety information, submit tips, and support emergency response efforts.
        </p>
        <p>
          Authorities can manage verified cases while communities contribute information that helps improve public safety.
        </p>
      </div>

      <div className="space-y-2">
        <ActionRow icon={<Mail size={18} />} label="Contact Us" onClick={() => window.location.href = 'mailto:tracenet.support@gmail.com'} />
        <ShareButton
          title="TraceNet"
          text="Join me on TraceNet to help find missing persons and improve community safety."
          variant="ghost"
          className="w-full justify-between"
        >
          <span className="flex items-center gap-3 text-sm font-medium text-ink">
            <Share2 size={18} className="text-secondary" /> Share App
          </span>
          <ChevronRight size={16} className="text-ink-subtle" />
        </ShareButton>
        <ActionRow icon={<Star size={18} />} label="Rate Us" onClick={() => setRateOpen(true)} />
        {canInstall && (
          <ActionRow icon={<Download size={18} />} label="Install App" onClick={() => promptInstall()} />
        )}
        <Link to="/app/settings">
          <div className="card p-3.5 flex items-center justify-between hover:shadow-cardHover transition-shadow">
            <span className="flex items-center gap-3 text-sm font-medium text-ink">
              <ShieldCheck size={18} className="text-secondary" /> Privacy & Settings
            </span>
            <ChevronRight size={16} className="text-ink-subtle" />
          </div>
        </Link>
      </div>

      <div className="text-center text-xs text-ink-subtle pt-2">
        <Info size={12} className="inline mr-1" />
        Built for safer communities. Always call local emergency services in a life-threatening situation.
      </div>

      <Modal open={rateOpen} onClose={() => setRateOpen(false)} title="Rate TraceNet">
        <div className="text-center py-6">
          <Star size={48} className="mx-auto text-warning mb-3" />
          <h3 className="text-base font-semibold text-primary">Coming Soon</h3>
          <p className="text-sm text-ink-muted mt-1">App store ratings are on the way. Thanks for your support!</p>
          <Button variant="primary" className="mt-4" onClick={() => setRateOpen(false)}>Got it</Button>
        </div>
      </Modal>
    </div>
  );
}

function ActionRow({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="card p-3.5 w-full flex items-center justify-between hover:shadow-cardHover transition-shadow">
      <span className="flex items-center gap-3 text-sm font-medium text-ink">
        <span className="text-secondary">{icon}</span> {label}
      </span>
      <ChevronRight size={16} className="text-ink-subtle" />
    </button>
  );
}
