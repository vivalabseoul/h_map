// ==========================================
// Role-Based Permissions
// ==========================================
import type { UserRole } from '@/types';

export type Permission =
  | 'view_map'
  | 'view_workshops'
  | 'book_course'
  | 'cancel_booking'
  | 'write_review'
  | 'create_workshop'
  | 'edit_own_workshop'
  | 'delete_own_workshop'
  | 'create_course'
  | 'edit_own_course'
  | 'delete_own_course'
  | 'view_applicants'
  | 'manage_workshops'
  | 'manage_courses'
  | 'manage_members'
  | 'change_roles'
  | 'system_settings';

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    'view_map', 'view_workshops', 'book_course', 'cancel_booking', 'write_review',
    'create_workshop', 'edit_own_workshop', 'delete_own_workshop',
    'create_course', 'edit_own_course', 'delete_own_course', 'view_applicants',
    'manage_workshops', 'manage_courses', 'manage_members',
    'change_roles', 'system_settings',
  ],
  manager: [
    'view_map', 'view_workshops', 'book_course', 'cancel_booking', 'write_review',
    'create_workshop', 'edit_own_workshop', 'delete_own_workshop',
    'create_course', 'edit_own_course', 'delete_own_course', 'view_applicants',
    'manage_workshops', 'manage_courses', 'manage_members',
  ],
  instructor: [
    'view_map', 'view_workshops', 'write_review',
    'create_workshop', 'edit_own_workshop', 'delete_own_workshop',
    'create_course', 'edit_own_course', 'delete_own_course', 'view_applicants',
  ],
  member: [
    'view_map', 'view_workshops',
    'book_course', 'cancel_booking', 'write_review',
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole | null, permission: Permission): boolean {
  if (!role) return permission === 'view_map' || permission === 'view_workshops';
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Check if a role is admin-level (super_admin or manager)
 */
export function isAdmin(role: UserRole | null): boolean {
  return role === 'super_admin' || role === 'manager';
}

/**
 * Check if a role can access the instructor dashboard
 */
export function isInstructor(role: UserRole | null): boolean {
  return role === 'instructor' || role === 'super_admin' || role === 'manager';
}

/**
 * Get the available roles a user can assign based on their own role
 */
export function getAssignableRoles(currentUserRole: UserRole): UserRole[] {
  if (currentUserRole === 'super_admin') {
    return ['member', 'instructor', 'manager'];
  }
  return [];
}
