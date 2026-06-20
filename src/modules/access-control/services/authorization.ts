import type { AccessContext } from './access-context';
import { canAccess } from './permission-service';
import { PERMISSIONS } from '../constants/permissions';

export function canReadChallenges(context: AccessContext): boolean {
  return canAccess(context.permissionSet, PERMISSIONS.CHALLENGE_READ);
}

export function canWriteChallenges(context: AccessContext): boolean {
  return canAccess(context.permissionSet, PERMISSIONS.CHALLENGE_WRITE);
}

export function canAccessAdmin(context: AccessContext): boolean {
  return canAccess(context.permissionSet, PERMISSIONS.ADMIN_ACCESS);
}
