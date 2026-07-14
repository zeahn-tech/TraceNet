export type UserRole = 'citizen' | 'law_enforcement' | 'admin';

export type CaseStatus = 'missing' | 'located' | 'closed';
export type WantedStatus = 'active' | 'captured' | 'closed';
export type ReportCategory =
  | 'theft'
  | 'violence'
  | 'fraud'
  | 'missing_person'
  | 'suspicious_activity'
  | 'other';
export type ReportStatus = 'submitted' | 'pending_review' | 'verified' | 'resolved' | 'rejected';
export type AlertPriority = 'low' | 'medium' | 'high' | 'critical';
export type AlertType = 'emergency' | 'crime_warning' | 'public_notice' | 'case_update';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  agency: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface MissingPerson {
  id: string;
  full_name: string;
  photo_url: string | null;
  age: number | null;
  gender: string | null;
  physical_description: string | null;
  last_seen_location: string | null;
  latitude: number | null;
  longitude: number | null;
  last_seen_date: string | null;
  contact_information: string | null;
  status: CaseStatus;
  created_by: string | null;
  created_at: string;
}

export interface WantedPerson {
  id: string;
  name: string;
  photo_url: string | null;
  charges: string | null;
  description: string | null;
  last_known_location: string | null;
  agency: string | null;
  reward: number | null;
  status: WantedStatus;
  created_at: string;
}

export interface CrimeReport {
  id: string;
  category: ReportCategory;
  description: string;
  photo_url: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  report_date: string | null;
  status: ReportStatus;
  is_anonymous: boolean;
  created_by: string | null;
  created_at: string;
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  type: AlertType;
  priority: AlertPriority;
  region: string | null;
  created_by: string | null;
  created_at: string;
  expires_at: string | null;
}

export interface Comment {
  id: string;
  entity_type: 'missing_person' | 'wanted_person' | 'report';
  entity_id: string;
  body: string;
  is_anonymous: boolean;
  author_id: string | null;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string | null;
  title: string;
  body: string;
  type: string;
  read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}
