import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type UserRole = Database['public']['Enums']['app_role'];

interface RoleUpdateParams {
  userId: string;
  role: UserRole;
  action: 'add' | 'remove';
}

interface EnhancedRoleUpdateParams {
  userId: string;
  roleName: string;
  isActive: boolean;
}

export const useCollectorRoles = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role, action }: RoleUpdateParams) => {
      if (!userId) {
        throw new Error('User ID is required');
      }

      if (action === 'add') {
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', role);
        if (error) throw error;
      }
    },
    meta: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['collectors-roles'] });
        toast({
          title: "Role updated",
          description: "The collector's roles have been updated successfully.",
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Error updating role",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  });

  const updateEnhancedRoleMutation = useMutation({
    mutationFn: async ({ userId, roleName, isActive }: EnhancedRoleUpdateParams) => {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const { error } = await supabase
        .from('enhanced_roles')
        .upsert({
          user_id: userId,
          role_name: roleName,
          is_active: isActive,
          updated_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;
    },
    meta: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['collectors-roles'] });
        toast({
          title: "Enhanced role updated",
          description: "The collector's enhanced roles have been updated successfully.",
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Error updating enhanced role",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  });

  return {
    updateRoleMutation,
    updateEnhancedRoleMutation
  };
};