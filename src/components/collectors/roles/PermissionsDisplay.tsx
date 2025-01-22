import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Permission {
  name: string;
  granted: boolean;
}

interface PermissionsDisplayProps {
  permissions: Record<string, boolean>;
}

export const PermissionsDisplay = ({ permissions }: PermissionsDisplayProps) => {
  return (
    <div className="space-y-1">
      {Object.entries(permissions).map(([name, granted]) => (
        <Badge 
          key={name}
          variant="outline"
          className={cn(
            "mr-1 mb-1",
            granted ? "bg-green-500/10 text-green-500" : "bg-gray-500/10 text-gray-500"
          )}
        >
          {name}
        </Badge>
      ))}
    </div>
  );
};