import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  missingPersonService,
  wantedPersonService,
  reportService,
  alertService,
  commentService,
  notificationService,
  userService,
  auditService,
} from '../services';

export const qk = {
  missing: ['missing'] as const,
  missingOne: (id: string) => ['missing', id] as const,
  wanted: ['wanted'] as const,
  wantedOne: (id: string) => ['wanted', id] as const,
  reports: ['reports'] as const,
  reportsOne: (id: string) => ['reports', id] as const,
  alerts: ['alerts'] as const,
  comments: (t: string, id: string) => ['comments', t, id] as const,
  notifications: (uid: string) => ['notifications', uid] as const,
  users: ['users'] as const,
  audit: ['audit'] as const,
};

export function useMissingPersons(status?: string) {
  return useQuery({
    queryKey: ['missing', status ?? 'all'],
    queryFn: () => missingPersonService.list(status),
  });
}
export function useMissingPerson(id: string | undefined) {
  return useQuery({
    queryKey: id ? qk.missingOne(id) : ['missing', 'none'],
    queryFn: () => (id ? missingPersonService.get(id) : Promise.resolve(null)),
    enabled: !!id,
  });
}
export function useCreateMissing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof missingPersonService.create>[0]) =>
      missingPersonService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.missing }),
  });
}
export function useUpdateMissing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Record<string, unknown> }) =>
      missingPersonService.update(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.missing }),
  });
}

export function useWantedPersons(status?: string) {
  return useQuery({
    queryKey: ['wanted', status ?? 'all'],
    queryFn: () => wantedPersonService.list(status),
  });
}
export function useWantedPerson(id: string | undefined) {
  return useQuery({
    queryKey: id ? qk.wantedOne(id) : ['wanted', 'none'],
    queryFn: () => (id ? wantedPersonService.get(id) : Promise.resolve(null)),
    enabled: !!id,
  });
}
export function useCreateWanted() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof wantedPersonService.create>[0]) =>
      wantedPersonService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.wanted }),
  });
}
export function useUpdateWanted() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Record<string, unknown> }) =>
      wantedPersonService.update(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.wanted }),
  });
}

export function useReports(status?: string, category?: string) {
  return useQuery({
    queryKey: ['reports', status ?? 'all', category ?? 'all'],
    queryFn: () => reportService.list(status, category),
  });
}
export function useReport(id: string | undefined) {
  return useQuery({
    queryKey: id ? qk.reportsOne(id) : ['reports', 'none'],
    queryFn: () => (id ? reportService.get(id) : Promise.resolve(null)),
    enabled: !!id,
  });
}
export function useCreateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof reportService.create>[0]) => reportService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.reports }),
  });
}
export function useUpdateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Record<string, unknown> }) =>
      reportService.update(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.reports }),
  });
}

export function useAlerts() {
  return useQuery({ queryKey: qk.alerts, queryFn: alertService.list });
}
export function useCreateAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof alertService.create>[0]) => alertService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.alerts }),
  });
}
export function useDeleteAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => alertService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.alerts }),
  });
}

export function useComments(entityType: string, entityId: string) {
  return useQuery({
    queryKey: qk.comments(entityType, entityId),
    queryFn: () => commentService.list(entityType, entityId),
    enabled: !!entityId,
  });
}
export function useCreateComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof commentService.create>[0]) => commentService.create(input),
    onSuccess: (_d, vars) => {
      const eid = vars.entity_id as string;
      const etype = vars.entity_type as string;
      if (eid && etype) qc.invalidateQueries({ queryKey: qk.comments(etype, eid) });
    },
  });
}

export function useNotifications(userId: string | undefined) {
  return useQuery({
    queryKey: userId ? qk.notifications(userId) : ['notifications', 'none'],
    queryFn: () => (userId ? notificationService.list(userId) : Promise.resolve([])),
    enabled: !!userId,
  });
}

export function useUsers() {
  return useQuery({ queryKey: qk.users, queryFn: userService.list });
}
export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Record<string, unknown> }) =>
      userService.update(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.users }),
  });
}

export function useAuditLogs() {
  return useQuery({ queryKey: qk.audit, queryFn: auditService.list });
}
