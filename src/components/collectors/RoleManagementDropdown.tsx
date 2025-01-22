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
  currentRoles: UserRole[];
  onRoleUpdate: (role: UserRole, action: 'add' | 'remove') => void;
  disabled?: boolean;
}

const RoleManagementDropdown = ({
  currentRoles,
  onRoleUpdate,
  disabled = false
}: RoleManagementDropdownProps) => {
  const { toast } = useToast();

  const handleRoleUpdate = async (role: UserRole, action: 'add' | 'remove') => {
    try {
      await onRoleUpdate(role, action);
      toast({
        title: `Role ${action === 'add' ? 'added' : 'removed'}`,
        description: `Successfully ${action === 'add' ? 'added' : 'removed'} ${role} role.`,
      });
    } catch (error) {
      toast({
        title: "Error updating role",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          disabled={disabled}
          className="h-8 w-8 p-0"
        >
          <Shield className="h-4 w-4" />
          <span className="sr-only">Open role menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem
          onClick={() => handleRoleUpdate('collector', currentRoles.includes('collector') ? 'remove' : 'add')}
        >
          <Shield className="mr-2 h-4 w-4" />
          {currentRoles.includes('collector') ? 'Remove Collector' : 'Add Collector'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default RoleManagementDropdown;