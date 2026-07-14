import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Input';
import { useCreateComment } from '../../hooks/queries';
import { useAuthStore } from '../../store/auth';

export function SightingForm({
  entityType,
  entityId,
  placeholder = 'Report a sighting or share a tip…',
}: {
  entityType: 'missing_person' | 'wanted_person' | 'report';
  entityId: string;
  placeholder?: string;
}) {
  const [body, setBody] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const create = useCreateComment();
  const session = useAuthStore((s) => s.session);

  const submit = async () => {
    if (!body.trim()) return;
    setError(null);
    try {
      await create.mutateAsync({
        entity_type: entityType,
        entity_id: entityId,
        body: body.trim(),
        is_anonymous: anonymous || !session,
        author_id: anonymous || !session ? null : undefined,
      });
      setBody('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit');
    }
  };

  return (
    <div className="space-y-2">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder}
        rows={3}
      />
      {error && <p className="text-xs text-emergency">{error}</p>}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs text-ink-muted cursor-pointer select-none">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
            className="rounded border-surface-border text-secondary focus:ring-secondary"
          />
          Submit anonymously
        </label>
        <Button size="sm" onClick={submit} disabled={create.isPending || !body.trim()}>
          {create.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          Submit tip
        </Button>
      </div>
    </div>
  );
}
