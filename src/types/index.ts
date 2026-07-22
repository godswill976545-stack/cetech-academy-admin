export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'TUTOR' | 'STAFF';

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: AdminRole;
  assignedTracks: string[];
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface DashboardMetrics {
  totalStudents: number;
  applications: number;
  revenueMTD: number;
  activeCohorts: number;
  completionRate: number;
  onTrack: number;
  atRisk: number;
  inactive: number;
}

export interface ActivityLog {
  id: string;
  type: string;
  description: string;
  actorName: string;
  createdAt: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  track: string;
  cohort: string;
  status: 'active' | 'suspended' | 'graduated' | 'payment_due';
  paymentStatus: string;
  joinedDate: string;
}

export interface Payment {
  id: string;
  studentName: string;
  studentEmail: string;
  amount: number;
  currency: string;
  method: 'card' | 'bank_transfer' | 'offline' | 'unknown';
  status: 'paid' | 'pending' | 'overdue' | 'refunded';
  date: string;
  cohortName?: string;
}

export interface Cohort {
  id: string;
  name: string;
  track: string;
  trackId?: string;
  capacity: number;
  enrolled: number;
  startDate: string;
  endDate?: string;
  assessmentDate?: string;
  assessmentTime?: string;
  status: 'planning' | 'open' | 'in_progress' | 'completed' | 'cancelled';
  applicationCount?: number;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'tutor' | 'staff';
  assignedTracks: string[];
  status: 'active' | 'invited' | 'inactive';
  joinedDate?: string;
}

export interface CurriculumModule {
  id: string;
  title: string;
  track: string;
  level: string;
  lessons: CurriculumLesson[];
  unitCount: number;
}

export interface CurriculumLesson {
  id: string;
  title: string;
  duration: string;
  order: number;
}

export interface Application {
  id: string;
  userId: string;
  trackId: string;
  cohortId: string | null;
  status: 'applied' | 'assessed' | 'offered' | 'enrolled' | 'rejected';
  declaredTrack: string;
  declaredLevel: string;
  createdAt: string;
  user?: { fullName: string; email: string };
  track?: { name: string };
  cohort?: { name: string };
}

export interface Settings {
  id?: string;
  portalAccess: 'first' | 'full';
  auditLogRetention: boolean;
  allowAdminRefunds: boolean;
  requireMfa?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
