import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Clock, ChevronRight } from 'lucide-react';
import type { MissingPerson, WantedPerson, CrimeReport, Alert } from '../../types';
import { StatusBadge, WantedStatusBadge, ReportStatusBadge, CategoryBadge, PriorityBadge } from '../../components/shared/Badges';
import { formatDate, formatRelative, truncate, initials } from '../../lib/utils';

export function SectionHeader({
  title,
  to,
  count,
}: {
  title: string;
  to?: string;
  count?: number;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <h2 className="section-title">{title}</h2>
        {count !== undefined && (
          <span className="text-xs text-ink-subtle font-medium">({count})</span>
        )}
      </div>
      {to && (
        <Link to={to} className="text-xs font-semibold text-secondary flex items-center gap-0.5 hover:underline">
          See all <ChevronRight size={14} />
        </Link>
      )}
    </div>
  );
}

export function MissingPersonCard({ person, index = 0 }: { person: MissingPerson; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.3) }}
    >
      <Link to={`/app/missing/${person.id}`} className="block">
        <div className="card p-3 flex gap-3 hover:shadow-cardHover transition-shadow">
          <div className="h-20 w-16 rounded-xl overflow-hidden bg-surface-border shrink-0">
            {person.photo_url ? (
              <img src={person.photo_url} alt={person.full_name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-ink-subtle text-xs font-semibold">
                {initials(person.full_name)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold text-primary text-sm truncate">{person.full_name}</p>
              <StatusBadge status={person.status} />
            </div>
            <p className="text-xs text-ink-muted mt-0.5">
              {person.age ? `${person.age} yrs · ` : ''}
              {person.gender ?? 'Unknown'}
            </p>
            {person.last_seen_location && (
              <p className="text-xs text-ink-muted mt-1 flex items-center gap-1">
                <MapPin size={12} /> {truncate(person.last_seen_location, 40)}
              </p>
            )}
            <p className="text-[11px] text-ink-subtle mt-1 flex items-center gap-1">
              <Clock size={11} /> {formatDate(person.last_seen_date)}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function WantedPersonCard({ person, index = 0 }: { person: WantedPerson; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.3) }}
    >
      <Link to={`/app/wanted/${person.id}`} className="block">
        <div className="card p-3 flex gap-3 hover:shadow-cardHover transition-shadow">
          <div className="h-20 w-16 rounded-xl overflow-hidden bg-surface-border shrink-0">
            {person.photo_url ? (
              <img src={person.photo_url} alt={person.name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-ink-subtle text-xs font-semibold">
                {initials(person.name)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold text-primary text-sm truncate">{person.name}</p>
              <WantedStatusBadge status={person.status} />
            </div>
            <p className="text-xs text-ink-muted mt-0.5 line-clamp-1">{person.charges}</p>
            {person.agency && <p className="text-xs text-ink-subtle mt-0.5">{person.agency}</p>}
            {person.reward ? (
              <p className="text-xs text-success-700 font-semibold mt-1">
                Reward: ${Number(person.reward).toLocaleString()}
              </p>
            ) : null}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function ReportCard({ report, index = 0 }: { report: CrimeReport; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.3) }}
    >
      <Link to={`/app/reports/${report.id}`} className="block">
        <div className="card p-3 hover:shadow-cardHover transition-shadow">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <CategoryBadge category={report.category} />
            <ReportStatusBadge status={report.status} />
          </div>
          <p className="text-sm text-ink line-clamp-2">{truncate(report.description, 100)}</p>
          <div className="flex items-center justify-between mt-2 text-[11px] text-ink-subtle">
            <span className="flex items-center gap-1">
              {report.location ? <MapPin size={11} /> : null}
              {report.location ? truncate(report.location, 30) : 'Location unknown'}
            </span>
            <span>{formatRelative(report.created_at)}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function AlertCard({ alert, index = 0 }: { alert: Alert; index?: number }) {
  const critical = alert.priority === 'critical';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.3) }}
      className={`card p-3 ${critical ? 'border-emergency-200 bg-emergency-50' : ''}`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <PriorityBadge priority={alert.priority} />
        <span className="text-[11px] text-ink-subtle">{formatRelative(alert.created_at)}</span>
      </div>
      <p className="text-sm font-semibold text-primary">{alert.title}</p>
      <p className="text-xs text-ink-muted mt-1 line-clamp-2">{truncate(alert.message, 120)}</p>
      {alert.region && (
        <p className="text-[11px] text-ink-subtle mt-1.5 flex items-center gap-1">
          <MapPin size={11} /> {alert.region}
        </p>
      )}
    </motion.div>
  );
}
