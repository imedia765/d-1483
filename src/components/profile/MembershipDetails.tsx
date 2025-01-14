import { Member } from "@/types/member";
import RoleBadge from "./RoleBadge";
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";

interface MembershipDetailsProps {
  memberProfile: Member;
  userRole: string | null;
}

type AppRole = 'admin' | 'collector' | 'member';

const MembershipDetails = ({ memberProfile, userRole }: MembershipDetailsProps) => {
  const { data: userRoles } = useQuery({
    queryKey: ['userRoles', memberProfile.auth_user_id],
    queryFn: async () => {
      if (!memberProfile.auth_user_id) return [];
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', memberProfile.auth_user_id);

      if (error) {
        console.error('Error fetching roles:', error);
        return [];
      }

      return data.map(r => r.role) as AppRole[];
    },
    enabled: !!memberProfile.auth_user_id
  });

  const getHighestRole = (roles: AppRole[]): AppRole | null => {
    if (roles?.includes('admin')) return 'admin';
    if (roles?.includes('collector')) return 'collector';
    if (roles?.includes('member')) return 'member';
    return null;
  };

  const displayRole = userRoles?.length ? getHighestRole(userRoles) : userRole;

  return (
    <div className="space-y-2">
      <p className="text-dashboard-muted text-sm">Membership Details</p>
      <div className="space-y-2">
        <div className="text-dashboard-text flex items-center gap-2">
          Status:{' '}
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            memberProfile?.status === 'active' 
              ? 'bg-dashboard-accent3/20 text-dashboard-accent3' 
              : 'bg-dashboard-muted/20 text-dashboard-muted'
          }`}>
            {memberProfile?.status || 'Pending'}
          </span>
        </div>
        {memberProfile?.collector && (
          <div className="text-dashboard-text flex items-center gap-2">
            <span className="text-dashboard-muted">Collector:</span>
            <span className="text-dashboard-accent1">{memberProfile.collector}</span>
          </div>
        )}
        <div className="text-dashboard-text flex items-center gap-2">
          <span className="text-dashboard-accent2">Type:</span>
          <span className="flex items-center gap-2">
            {memberProfile?.membership_type || 'Standard'}
            <RoleBadge role={displayRole} />
          </span>
        </div>
      </div>
    </div>
  );
};

export default MembershipDetails;