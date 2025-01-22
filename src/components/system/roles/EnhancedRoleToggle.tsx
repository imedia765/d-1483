import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EnhancedRoleToggleProps {
  roleName: string;
  isActive: boolean;
  onToggle: (isActive: boolean) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const EnhancedRoleToggle = ({
  roleName,
  isActive,
  onToggle,
  isLoading = false,
  disabled = false
}: EnhancedRoleToggleProps) => {
  return (
    <div className="flex items-center space-x-2">
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin text-dashboard-accent1" />
      ) : (
        <Switch
          checked={isActive}
          onCheckedChange={onToggle}
          disabled={disabled}
          className={cn(
            "data-[state=checked]:bg-dashboard-accent1",
            "data-[state=unchecked]:bg-dashboard-card",
            "focus:ring-dashboard-accent1"
          )}
        />
      )}
      <Label className="text-dashboard-text hover:text-white transition-colors">
        {roleName}
      </Label>
    </div>
  );
};

export default EnhancedRoleToggle;