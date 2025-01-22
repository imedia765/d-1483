import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type UserRole = Database['public']['Enums']['app_role'];

export const useCollectors = (page: number, itemsPerPage: number) => {
  return useQuery({
    queryKey: ['members_collectors', page],
    queryFn: async () => {
      console.log('Fetching collectors from members_collectors...');
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data: collectorsData, error: collectorsError, count } = await supabase
        .from('members_collectors')
        .select(`
          id,
          name,
          prefix,
          number,
          email,
          phone,
          active,
          created_at,
          updated_at,
          member_number
        `, { count: 'exact' })
        .order('number', { ascending: true })
        .range(from, to);
      
      if (collectorsError) {
        console.error('Error fetching collectors:', collectorsError);
        throw collectorsError;
      }

      if (!collectorsData) return { data: [], count: 0 };

      const collectorsWithCounts = await Promise.all(collectorsData.map(async (collector) => {
        const { count } = await supabase
          .from('members')
          .select('*', { count: 'exact', head: true })
          .eq('collector', collector.name);

        const { data: memberData } = await supabase
          .from('members')
          .select('auth_user_id')
          .eq('member_number', collector.member_number)
          .single();

        const { data: enhancedRoles } = await supabase
          .from('enhanced_roles')
          .select('*')
          .eq('user_id', memberData?.auth_user_id);

        const { data: syncStatus } = await supabase
          .from('sync_status')
          .select('*')
          .eq('user_id', memberData?.auth_user_id)
          .single();

        let roles: UserRole[] = [];
        if (memberData?.auth_user_id) {
          const { data: rolesData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', memberData.auth_user_id);
          roles = rolesData?.map(r => r.role as UserRole) || [];
        }

        return {
          ...collector,
          memberCount: count || 0,
          roles,
          enhanced_roles: enhancedRoles?.map(role => ({
            role_name: role.role_name,
            is_active: role.is_active || false
          })) || [],
          syncStatus
        };
      }));

      return {
        data: collectorsWithCounts,
        count: count || 0
      };
    },
  });
};