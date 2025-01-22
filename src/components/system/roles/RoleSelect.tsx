import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Database } from "@/integrations/supabase/types";
import { Shield, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type UserRole = Database['public']['Enums']['app_role'];

interface RoleSelectProps {
  userId: string;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const RoleSelect = ({ 
  userId, 
  currentRole, 
  onRoleChange,
  isLoading = false,
  disabled = false
}: RoleSelectProps) => {
  return (
    <Select
      value={currentRole}
      onValueChange={(value) => onRoleChange(value as UserRole)}
      disabled={disabled || isLoading}
    >
      <SelectTrigger 
        className={cn(
          "w-[140px] h-9 bg-dashboard-card border-dashboard-cardBorder",
          "hover:bg-dashboard-cardHover transition-colors",
          "focus:ring-dashboard-accent1",
          "flex items-center gap-2"
        )}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-dashboard-accent1" />
        ) : (
          <Shield className={cn(
            "w-4 h-4",
            currentRole === 'admin' && "text-dashboard-accent1",
            currentRole === 'collector' && "text-dashboard-accent2",
            currentRole === 'member' && "text-dashboard-accent3"
          )} />
        )}
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-dashboard-card border-dashboard-cardBorder">
        <SelectItem value="admin" className="flex items-center gap-2 text-dashboard-text hover:text-white">
          <Shield className="w-4 h-4 text-dashboard-accent1" />
          Admin
        </SelectItem>
        <SelectItem value="collector" className="flex items-center gap-2 text-dashboard-text hover:text-white">
          <Shield className="w-4 h-4 text-dashboard-accent2" />
          Collector
        </SelectItem>
        <SelectItem value="member" className="flex items-center gap-2 text-dashboard-text hover:text-white">
          <Shield className="w-4 h-4 text-dashboard-accent3" />
          Member
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

export default RoleSelect;