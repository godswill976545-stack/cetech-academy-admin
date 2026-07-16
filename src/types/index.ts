export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'STAFF';

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

export interface Student {
  id: string;
  name: string;
  email: string;
  track: string;
  cohort: string;
  status: 'active' | 'suspended' | 'graduated' | 'payment_due';
  enrolledAt: string;
}

export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  status: 'paid' | 'pending' | 'refunded' | 'failed';
  method: 'card' | 'bank_transfer' | 'offline';
  createdAt: string;
}

export interface Cohort {
  id: string;
  name: string;
  track: string;
  capacity: number;
  enrolled: number;
  startDate: string;
  endDate: string;
  status: 'open' | 'closed' | 'planning';
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'staff' | 'tutor' | 'admin';
  assignedTracks: string[];
  status: 'active' | 'invited' | 'disabled';
  createdAt: string;
}

export interface CurriculumModule {
  id: string;
  title: string;
  track: string;
  level: number;
  lessons: number;
  quizzes: number;
  status: 'draft' | 'review' | 'published';
}

export interface ActivityLog {
  id: string;
  type: string;
  description: string;
  userId?: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
