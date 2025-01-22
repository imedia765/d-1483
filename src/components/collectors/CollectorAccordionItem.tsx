import React, { ReactNode } from 'react';
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Collector } from '@/types/collector';
import CollectorCard from './CollectorCard';
import CollectorMembers from '@/components/CollectorMembers';
import { Database } from "@/integrations/supabase/types";

type UserRole = Database['public']['Enums']['app_role'];

interface CollectorAccordionItemProps {
  collector: Collector;
  onRoleUpdate: (userId: string, role: UserRole, action: 'add' | 'remove') => void;
  onEnhancedRoleUpdate: (userId: string, roleName: string, isActive: boolean) => void;
  onSync: () => void;
  isSyncing: boolean;
  roleManagementDropdown?: ReactNode;
}

const CollectorAccordionItem = ({
  collector,
  onRoleUpdate,
  onEnhancedRoleUpdate,
  onSync,
  isSyncing,
  roleManagementDropdown
}: CollectorAccordionItemProps) => {
  return (
    <AccordionItem
      key={collector.id}
      value={collector.id}
      className="bg-dashboard-card border border-white/10 rounded-lg overflow-hidden"
    >
      <AccordionTrigger className="px-4 py-3 hover:no-underline">
        <div className="flex items-center justify-between w-full">
          <CollectorCard
            collector={collector}
            onRoleUpdate={onRoleUpdate}
            onEnhancedRoleUpdate={onEnhancedRoleUpdate}
            onSync={onSync}
            isSyncing={isSyncing}
          />
          {roleManagementDropdown}
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="space-y-3 mt-2">
          {collector.memberCount > 0 ? (
            <CollectorMembers collectorName={collector.name || ''} />
          ) : (
            <p className="text-sm text-gray-400">No members assigned to this collector</p>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default CollectorAccordionItem;