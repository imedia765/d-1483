import { UserRole } from '../useRoleAccess';

type RoleData = {
  role: UserRole;
}[];

export const getRoleFromData = (roleData: RoleData): UserRole => {
  if (roleData.some(r => r.role === 'admin')) return 'admin';
  if (roleData.some(r => r.role === 'collector')) return 'collector';
  return 'member';
};