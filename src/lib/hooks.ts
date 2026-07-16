import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';
import type {
  DashboardMetrics,
  Student,
  Payment,
  Cohort,
  StaffMember,
  CurriculumModule,
  ActivityLog,
  PaginatedResponse,
} from '@/types';

// Dashboard
export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: async () => {
      const { data } = await api.get<DashboardMetrics>('/admin/dashboard/metrics');
      return data;
    },
  });
}

export function useActivityLog() {
  return useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: async () => {
      const { data } = await api.get<ActivityLog[]>('/admin/dashboard/activity');
      return data;
    },
  });
}

// Students
export function useStudents(page = 1, pageSize = 20, filters?: { track?: string; status?: string }) {
  return useQuery({
    queryKey: ['students', page, pageSize, filters],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Student>>('/admin/students', {
        params: { page, pageSize, ...filters },
      });
      return data;
    },
  });
}

export function useStudent(id: string) {
  return useQuery({
    queryKey: ['students', id],
    queryFn: async () => {
      const { data } = await api.get<Student>(`/admin/students/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

// Payments
export function usePayments(page = 1, pageSize = 20, filters?: { status?: string }) {
  return useQuery({
    queryKey: ['payments', page, pageSize, filters],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Payment>>('/admin/payments', {
        params: { page, pageSize, ...filters },
      });
      return data;
    },
  });
}

// Cohorts
export function useCohorts() {
  return useQuery({
    queryKey: ['cohorts'],
    queryFn: async () => {
      const { data } = await api.get<Cohort[]>('/admin/cohorts');
      return data;
    },
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
      queryClient.invalidateQueries({ queryKey: ['cohorts'] });
    },
  });
}

// Staff
export function useStaff() {
  return useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const { data } = await api.get<StaffMember[]>('/admin/staff');
      return data;
    },
  });
}

export function useInviteStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (staff: { email: string; role: string; assignedTracks: string[] }) => {
      const { data } = await api.post<StaffMember>('/admin/staff/invite', staff);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
}

// Content
export function useCurriculum(track?: string, level?: number) {
  return useQuery({
    queryKey: ['curriculum', track, level],
    queryFn: async () => {
      const { data } = await api.get<CurriculumModule[]>('/admin/curriculum', {
        params: { track, level },
      });
      return data;
    },
  });
}
