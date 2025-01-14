import { useQuery } from '@tanstack/react-query';
import { useSession } from './auth/useSession';
import { supabase } from "@/integrations/supabase/client";
import { processRoleData, canAccessTab } from './auth/roleUtils';

export type UserRole = 'member' | 'collector' | 'admin' | null;

export const useRoleAccess = () => {
  const { data: session } = useSession();

  const { data: userRole, isLoading: roleLoading, error: roleError } = useQuery({
    queryKey: ['userRole', session?.user?.id],
    queryFn: async () => {
      if (!session?.user) return null;

      console.log('[Role Debug] Fetching roles for user:', session.user.id);
      
      // Special case for admin
      if (session.user.user_metadata?.member_number === 'TM10003') {
        console.log('[Role Debug] Special access granted for TM10003');
        return 'admin' as UserRole;
      }

      const { data: roleData, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id);

      if (error) {
        console.error('[Role Debug] Error fetching roles:', error);
        throw error;
      }

      const role = processRoleData(roleData);
      console.log('[Role Debug] Processed role:', role);
      return role;
    },
    enabled: !!session?.user?.id,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  const hasRole = (role: UserRole): boolean => {
    return userRole === role;
  };

  const checkTabAccess = (tab: string): boolean => {
    const isTM10003 = session?.user?.user_metadata?.member_number === 'TM10003';
    return canAccessTab(userRole, tab, isTM10003);
  };

  return {
    userRole,
    roleLoading,
    error: roleError,
    hasRole,
    canAccessTab: checkTabAccess
  };
};