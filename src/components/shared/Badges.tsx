import { Badge } from '../ui/Badge';
import type {
  CaseStatus,
  WantedStatus,
  ReportStatus,
  ReportCategory,
  AlertPriority,
  AlertType,
  UserRole,
} from '../../types';

export function StatusBadge({ status }: { status: CaseStatus }) {
  const map: Record<CaseStatus, { tone: 'emergency' | 'success' | 'neutral'; label: string }> = {
    missing: { tone: 'emergency', label: 'Missing' },
    located: { tone: 'success', label: 'Located' },
    closed: { tone: 'neutral', label: 'Closed' },
  };
  const v = map[status];
  return <Badge tone={v.tone}>{v.label}</Badge>;
}

export function WantedStatusBadge({ status }: { status: WantedStatus }) {
  const map: Record<WantedStatus, { tone: 'emergency' | 'success' | 'neutral'; label: string }> = {
    active: { tone: 'emergency', label: 'Active' },
    captured: { tone: 'success', label: 'Captured' },
    closed: { tone: 'neutral', label: 'Closed' },
  };
  const v = map[status];
  return <Badge tone={v.tone}>{v.label}</Badge>;
}

export function ReportStatusBadge({ status }: { status: ReportStatus }) {
  const map: Record<ReportStatus, { tone: 'warning' | 'secondary' | 'success' | 'neutral' | 'emergency'; label: string }> = {
    submitted: { tone: 'warning', label: 'Submitted' },
    pending_review: { tone: 'secondary', label: 'Pending Review' },
    verified: { tone: 'success', label: 'Verified' },
    resolved: { tone: 'neutral', label: 'Resolved' },
    rejected: { tone: 'emergency', label: 'Rejected' },
  };
  const v = map[status];
  return <Badge tone={v.tone}>{v.label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: AlertPriority }) {
  const map: Record<AlertPriority, { tone: 'neutral' | 'warning' | 'emergency'; label: string }> = {
    low: { tone: 'neutral', label: 'Low' },
    medium: { tone: 'warning', label: 'Medium' },
    high: { tone: 'emergency', label: 'High' },
    critical: { tone: 'emergency', label: 'Critical' },
  };
  const v = map[priority];
  return (
    <Badge tone={v.tone} className={priority === 'critical' ? 'ring-2 ring-emergency-200' : ''}>
      {v.label}
    </Badge>
  );
}

export function AlertTypeBadge({ type }: { type: AlertType }) {
  const map: Record<AlertType, string> = {
    emergency: 'Emergency',
    crime_warning: 'Crime Warning',
    public_notice: 'Public Notice',
    case_update: 'Case Update',
  };
  return <Badge tone="primary">{map[type]}</Badge>;
}

export function CategoryBadge({ category }: { category: ReportCategory }) {
  const map: Record<ReportCategory, string> = {
    theft: 'Theft',
    violence: 'Violence',
    fraud: 'Fraud',
    missing_person: 'Missing Person',
    suspicious_activity: 'Suspicious Activity',
    other: 'Other',
  };
  return <Badge tone="secondary">{map[category]}</Badge>;
}

export function RoleBadge({ role }: { role: UserRole }) {
  const map: Record<UserRole, { tone: 'neutral' | 'secondary' | 'primary'; label: string }> = {
    citizen: { tone: 'neutral', label: 'Citizen' },
    law_enforcement: { tone: 'secondary', label: 'Law Enforcement' },
    admin: { tone: 'primary', label: 'Administrator' },
  };
  const v = map[role];
  return <Badge tone={v.tone}>{v.label}</Badge>;
}
