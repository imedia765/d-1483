import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CollectorInfo, isValidRole, UserRole } from "@/types/collector-roles";

export const useCollectorsData = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['collectors-roles'],
    queryFn: async () => {
      console.log('Fetching collectors and roles data...');
      
      try {
        const { data: activeCollectors, error: collectorsError } = await supabase
          .from('members_collectors')
          .select('member_number, name, email, phone, prefix, number')
          .eq('active', true);

        if (collectorsError) throw collectorsError;

        const collectorsWithRoles = await Promise.all(
          (activeCollectors || []).map(async (collector) => {
            const { data: memberData, error: memberError } = await supabase
              .from('members')
              .select('full_name, member_number, auth_user_id')
              .eq('member_number', collector.member_number)
              .maybeSingle();

            if (memberError) throw memberError;
            if (!memberData) return null;

            const { data: roles, error: rolesError } = await supabase
              .from('user_roles')
              .select('role, created_at')
              .eq('user_id', memberData.auth_user_id)
              .order('created_at', { ascending: true });

            if (rolesError) throw rolesError;

            const typedRoles = (roles || [])
              .map(r => r.role as string)
              .filter(isValidRole);

            const typedRoleDetails = (roles || [])
              .map(r => ({
                role: r.role as string,
                created_at: r.created_at
              }))
              .filter((r): r is { role: UserRole; created_at: string } => isValidRole(r.role));

            const { data: enhancedRoles, error: enhancedError } = await supabase
              .from('enhanced_roles')
              .select('role_name, is_active')
              .eq('user_id', memberData.auth_user_id);

            if (enhancedError) throw enhancedError;

            const { data: syncStatus, error: syncError } = await supabase
              .from('sync_status')
              .select('*')
              .eq('user_id', memberData.auth_user_id)
              .maybeSingle();

            if (syncError) throw syncError;

            const collectorInfo: CollectorInfo = {
              ...memberData,
              roles: typedRoles,
              role_details: typedRoleDetails,
              email: collector.email,
              phone: collector.phone,
              prefix: collector.prefix,
              number: collector.number,
              enhanced_roles: enhancedRoles || [],
              sync_status: syncStatus || undefined
            };

            return collectorInfo;
          })
        );

        return collectorsWithRoles.filter((c): c is CollectorInfo => c !== null);
      } catch (err) {
        console.error('Error in collector roles query:', err);
        toast({
          title: "Error loading collectors",
          description: "There was a problem loading the collectors list",
          variant: "destructive",
        });
        throw err;
      }
    }
  });
};