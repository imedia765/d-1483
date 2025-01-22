import React from 'react';
import { Button } from "@/components/ui/button";
import { Shield, RefreshCw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Collector } from '@/types/collector';
import PrintButtons from "@/components/PrintButtons";
import { Database } from "@/integrations/supabase/types";

type UserRole = Database['public']['Enums']['app_role'];

interface CollectorCardProps {
  collector: Collector;
  onRoleUpdate: (userId: string, role: UserRole, action: 'add' | 'remove') => void;
  onEnhancedRoleUpdate: (userId: string, roleName: string, isActive: boolean) => void;
  onSync: () => void;
  isSyncing: boolean;
}

const CollectorCard = ({ 
  collector, 
  onRoleUpdate, 
  onEnhancedRoleUpdate, 
  onSync,
  isSyncing 
}: CollectorCardProps) => {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-dashboard-accent1 flex items-center justify-center text-white font-medium">
          {collector.prefix}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-white">{collector.name}</p>
            <span className="text-sm text-gray-400">#{collector.number}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-dashboard-text">
            <span>Collector</span>
            <span className="text-purple-400">({collector.memberCount} members)</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Shield className="w-4 h-4 mr-2" />
              Manage Roles
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem
              onClick={() => onRoleUpdate(collector.member_number || '', 'collector', 'add')}
            >
              Add Collector Role
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onEnhancedRoleUpdate(collector.member_number || '', 'enhanced_collector', true)}
            >
              Enable Enhanced Role
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onSync}
          disabled={isSyncing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
          Sync
        </Button>

        <PrintButtons collectorName={collector.name || ''} />
        <div className={`px-3 py-1 rounded-full ${
          collector.active 
            ? 'bg-green-500/20 text-green-400' 
            : 'bg-gray-500/20 text-gray-400'
        }`}>
          {collector.active ? 'Active' : 'Inactive'}
        </div>
      </div>
    </div>
  );
};

export default CollectorCard;