import { PERMISSIONS, type PermissionValue } from '../constants/permissions';
import type { PermissionSet } from '@/lib/permissions';

export function canAccess(permissionSet: PermissionSet, permission: PermissionValue): boolean {
  return permissionSet.keys.has(permission);
}

export function isAdmin(permissionSet: PermissionSet): boolean {
  return canAccess(permissionSet, PERMISSIONS.ADMIN_ACCESS);
}

