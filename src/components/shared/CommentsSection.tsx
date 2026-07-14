import { useComments } from '../../hooks/queries';
import { SightingForm } from './SightingForm';
import { formatDate, initials } from '../../lib/utils';
import { ListSkeleton, EmptyState } from '../ui/Feedback';
import { MessageSquare } from 'lucide-react';

export function CommentsSection({
  entityType,
  entityId,
  placeholder,
}: {
  entityType: 'missing_person' | 'wanted_person' | 'report';
  entityId: string;
  placeholder?: string;
}) {
  const { data, isLoading } = useComments(entityType, entityId);

  return (
    <div className="space-y-4">
      <h3 className="section-title flex items-center gap-2">
        <MessageSquare size={16} /> Sightings & Tips
      </h3>
      <SightingForm entityType={entityType} entityId={entityId} placeholder={placeholder} />
      {isLoading ? (
        <ListSkeleton count={2} />
      ) : (data ?? []).length === 0 ? (
        <EmptyState icon={<MessageSquare size={20} />} title="No tips yet" description="Be the first to report a sighting." />
      ) : (
        <div className="space-y-2">
          {(data ?? []).map((c) => (
            <div key={c.id} className="card p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-7 w-7 rounded-full bg-primary-100 text-primary flex items-center justify-center text-[10px] font-semibold">
                  {c.is_anonymous ? 'A' : initials('Anonymous User')}
                </div>
                <span className="text-xs font-semibold text-primary">
                  {c.is_anonymous ? 'Anonymous' : 'Community member'}
                </span>
                <span className="text-[11px] text-ink-subtle">{formatDate(c.created_at)}</span>
              </div>
              <p className="text-sm text-ink">{c.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
