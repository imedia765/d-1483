import { Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCollectorRoles } from "@/hooks/useCollectorRoles";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Database } from "@/integrations/supabase/types";

type UserRole = Database['public']['Enums']['app_role'];

interface RoleManagementDropdownProps {
  collector: {
    auth_user_id: string;
    roles: UserRole[];
  };
  onRoleUpdate: (role: UserRole, action: 'add' | 'remove') => void;
}

const RoleManagementDropdown = ({ collector, onRoleUpdate }: RoleManagementDropdownProps) => {
  const { toast } = useToast();
  const { updateRoleMutation } = useCollectorRoles();

  const handleRoleUpdate = async (role: UserRole, action: 'add' | 'remove') => {
    try {
      await updateRoleMutation.mutateAsync({
        userId: collector.auth_user_id,
        role,
        action
      });

      toast({
        title: `Role ${action === 'add' ? 'added' : 'removed'}`,
        description: `Successfully ${action === 'add' ? 'added' : 'removed'} ${role} role.`,
      });

      onRoleUpdate(role, action);
    } catch (error) {
      toast({
        title: "Error updating role",
        description: error instanceof Error ? error.message : "An error occurred while updating the role",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Shield className="w-4 h-4 mr-2" />
          Manage Roles
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={() => handleRoleUpdate('collector', collector.roles.includes('collector') ? 'remove' : 'add')}
        >
          {collector.roles.includes('collector') ? 'Remove Collector Role' : 'Add Collector Role'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default RoleManagementDropdown;