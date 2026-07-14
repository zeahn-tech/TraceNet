import { useEffect } from 'react';
import { useUIStore } from '../store/ui';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWAInstall() {
  const setInstallPromptEvent = useUIStore((s) => s.setInstallPromptEvent);
  const installEvent = useUIStore((s) => s.installPromptEvent);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPromptEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [setInstallPromptEvent]);

  const promptInstall = async (): Promise<boolean> => {
    if (!installEvent) return false;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    setInstallPromptEvent(null);
    return choice.outcome === 'accepted';
  };

  return { canInstall: !!installEvent, promptInstall };
}

export async function shareTraceNet(title: string, text: string, url?: string): Promise<boolean> {
  const shareData: ShareData = {
    title,
    text,
    ...(url ? { url } : {}),
  };
  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return true;
    } catch {
      return false;
    }
  }
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(`${text}${url ? ' ' + url : ''}`);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

export const DEFAULT_SHARE_TEXT =
  'Join me on TraceNet to help find missing persons and improve community safety.';
