import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type AppRole = Database['public']['Enums']['app_role'];

const CollectorRolesList = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: collectors, isLoading } = useQuery({
    queryKey: ['collectors-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('members_collectors')
        .select('*, user_roles!left(*)');

      if (error) throw error;
      return data;
    },
  });

  const handleRoleChange = async (userId: string, role: AppRole) => {
    try {
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        console.error('[CollectorRolesList] Delete error:', deleteError);
        throw deleteError;
      }

      const { error: insertError } = await supabase
        .from('user_roles')
        .insert([{ 
          user_id: userId, 
          role: role 
        }]);

      if (insertError) {
        console.error('[CollectorRolesList] Insert error:', insertError);
        throw insertError;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['collectors-roles'] }),
        queryClient.invalidateQueries({ queryKey: ['user-roles'] })
      ]);

      toast({
        title: "Role Updated",
        description: `User role has been updated to ${role}`,
      });
    } catch (error) {
      console.error('[CollectorRolesList] Role change error:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Collector Roles</h2>
      <ul>
        {collectors?.map(collector => (
          <li key={collector.id}>
            {collector.name}
            <button onClick={() => handleRoleChange(collector.id, 'collector')}>
              Set as Collector
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CollectorRolesList;