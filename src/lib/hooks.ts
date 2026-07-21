// Re-export all hooks from main admin panel hooks
// This file acts as the main API for data fetching in admin components

export { useDashboardMetrics } from './admin-hooks';
export { useActivityLog } from './admin-hooks';
export { useStudents } from './admin-hooks';
export { usePayments } from './admin-hooks';
export { useApplications } from './admin-hooks';
export { useCohorts } from './admin-hooks';
export { useStaff } from './admin-hooks';
export { useSettings } from './admin-hooks';
export { useCreateCohort } from './admin-hooks';
export { useScheduleApplication } from './admin-hooks';
export { useCreateAdminUser } from './admin-hooks';
export { useRecordPayment } from './admin-hooks';
export { useUpdateSettings } from './admin-hooks';
export { useInviteStaff } from './admin-hooks';

// Re-export utility hooks
export { useCanAccess } from './admin-hooks';
export { useCurriculum } from './admin-hooks';

// Re-export invitation hooks
export { useInvitations } from './admin-hooks';
export { useCreateInvitation } from './admin-hooks';
export { useRevokeInvitation } from './admin-hooks';
export type { Invitation } from './admin-hooks';