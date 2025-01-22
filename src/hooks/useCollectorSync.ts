import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useCollectorSync = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      console.log('Starting role sync...');
      const { error } = await supabase.rpc('perform_user_roles_sync');
      
      if (error) {
        console.error('Role sync error:', error);
        throw error;
      }

      console.log('Role sync completed successfully');
      return { success: true };
    },
    meta: {
      onSuccess: () => {
        // Invalidate all related queries
        Promise.all([
          queryClient.invalidateQueries({ queryKey: ['collectors-roles'] }),
          queryClient.invalidateQueries({ queryKey: ['userRoles'] }),
          queryClient.invalidateQueries({ queryKey: ['roleSyncStatus'] })
        ]).then(() => {
          console.log('All queries invalidated after successful sync');
        });

        toast({
          title: "Roles synchronized",
          description: "User roles have been synchronized successfully.",
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
};