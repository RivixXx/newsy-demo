export type PermissionKey = string;

export interface PermissionSet {
  keys: Set<PermissionKey>;
}

export function hasPermission(permissionSet: PermissionSet, key: PermissionKey): boolean {
  return permissionSet.keys.has(key);
}

export function hasAnyPermission(permissionSet: PermissionSet, keys: PermissionKey[]): boolean {
  return keys.some((key) => permissionSet.keys.has(key));
}

export function hasAllPermissions(permissionSet: PermissionSet, keys: PermissionKey[]): boolean {
  return keys.every((key) => permissionSet.keys.has(key));
}

