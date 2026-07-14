import { useState, type ReactNode } from 'react';
import { Share2, Copy, Check, MessageCircle, Facebook, Send, Twitter, Music2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { shareTraceText } from '../../lib/share';

export function ShareButton({
  title,
  text,
  url,
  variant = 'outline',
  size = 'md',
  className,
  children,
}: {
  title: string;
  text: string;
  url?: string;
  variant?: 'outline' | 'ghost' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const fullUrl = url ?? (typeof window !== 'undefined' ? window.location.href : '');
  const shareText = text;

  const nativeShare = async () => {
    const ok = await shareTraceText(title, shareText, fullUrl);
    if (ok) setOpen(false);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${fullUrl}`.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const targets = [
    { name: 'WhatsApp', icon: MessageCircle, href: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + fullUrl)}`, color: 'text-success-600' },
    { name: 'Facebook', icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}&quote=${encodeURIComponent(shareText)}`, color: 'text-secondary-600' },
    { name: 'Messenger', icon: Send, href: `https://www.facebook.com/dialog/send?app_id=0&link=${encodeURIComponent(fullUrl)}&redirect_uri=${encodeURIComponent(fullUrl)}`, color: 'text-secondary-500' },
    { name: 'X', icon: Twitter, href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(fullUrl)}`, color: 'text-primary' },
    { name: 'TikTok', icon: Music2, href: `https://www.tiktok.com/upload?url=${encodeURIComponent(fullUrl)}`, color: 'text-primary' },
  ];

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setOpen(true)}
      >
        {children ?? (<><Share2 size={16} /> Share</>)}
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Share">
        <div className="space-y-4">
          <p className="text-sm text-ink-muted">{shareText}</p>
          <div className="grid grid-cols-3 gap-3">
            {targets.map((t) => (
              <a
                key={t.name}
                href={t.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-surface-border hover:bg-primary-50 transition-colors"
              >
                <t.icon size={22} className={t.color} />
                <span className="text-xs font-medium text-ink">{t.name}</span>
              </a>
            ))}
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="primary" className="flex-1" onClick={nativeShare}>
              <Share2 size={16} /> More options
            </Button>
            <Button variant="outline" onClick={copy}>
              {copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
