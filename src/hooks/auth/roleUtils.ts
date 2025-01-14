import type { UserRole } from '../useRoleAccess';

export const getRoleFromData = (roleData: Array<{ role: string }>) => {
  if (roleData.some(r => r.role === 'admin')) return 'admin' as UserRole;
  if (roleData.some(r => r.role === 'collector')) return 'collector' as UserRole;
  return 'member' as UserRole;
};