import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Phone, User, Edit } from 'lucide-react';
import { useMissingPerson, useUpdateMissing } from '../../hooks/queries';
import { StatusBadge } from '../../components/shared/Badges';
import { Button } from '../../components/ui/Button';
import { Skeleton, ErrorState } from '../../components/ui/Feedback';
import { CommentsSection } from '../../components/shared/CommentsSection';
import { ShareButton } from '../../components/shared/ShareButton';
import { formatDate, initials } from '../../lib/utils';
import { useAuthStore } from '../../store/auth';
import { useState } from 'react';
import { Modal } from '../../components/ui/Modal';

export function MissingPersonDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: person, isLoading, error, refetch } = useMissingPerson(id);
  const profile = useAuthStore((s) => s.profile);
  const update = useUpdateMissing();
  const [statusOpen, setStatusOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="page-pad py-4 space-y-3">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }
  if (error || !person) {
    return (
      <div className="page-pad py-4">
        <ErrorState message="Could not load this case." onRetry={() => refetch()} />
      </div>
    );
  }

  const canManage =
    profile &&
    (profile.id === person.created_by || profile.role === 'law_enforcement' || profile.role === 'admin');

  const changeStatus = async (status: string) => {
    await update.mutateAsync({ id: person.id, patch: { status } });
    setStatusOpen(false);
  };

  return (
    <div className="pb-6">
      <div className="relative h-64 bg-primary-100">
        {person.photo_url ? (
          <img src={person.photo_url} alt={person.full_name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-primary-300 text-5xl font-bold">
            {initials(person.full_name)}
          </div>
        )}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 h-9 w-9 rounded-full bg-primary-900/60 text-white flex items-center justify-center hover:bg-primary-900"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="absolute top-4 right-4">
          <StatusBadge status={person.status} />
        </div>
      </div>

      <div className="page-pad py-4 space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-primary">{person.full_name}</h1>
          <p className="text-sm text-ink-muted mt-1">
            {person.age ? `${person.age} years old · ` : ''}
            {person.gender ?? 'Unknown gender'}
          </p>
        </div>

        <div className="flex gap-2">
          <ShareButton
            title={`Missing: ${person.full_name}`}
            text={`Help find ${person.full_name}. ${person.physical_description ?? ''}`}
          />
          {canManage && (
            <>
              <Button variant="outline" size="md" onClick={() => navigate(`/app/missing/${person.id}/edit`)}>
                <Edit size={16} /> Edit
              </Button>
              <Button variant="ghost" size="md" onClick={() => setStatusOpen(true)}>
                Status
              </Button>
            </>
          )}
        </div>

        <DetailRow icon={<User size={16} />} label="Description" value={person.physical_description} />
        <DetailRow
          icon={<MapPin size={16} />}
          label="Last seen"
          value={person.last_seen_location}
        />
        <DetailRow
          icon={<Calendar size={16} />}
          label="Date"
          value={formatDate(person.last_seen_date)}
        />
        <DetailRow
          icon={<Phone size={16} />}
          label="Contact"
          value={person.contact_information}
        />

        {person.latitude && person.longitude && (
          <div className="card p-0 overflow-hidden">
            <iframe
              title="map"
              className="w-full h-48 border-0"
              loading="lazy"
              src={`https://www.openstreetmap.org/export/embed.html?marker=${person.latitude},${person.longitude}`}
            />
          </div>
        )}

        <CommentsSection
          entityType="missing_person"
          entityId={person.id}
          placeholder="Report a sighting of this person…"
        />
      </div>

      <Modal open={statusOpen} onClose={() => setStatusOpen(false)} title="Update status">
        <div className="space-y-2">
          {['missing', 'located', 'closed'].map((s) => (
            <button
              key={s}
              onClick={() => changeStatus(s)}
              className="w-full text-left p-3 rounded-xl border border-surface-border hover:bg-primary-50 capitalize font-medium text-primary"
            >
              {s}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div className="card p-3 flex gap-3">
      <div className="h-8 w-8 rounded-lg bg-primary-50 text-primary flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[11px] text-ink-subtle uppercase tracking-wide font-medium">{label}</p>
        <p className="text-sm text-ink mt-0.5">{value}</p>
      </div>
    </div>
  );
}
