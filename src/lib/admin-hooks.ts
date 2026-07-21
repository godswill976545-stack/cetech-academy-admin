import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';
import type {
  AdminUser,
  Application,
  Cohort,
  Student,
  Payment,
  Settings,
  DashboardMetrics,
  ActivityLog,
  StaffMember,
  CurriculumModule,
} from '@/types';

// Dashboard Hooks
export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'metrics'],
    queryFn: async () => {
      const { data: res } = await api.get<{ data: DashboardMetrics; activity: ActivityLog[] }>('/admin/dashboard/metrics');
      return res.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useActivityLog(limit?: number) {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'activity', limit],
    queryFn: async () => {
      const { data: res } = await api.get<{ data: ActivityLog[] }>('/admin/dashboard/activity', {
        params: { limit },
      });
      return res.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Students Hooks
export function useStudents(page = 1, pageSize = 20, filters?: { track?: string; status?: string }) {
  return useQuery({
    queryKey: ['admin', 'students', page, pageSize, filters],
    queryFn: async () => {
      const { data: res } = await api.get<{ data: Student[] }>('/admin/students', {
        params: { page, pageSize, ...filters },
      });
      return res.data;
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: { email: string; fullName: string; role: string; assignedTracks?: string[] }) => {
      const { data: res } = await api.post<{ data: AdminUser }>('/admin/students', user);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'students'] });
    },
  });
}

// Applications Hooks
export function useApplications(page = 1, pageSize = 20, filters?: { status?: string; track?: string }) {
  return useQuery({
    queryKey: ['admin', 'applications', page, pageSize, filters],
    queryFn: async () => {
      const { data: res } = await api.get<{ data: Application[] }>('/admin/applications', {
        params: { page, pageSize, ...filters },
      });
      return res.data;
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useScheduleApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ applicationId, assessmentSlotId }: { applicationId: string; assessmentSlotId: string }) => {
      const { data: res } = await api.post<{ data: { success: boolean } }>(`/admin/applications/${applicationId}/schedule`, {
        assessmentSlotId,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'applications'] });
    },
  });
}

// Cohorts Hooks
export function useCohorts() {
  return useQuery({
    queryKey: ['admin', 'cohorts'],
    queryFn: async () => {
      const { data: res } = await api.get<{ data: Cohort[] }>('/admin/cohorts');
      return res.data;
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateCohort() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (cohort: Partial<Cohort>) => {
      const { data: res } = await api.post<{ data: Cohort }>('/admin/cohorts', cohort);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cohorts'] });
    },
  });
}

// Staff Hooks
export function useStaff() {
  return useQuery({
    queryKey: ['admin', 'staff'],
    queryFn: async () => {
      const { data: res } = await api.get<{ data: StaffMember[] }>('/admin/staff');
      return res.data;
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useInviteStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (staff: { email: string; role: string; assignedTracks?: string[] }) => {
      const { data: res } = await api.post<{ data: StaffMember }>('/admin/staff/invite', staff);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'staff'] });
    },
  });
}

// Payments Hooks
export function usePayments(page = 1, pageSize = 20, filters?: { status?: string; currency?: string }) {
  return useQuery({
    queryKey: ['admin', 'payments', page, pageSize, filters],
    queryFn: async () => {
      const { data: res } = await api.get<{ data: Payment[] }>('/admin/payments', {
        params: { page, pageSize, ...filters },
      });
      return res.data;
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payment: Partial<Payment>) => {
      const { data: res } = await api.post<{ data: Payment }>('/admin/payments/manual', payment);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard', 'metrics'] });
    },
  });
}

// Settings Hooks
export function useSettings() {
  return useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: async () => {
      const { data: res } = await api.get<{ data: Settings }>('/admin/settings');
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Partial<Settings>) => {
      const { data: res } = await api.patch<{ data: Settings }>('/admin/settings', settings);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
    },
  });
}

// Curriculum Hooks
export function useCurriculum(filters?: { track?: string; level?: string }) {
  return useQuery({
    queryKey: ['admin', 'curriculum', filters],
    queryFn: async () => {
      const { data: res } = await api.get<{ data: CurriculumModule[] }>('/admin/curriculum', {
        params: filters,
      });
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

// Role-based access control hook
export function useCanAccess(resource: string, action: string) {
  return false; // Placeholder
}

// Invitations Hooks
export interface Invitation {
  id: string;
  email: string;
  role: string;
  assigned_tracks: string[];
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
  inviteLink?: string;
}

export function useInvitations() {
  return useQuery({
    queryKey: ['admin', 'invitations'],
    queryFn: async () => {
      const { data: res } = await api.get<{ data: Invitation[] }>('/admin/invitations');
      return res.data;
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (invite: { email: string; role: string; assignedTracks?: string[] }) => {
      const { data: res } = await api.post<{ data: Invitation }>('/admin/invitations', invite);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'invitations'] });
    },
  });
}

export function useRevokeInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (invitationId: string) => {
      const { data: res } = await api.delete<{ success: boolean }>(`/admin/invitations/${invitationId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'invitations'] });
    },
  });
}