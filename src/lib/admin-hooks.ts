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
      const { data } = await api.get<DashboardMetrics>('/admin/dashboard/metrics');
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useActivityLog(limit?: number) {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'activity', limit],
    queryFn: async () => {
      const { data } = await api.get<ActivityLog[]>('/admin/dashboard/activity', {
        params: { limit },
      });
      return data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Students Hooks
export function useStudents(page = 1, pageSize = 20, filters?: { track?: string; status?: string }) {
  return useQuery({
    queryKey: ['admin', 'students', page, pageSize, filters],
    queryFn: async () => {
      const { data } = await api.get<Student[]>('/admin/students', {
        params: { page, pageSize, ...filters },
      });
      return data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: { email: string; fullName: string; role: string; assignedTracks?: string[] }) => {
      const { data } = await api.post<AdminUser>('/admin/students', user);
      return data;
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
      const { data } = await api.get<Application[]>('/admin/applications', {
        params: { page, pageSize, ...filters },
      });
      return data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useScheduleApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ applicationId, assessmentSlotId }: { applicationId: string; assessmentSlotId: string }) => {
      const { data } = await api.post<{ success: boolean }>(`/admin/applications/${applicationId}/schedule`, {
        assessmentSlotId,
      });
      return data;
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
      const { data } = await api.get<Cohort[]>('/admin/cohorts');
      return data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useCreateCohort() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (cohort: Partial<Cohort>) => {
      const { data } = await api.post<Cohort>('/admin/cohorts', cohort);
      return data;
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
      const { data } = await api.get<StaffMember[]>('/admin/staff');
      return data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useInviteStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (staff: { email: string; role: string; assignedTracks?: string[] }) => {
      const { data } = await api.post<StaffMember>('/admin/staff/invite', staff);
      return data;
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
      const { data } = await api.get<Payment[]>('/admin/payments', {
        params: { page, pageSize, ...filters },
      });
      return data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payment: Partial<Payment>) => {
      const { data } = await api.post<Payment>('/admin/payments/manual', payment);
      return data;
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
      const { data } = await api.get<Settings>('/admin/settings');
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Partial<Settings>) => {
      const { data } = await api.patch<Settings>('/admin/settings', settings);
      return data;
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
      const { data } = await api.get<CurriculumModule[]>('/admin/curriculum', {
        params: filters,
      });
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Role-based access control hook
export function useCanAccess(resource: string, action: string) {
  // This will use the auth store to check permissions
  // Implementation depends on how your auth state is stored
  return false; // Placeholder - implement actual permission logic
}