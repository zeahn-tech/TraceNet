export const DEFAULT_SHARE_TEXT =
  'Join me on TraceNet to help find missing persons and improve community safety.';

export async function shareTraceText(title: string, text: string, url?: string): Promise<boolean> {
  const data: ShareData = { title, text, ...(url ? { url } : {}) };
  if (navigator.share) {
    try {
      await navigator.share(data);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}
