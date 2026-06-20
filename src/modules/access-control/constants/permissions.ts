export const PERMISSIONS = {
  USER_READ: 'user.read',
  USER_WRITE: 'user.write',
  USER_DELETE: 'user.delete',
  ROLE_READ: 'role.read',
  ROLE_WRITE: 'role.write',
  ROLE_DELETE: 'role.delete',
  CHALLENGE_READ: 'challenge.read',
  CHALLENGE_WRITE: 'challenge.write',
  CHALLENGE_PUBLISH: 'challenge.publish',
  STEP_VERIFY: 'step.verify',
  ACHIEVEMENT_MANAGE: 'achievement.manage',
  ADMIN_ACCESS: 'admin.access'
} as const;

export type PermissionValue = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
