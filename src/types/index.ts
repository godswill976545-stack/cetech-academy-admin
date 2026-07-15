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
