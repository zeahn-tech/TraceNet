import { supabase } from '../lib/supabase';
import type { MissingPerson, WantedPerson, CrimeReport, Alert, Comment, NotificationItem, Profile, AuditLog } from '../types';

export const missingPersonService = {
  list: async (status?: string): Promise<MissingPerson[]> => {
    let q = supabase.from('missing_persons').select('*').order('created_at', { ascending: false });
    if (status && status !== 'all') q = q.eq('status', status);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as MissingPerson[];
  },
  get: async (id: string): Promise<MissingPerson | null> => {
    const { data, error } = await supabase
      .from('missing_persons')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data as MissingPerson | null;
  },
  create: async (input: Partial<MissingPerson>): Promise<MissingPerson> => {
    const { data, error } = await supabase.from('missing_persons').insert(input).select().single();
    if (error) throw error;
    return data as MissingPerson;
  },
  update: async (id: string, patch: Partial<MissingPerson>): Promise<MissingPerson> => {
    const { data, error } = await supabase
      .from('missing_persons')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as MissingPerson;
  },
  remove: async (id: string): Promise<void> => {
    const { error } = await supabase.from('missing_persons').delete().eq('id', id);
    if (error) throw error;
  },
};

export const wantedPersonService = {
  list: async (status?: string): Promise<WantedPerson[]> => {
    let q = supabase.from('wanted_persons').select('*').order('created_at', { ascending: false });
    if (status && status !== 'all') q = q.eq('status', status);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as WantedPerson[];
  },
  get: async (id: string): Promise<WantedPerson | null> => {
    const { data, error } = await supabase
      .from('wanted_persons')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data as WantedPerson | null;
  },
  create: async (input: Partial<WantedPerson>): Promise<WantedPerson> => {
    const { data, error } = await supabase.from('wanted_persons').insert(input).select().single();
    if (error) throw error;
    return data as WantedPerson;
  },
  update: async (id: string, patch: Partial<WantedPerson>): Promise<WantedPerson> => {
    const { data, error } = await supabase
      .from('wanted_persons')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as WantedPerson;
  },
  remove: async (id: string): Promise<void> => {
    const { error } = await supabase.from('wanted_persons').delete().eq('id', id);
    if (error) throw error;
  },
};

export const reportService = {
  list: async (status?: string, category?: string): Promise<CrimeReport[]> => {
    let q = supabase.from('crime_reports').select('*').order('created_at', { ascending: false });
    if (status && status !== 'all') q = q.eq('status', status);
    if (category && category !== 'all') q = q.eq('category', category);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as CrimeReport[];
  },
  get: async (id: string): Promise<CrimeReport | null> => {
    const { data, error } = await supabase
      .from('crime_reports')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data as CrimeReport | null;
  },
  create: async (input: Partial<CrimeReport>): Promise<CrimeReport> => {
    const { data, error } = await supabase.from('crime_reports').insert(input).select().single();
    if (error) throw error;
    return data as CrimeReport;
  },
  update: async (id: string, patch: Partial<CrimeReport>): Promise<CrimeReport> => {
    const { data, error } = await supabase
      .from('crime_reports')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as CrimeReport;
  },
  remove: async (id: string): Promise<void> => {
    const { error } = await supabase.from('crime_reports').delete().eq('id', id);
    if (error) throw error;
  },
};

export const alertService = {
  list: async (): Promise<Alert[]> => {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Alert[];
  },
  create: async (input: Partial<Alert>): Promise<Alert> => {
    const { data, error } = await supabase.from('alerts').insert(input).select().single();
    if (error) throw error;
    return data as Alert;
  },
  update: async (id: string, patch: Partial<Alert>): Promise<Alert> => {
    const { data, error } = await supabase
      .from('alerts')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Alert;
  },
  remove: async (id: string): Promise<void> => {
    const { error } = await supabase.from('alerts').delete().eq('id', id);
    if (error) throw error;
  },
};

export const commentService = {
  list: async (entityType: string, entityId: string): Promise<Comment[]> => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Comment[];
  },
  create: async (input: Partial<Comment>): Promise<Comment> => {
    const { data, error } = await supabase.from('comments').insert(input).select().single();
    if (error) throw error;
    return data as Comment;
  },
};

export const notificationService = {
  list: async (userId: string): Promise<NotificationItem[]> => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as NotificationItem[];
  },
  markRead: async (id: string): Promise<void> => {
    const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
    if (error) throw error;
  },
  markAllRead: async (userId: string): Promise<void> => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);
    if (error) throw error;
  },
};

export const userService = {
  list: async (): Promise<Profile[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Profile[];
  },
  updateRole: async (id: string, role: string): Promise<void> => {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', id);
    if (error) throw error;
  },
  update: async (id: string, patch: Partial<Profile>): Promise<void> => {
    const { error } = await supabase.from('profiles').update(patch).eq('id', id);
    if (error) throw error;
  },
};

export const auditService = {
  list: async (): Promise<AuditLog[]> => {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) throw error;
    return (data ?? []) as AuditLog[];
  },
  log: async (action: string, entityType: string, entityId?: string, metadata?: Record<string, unknown>): Promise<void> => {
    await supabase.from('audit_logs').insert({
      action,
      entity_type: entityType,
      entity_id: entityId ?? null,
      metadata: metadata ?? null,
    });
  },
};

export const storageService = {
  upload: async (file: File, path: string): Promise<string> => {
    const { data, error } = await supabase.storage.from('media').upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });
    if (error) throw error;
    const { data: pub } = supabase.storage.from('media').getPublicUrl(data.path);
    return pub.publicUrl;
  },
};

export const locationService = {
  getCurrent: (): Promise<GeolocationPosition> =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) reject(new Error('Geolocation not supported'));
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      });
    }),
  reverseGeocode: async (lat: number, lon: number): Promise<string> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14`,
        { headers: { Accept: 'application/json' } }
      );
      if (!res.ok) throw new Error('geocode failed');
      const j = await res.json();
      return j.display_name ?? `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    } catch {
      return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    }
  },
};
