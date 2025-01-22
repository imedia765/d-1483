import { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Collector } from "@/types/collector";
import { Database } from "@/integrations/supabase/types";

type UserRole = Database['public']['Enums']['app_role'];

interface RoleAccessColumnProps {
  collector: Collector;
  onRoleUpdate: (role: UserRole, action: 'add' | 'remove') => Promise<void>;
}

export const RoleAccessColumn = ({ collector, onRoleUpdate }: RoleAccessColumnProps) => {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  const handleRoleUpdate = async (role: UserRole, action: 'add' | 'remove') => {
    setIsUpdating(role);
    try {
      await onRoleUpdate(role, action);
      toast({
        title: "Role updated",
        description: `Successfully ${action}ed ${role} role`,
      });
    } catch (error) {
      toast({
        title: "Error updating role",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {collector.roles.map((role) => (
          <Badge 
            key={role}
            variant="outline"
            className="flex items-center gap-1 cursor-pointer hover:bg-destructive"
            onClick={() => handleRoleUpdate(role, 'remove')}
          >
            {isUpdating === role ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Shield className="h-3 w-3" />
            )}
            {role}
          </Badge>
        ))}
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Shield className="mr-2 h-4 w-4" />
            Add Role
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {(['admin', 'collector', 'member'] as UserRole[]).map((role) => (
            !collector.roles.includes(role) && (
              <DropdownMenuItem
                key={role}
                onClick={() => handleRoleUpdate(role, 'add')}
                disabled={isUpdating === role}
              >
                <Shield className="mr-2 h-4 w-4" />
                {isUpdating === role ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  role
                )}
              </DropdownMenuItem>
            )
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};