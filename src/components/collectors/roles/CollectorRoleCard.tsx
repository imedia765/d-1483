import { User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CollectorRoleCardProps {
  collector: {
    name: string;
    member_number: string;
    prefix: string;
    number: string;
  };
}

const CollectorRoleCard = ({ collector }: CollectorRoleCardProps) => {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-dashboard-accent1 flex items-center justify-center text-white font-medium">
        <User className="h-5 w-5" />
      </div>
      <div>
        <p className="font-medium text-white">{collector.name}</p>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {collector.prefix}-{collector.number}
          </Badge>
          <span className="text-sm text-gray-400">#{collector.member_number}</span>
        </div>
      </div>
    </div>
  );
};

export default CollectorRoleCard;