import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Building2, DollarSign, FileText, AlertTriangle } from 'lucide-react';
import { useWantedPerson } from '../../hooks/queries';
import { WantedStatusBadge } from '../../components/shared/Badges';
import { Skeleton, ErrorState } from '../../components/ui/Feedback';
import { CommentsSection } from '../../components/shared/CommentsSection';
import { ShareButton } from '../../components/shared/ShareButton';
import { initials } from '../../lib/utils';

export function WantedPersonDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: person, isLoading, error, refetch } = useWantedPerson(id);

  if (isLoading) {
    return (
      <div className="page-pad py-4 space-y-3">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }
  if (error || !person) {
    return (
      <div className="page-pad py-4">
        <ErrorState message="Could not load this notice." onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="pb-6">
      <div className="relative h-64 bg-primary-100">
        {person.photo_url ? (
          <img src={person.photo_url} alt={person.name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-primary-300 text-5xl font-bold">
            {initials(person.name)}
          </div>
        )}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 h-9 w-9 rounded-full bg-primary-900/60 text-white flex items-center justify-center hover:bg-primary-900"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="absolute top-4 right-4">
          <WantedStatusBadge status={person.status} />
        </div>
        <div className="absolute bottom-4 left-4 bg-emergency text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
          <AlertTriangle size={12} /> WANTED
        </div>
      </div>

      <div className="page-pad py-4 space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-primary">{person.name}</h1>
          {person.reward ? (
            <p className="text-sm text-success-700 font-semibold mt-1 flex items-center gap-1">
              <DollarSign size={14} /> Reward up to ${Number(person.reward).toLocaleString()}
            </p>
          ) : null}
        </div>

        <ShareButton
          title={`Wanted: ${person.name}`}
          text={`Wanted: ${person.name}. ${person.charges ?? ''}. Contact ${person.agency ?? 'authorities'}.`}
        />

        <DetailRow icon={<FileText size={16} />} label="Charges" value={person.charges} />
        <DetailRow icon={<FileText size={16} />} label="Description" value={person.description} />
        <DetailRow icon={<MapPin size={16} />} label="Last known location" value={person.last_known_location} />
        <DetailRow icon={<Building2 size={16} />} label="Agency" value={person.agency} />

        <div className="card p-3 bg-emergency-50 border-emergency-200">
          <p className="text-xs text-emergency-800">
            <strong>Do not approach.</strong> If you have information, submit an anonymous tip below or contact the listed agency.
          </p>
        </div>

        <CommentsSection
          entityType="wanted_person"
          entityId={person.id}
          placeholder="Submit an anonymous tip…"
        />
      </div>
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
