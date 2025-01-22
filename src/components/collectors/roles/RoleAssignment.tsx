import { Button } from "@/components/ui/button";
import { UserRole } from "@/types/collector-roles";

interface RoleAssignmentProps {
  userId: string;
  currentRoles: UserRole[];
  onRoleChange: (userId: string, role: UserRole) => void;
}

export const RoleAssignment = ({ userId, currentRoles, onRoleChange }: RoleAssignmentProps) => {
  const availableRoles: UserRole[] = ['admin', 'collector', 'member'];

  return (
    <div className="flex gap-2">
      {availableRoles.map((role) => (
        <Button
          key={role}
          variant={currentRoles.includes(role) ? 'default' : 'outline'}
          onClick={() => onRoleChange(userId, role)}
          className={`
            ${currentRoles.includes(role) 
              ? 'bg-dashboard-accent1 hover:bg-dashboard-accent1/90' 
              : 'border-dashboard-accent1/20 hover:border-dashboard-accent1/40'
            }
          `}
        >
          {role}
        </Button>
      ))}
    </div>
  );
};