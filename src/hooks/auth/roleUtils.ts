import { UserRole } from '../useRoleAccess';

export const processRoleData = (roleData: { role: string }[] | null): UserRole => {
  if (!roleData?.length) return 'member';
  
  if (roleData.some(r => r.role === 'admin')) return 'admin';
  if (roleData.some(r => r.role === 'collector')) return 'collector';
  return 'member';
};

export const canAccessTab = (role: UserRole, tab: string, isTM10003: boolean): boolean => {
  if (!role) return false;

  if (isTM10003) {
    return ['dashboard', 'users', 'collectors', 'audit', 'system', 'financials'].includes(tab);
  }

  switch (role) {
    case 'admin':
      return ['dashboard', 'users', 'collectors', 'audit', 'system', 'financials'].includes(tab);
    case 'collector':
      return ['dashboard', 'users'].includes(tab);
    case 'member':
      return tab === 'dashboard';
    default:
      return false;
  }
};