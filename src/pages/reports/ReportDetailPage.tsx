import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Tag, ImageOff } from 'lucide-react';
import { useReport, useUpdateReport } from '../../hooks/queries';
import { ReportStatusBadge, CategoryBadge } from '../../components/shared/Badges';
import { Skeleton, ErrorState } from '../../components/ui/Feedback';
import { CommentsSection } from '../../components/shared/CommentsSection';
import { ShareButton } from '../../components/shared/ShareButton';
import { formatDate } from '../../lib/utils';
import { useAuthStore } from '../../store/auth';
import { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';

const statuses = ['submitted', 'pending_review', 'verified', 'resolved', 'rejected'] as const;

export function ReportDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: report, isLoading, error, refetch } = useReport(id);
  const profile = useAuthStore((s) => s.profile);
  const update = useUpdateReport();
  const [statusOpen, setStatusOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="page-pad py-4 space-y-3">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }
  if (error || !report) {
    return (
      <div className="page-pad py-4">
        <ErrorState message="Could not load this report." onRetry={() => refetch()} />
      </div>
    );
  }

  const canManage =
    profile &&
    (profile.id === report.created_by || profile.role === 'law_enforcement' || profile.role === 'admin');

  const changeStatus = async (status: string) => {
    await update.mutateAsync({ id: report.id, patch: { status } });
    setStatusOpen(false);
  };

  return (
    <div className="pb-6">
      <div className="bg-primary px-4 py-3 flex items-center gap-3 safe-bottom">
        <button
          onClick={() => navigate(-1)}
          className="h-9 w-9 rounded-full bg-white/15 text-white flex items-center justify-center hover:bg-white/25"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <p className="text-xs text-white/70">Crime Report</p>
          <p className="text-sm font-semibold text-white">{report.location ?? 'Location unknown'}</p>
        </div>
        <ReportStatusBadge status={report.status} />
      </div>

      <div className="page-pad py-4 space-y-5">
        <div className="flex items-center gap-2">
          <CategoryBadge category={report.category} />
          {report.is_anonymous && (
            <span className="badge bg-primary-50 text-primary">Anonymous</span>
          )}
        </div>

        {report.photo_url ? (
          <img src={report.photo_url} alt="evidence" className="w-full rounded-2xl object-cover max-h-72" />
        ) : (
          <div className="card p-6 flex flex-col items-center text-ink-subtle">
            <ImageOff size={28} />
            <p className="text-xs mt-1">No photo attached</p>
          </div>
        )}

        <div>
          <p className="text-sm text-ink">{report.description}</p>
        </div>

        <ShareButton
          title="TraceNet report"
          text={`Safety report: ${report.description.slice(0, 100)}`}
        />

        <DetailRow icon={<MapPin size={16} />} label="Location" value={report.location} />
        <DetailRow icon={<Calendar size={16} />} label="Date" value={formatDate(report.report_date)} />
        <DetailRow icon={<Tag size={16} />} label="Category" value={report.category.replace(/_/g, ' ')} />

        {canManage && (
          <Button variant="outline" className="w-full" onClick={() => setStatusOpen(true)}>
            Update status
          </Button>
        )}

        <CommentsSection
          entityType="report"
          entityId={report.id}
          placeholder="Add context or follow-up…"
        />
      </div>

      <Modal open={statusOpen} onClose={() => setStatusOpen(false)} title="Update report status">
        <div className="space-y-2">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => changeStatus(s)}
              className="w-full text-left p-3 rounded-xl border border-surface-border hover:bg-primary-50 font-medium text-primary capitalize"
            >
              {s.replace(/_/g, ' ')}
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
        <p className="text-sm text-ink mt-0.5 capitalize">{value}</p>
      </div>
    </div>
  );
}
