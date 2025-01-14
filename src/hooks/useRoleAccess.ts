import { useQuery } from '@tanstack/react-query';
import { useSession } from './auth/useSession';
import { getRoleFromData } from './auth/roleUtils';
import { supabase } from "@/integrations/supabase/client";

export type UserRole = 'member' | 'collector' | 'admin' | null;

export const useRoleAccess = () => {
  const { data: session } = useSession();

  const { data: userRole, isLoading: roleLoading, error: roleError } = useQuery({
    queryKey: ['userRole', session?.user?.id],
    queryFn: async () => {
      if (!session?.user) return null;

      // Special case for TM10003
      if (session.user.user_metadata?.member_number === 'TM10003') {
        return 'admin' as UserRole;
      }

      const { data: roleData, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id);

      if (error) throw error;

      if (roleData?.length > 0) {
        return getRoleFromData(roleData);
      }

      return 'member' as UserRole;
    },
    enabled: !!session?.user?.id
  });

  const hasRole = (role: UserRole): boolean => {
    return userRole === role;
  };

  const canAccessTab = (tab: string): boolean => {
    if (!userRole) return false;

    // Special case for TM10003
    if (session?.user?.user_metadata?.member_number === 'TM10003') {
      return ['dashboard', 'users', 'collectors', 'audit', 'system', 'financials'].includes(tab);
    }

    switch (userRole) {
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

  return {
    userRole,
    roleLoading,
    error: roleError,
    canAccessTab,
    hasRole
  };
};