import { ScrollArea } from "@/components/ui/scroll-area";
import UserRoleCard from "../UserRoleCard";
import { Database } from "@/integrations/supabase/types";

type UserRole = Database['public']['Enums']['app_role'];

interface RoleManagementContentProps {
  users: any[];
  isLoading: boolean;
  page: number;
  searchTerm: string;
  handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  handleRoleChange: (userId: string, newRole: UserRole) => Promise<void>;
}

const RoleManagementContent = ({
  users,
  isLoading,
  handleScroll,
  handleRoleChange
}: RoleManagementContentProps) => {
  return (
    <ScrollArea 
      className="h-[calc(100vh-16rem)]"
      onScroll={handleScroll}
    >
      <div className="space-y-4 p-1">
        {users?.map((user) => (
          <UserRoleCard
            key={user.id}
            user={user}
            onRoleChange={handleRoleChange}
          />
        ))}
        {isLoading && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dashboard-accent1" />
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default RoleManagementContent;