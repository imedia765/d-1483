import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type UserRole = Database['public']['Enums']['app_role'];

export const useRoleSync = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query to fetch role sync status
  const { data: syncStatus } = useQuery({
    queryKey: ['roleSyncStatus'],
    queryFn: async () => {
      console.log('Fetching role sync status...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching roles:', error);
        throw error;
      }

      console.log('Role sync status:', {
        lastSync: roles?.[0]?.created_at,
        roles: roles?.map(r => r.role)
      });

      return {
        lastSync: roles?.[0]?.created_at || null,
        roles: roles?.map(r => r.role) || []
      };
    },
  });

  // Mutation to sync roles
  const { mutate: syncRoles } = useMutation({
    mutationFn: async (roles: UserRole[]) => {
      console.log('Starting role sync mutation...', roles);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // First, log the role change
      const { error: auditError } = await supabase.from('audit_logs').insert({
        user_id: user.id,
        operation: 'update',
        table_name: 'user_roles',
        new_values: { roles },
        severity: 'info'
      });

      if (auditError) {
        console.error('Error logging role change:', auditError);
      }

      // Then update roles
      const { error } = await supabase.rpc('perform_user_roles_sync');
      
      if (error) {
        console.error('Error performing role sync:', error);
        throw error;
      }

      console.log('Role sync completed successfully');
      return { success: true };
    },
    meta: {
      onSuccess: () => {
        // Invalidate all related queries
        Promise.all([
          queryClient.invalidateQueries({ queryKey: ['userRoles'] }),
          queryClient.invalidateQueries({ queryKey: ['roleSyncStatus'] }),
          queryClient.invalidateQueries({ queryKey: ['collectors-roles'] }),
          queryClient.invalidateQueries({ queryKey: ['collectors'] })
        ]).then(() => {
          console.log('All queries invalidated after successful sync');
        });

        toast({
          title: "Roles synchronized",
          description: "Your roles have been updated successfully.",
        });
      },
      onError: (error: Error) => {
        console.error('Role sync error:', error);
        toast({
          title: "Error syncing roles",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  });

  return {
    syncStatus,
    syncRoles
  };
};