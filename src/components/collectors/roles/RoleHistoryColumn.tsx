import { useState } from 'react';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, Clock } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface RoleHistoryEntry {
  role: string;
  timestamp: string;
  changedBy?: string;
}

interface RoleHistoryColumnProps {
  history: RoleHistoryEntry[];
}

export const RoleHistoryColumn = ({ history }: RoleHistoryColumnProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-between">
          Role History
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2">
        {history.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            <Badge variant="outline">{entry.role}</Badge>
            <span>{format(new Date(entry.timestamp), 'PPp')}</span>
            {entry.changedBy && (
              <span className="text-muted-foreground">by {entry.changedBy}</span>
            )}
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};