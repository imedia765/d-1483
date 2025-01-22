import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import PrintButtons from "@/components/PrintButtons";
import PaginationControls from './ui/pagination/PaginationControls';
import { useCollectorSync } from '@/hooks/useCollectorSync';
import { useCollectorRoles } from '@/hooks/useCollectorRoles';
import { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import CollectorsTable from './collectors/CollectorsTable';
import { useCollectors } from './collectors/useCollectors';

type UserRole = Database['public']['Enums']['app_role'];

const ITEMS_PER_PAGE = 10;

const CollectorsList = () => {
  const [page, setPage] = useState(1);
  const syncRolesMutation = useCollectorSync();
  const { updateRoleMutation, updateEnhancedRoleMutation } = useCollectorRoles();
  const { toast } = useToast();

  const { data: allMembers } = useQuery({
    queryKey: ['all_members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('member_number', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: paymentsData, isLoading: collectorsLoading, error: collectorsError } = useCollectors(page, ITEMS_PER_PAGE);

  const collectors = paymentsData?.data || [];
  const totalPages = Math.ceil((paymentsData?.count || 0) / ITEMS_PER_PAGE);

  const handleRoleUpdate = async (collector: any, role: UserRole, action: 'add' | 'remove') => {
    try {
      await updateRoleMutation.mutateAsync({ 
        userId: collector.member_number || '', 
        role, 
        action 
      });
      
      // Trigger role sync after role update
      await syncRolesMutation.mutateAsync();
      
      toast({
        title: "Role updated",
        description: `Successfully ${action}ed ${role} role for ${collector.name}`,
      });
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Error updating role",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  const handleEnhancedRoleUpdate = async (collector: any, roleName: string, isActive: boolean) => {
    try {
      await updateEnhancedRoleMutation.mutateAsync({
        userId: collector.member_number || '',
        roleName,
        isActive
      });
      
      // Trigger role sync after enhanced role update
      await syncRolesMutation.mutateAsync();
      
      toast({
        title: "Enhanced role updated",
        description: `Successfully updated ${roleName} for ${collector.name}`,
      });
    } catch (error) {
      toast({
        title: "Error updating enhanced role",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  const handleSync = async () => {
    try {
      await syncRolesMutation.mutateAsync();
      toast({
        title: "Sync completed",
        description: "Roles have been synchronized successfully",
      });
    } catch (error) {
      console.error('Error syncing roles:', error);
      toast({
        title: "Error syncing roles",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  if (collectorsLoading) return <div className="text-center py-4">Loading collectors...</div>;
  if (collectorsError) return <div className="text-center py-4 text-red-500">Error loading collectors: {collectorsError.message}</div>;
  if (!collectors?.length) return <div className="text-center py-4">No collectors found</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Collectors Management</h2>
        <PrintButtons allMembers={allMembers} />
      </div>

      <CollectorsTable
        collectors={collectors}
        onRoleUpdate={handleRoleUpdate}
        onEnhancedRoleUpdate={handleEnhancedRoleUpdate}
        onSync={handleSync}
        isSyncing={syncRolesMutation.isPending}
      />

      {totalPages > 1 && (
        <div className="py-4">
          <PaginationControls
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};

export default CollectorsList;