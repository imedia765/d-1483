import { useState } from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface EnhancedRole {
  role_name: string;
  is_active: boolean;
}

interface EnhancedRoleColumnProps {
  roles: EnhancedRole[];
  onRoleUpdate: (roleName: string, isActive: boolean) => Promise<void>;
}

export const EnhancedRoleColumn = ({ roles, onRoleUpdate }: EnhancedRoleColumnProps) => {
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const { toast } = useToast();

  const handleRoleToggle = async (roleName: string, newState: boolean) => {
    setUpdatingRole(roleName);
    try {
      await onRoleUpdate(roleName, newState);
      toast({
        title: "Role updated",
        description: `${roleName} is now ${newState ? 'active' : 'inactive'}`,
      });
    } catch (error) {
      toast({
        title: "Error updating role",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setUpdatingRole(null);
    }
  };

  return (
    <div className="space-y-2">
      {roles.map((role) => (
        <div key={role.role_name} className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {updatingRole === role.role_name ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Switch
                checked={role.is_active}
                onCheckedChange={(checked) => handleRoleToggle(role.role_name, checked)}
              />
            )}
            <Label>{role.role_name}</Label>
          </div>
          <Badge
            variant={role.is_active ? "default" : "secondary"}
          >
            {role.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
      ))}
    </div>
  );
};