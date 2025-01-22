import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Database } from "@/integrations/supabase/types";
import { Search, Shield, Users } from "lucide-react";
import { cn } from "@/lib/utils";

type UserRole = Database['public']['Enums']['app_role'];

interface RoleManagementHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedRole: UserRole | 'all';
  onRoleChange: (role: UserRole | 'all') => void;
  totalCount: number;
  filteredCount: number;
}

const RoleManagementHeader = ({
  searchTerm,
  onSearchChange,
  selectedRole,
  onRoleChange,
  totalCount,
  filteredCount
}: RoleManagementHeaderProps) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-dashboard-accent1" />
          <h2 className="text-xl font-semibold text-white">User Roles</h2>
        </div>
        <div className="text-sm text-dashboard-text">
          {filteredCount === totalCount ? (
            <span>Total users: {totalCount}</span>
          ) : (
            <span>Showing {filteredCount} of {totalCount} users</span>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dashboard-text w-4 h-4" />
          <Input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className={cn(
              "pl-9 bg-dashboard-card border-dashboard-cardBorder",
              "focus:ring-dashboard-accent1",
              "text-dashboard-text placeholder:text-dashboard-text/50",
              "w-full"
            )}
          />
        </div>
        <Select
          value={selectedRole}
          onValueChange={(value) => onRoleChange(value as UserRole | 'all')}
        >
          <SelectTrigger 
            className={cn(
              "w-[180px] bg-dashboard-card border-dashboard-cardBorder",
              "focus:ring-dashboard-accent1"
            )}
          >
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent className="bg-dashboard-card border-dashboard-cardBorder">
            <SelectItem value="all" className="flex items-center gap-2 text-dashboard-text hover:text-white">
              <Shield className="w-4 h-4 text-dashboard-accent1" />
              All Roles
            </SelectItem>
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
      </div>
    </div>
  );
};

export default RoleManagementHeader;