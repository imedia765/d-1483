import { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import CollectorMemberPayments from '../CollectorMemberPayments';
import MembersListContent from './MembersListContent';
import { DashboardTabs, DashboardTabsList, DashboardTabsTrigger, DashboardTabsContent } from "@/components/ui/dashboard-tabs";
import CollectorPaymentSummary from '@/components/CollectorPaymentSummary';
import RoleBasedRenderer from '@/components/RoleBasedRenderer';
import NotesList from '../notes/NotesList';

interface MembersListViewProps {
  searchTerm: string;
  userRole: string | null;
  collectorInfo: any;
}

const MembersListView = ({ searchTerm, userRole, collectorInfo }: MembersListViewProps) => {
  const [page, setPage] = useState(1);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const ITEMS_PER_PAGE = 20;

  const { data: membersData, isLoading } = useQuery({
    queryKey: ['members', searchTerm, userRole, page, collectorInfo?.name],
    queryFn: async () => {
      console.log('Fetching members with search term:', searchTerm);
      console.log('Collector info:', collectorInfo);
      
      // First get total count
      let countQuery = supabase
        .from('members')
        .select('*', { count: 'exact', head: true });
      
      if (searchTerm) {
        countQuery = countQuery.or(`full_name.ilike.%${searchTerm}%,member_number.ilike.%${searchTerm}%,collector.ilike.%${searchTerm}%`);
      }

      // If user is a collector, only show their assigned members
      if (userRole === 'collector' && collectorInfo?.name) {
        countQuery = countQuery.eq('collector', collectorInfo.name);
      }
      
      const { count } = await countQuery;
      const totalCount = count || 0;
      
      // Calculate safe pagination values
      const maxPage = Math.ceil(totalCount / ITEMS_PER_PAGE);
      const safePage = Math.min(page, maxPage);
      const safeOffset = (safePage - 1) * ITEMS_PER_PAGE;
      
      // Fetch paginated data
      let query = supabase
        .from('members')
        .select('*');
      
      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,member_number.ilike.%${searchTerm}%,collector.ilike.%${searchTerm}%`);
      }

      // If user is a collector, only show their assigned members
      if (userRole === 'collector' && collectorInfo?.name) {
        query = query.eq('collector', collectorInfo.name);
      }
      
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range(safeOffset, safeOffset + ITEMS_PER_PAGE - 1);
      
      if (error) throw error;
      
      return {
        members: data,
        totalCount,
        currentPage: safePage
      };
    },
  });

  // Separate query for members with notes
  const { data: membersWithNotes } = useQuery({
    queryKey: ['members-with-notes', searchTerm, userRole],
    queryFn: async () => {
      let notesQuery = supabase
        .from('members')
        .select('*')
        .not('admin_note', 'is', null);

      if (searchTerm) {
        notesQuery = notesQuery.or(`full_name.ilike.%${searchTerm}%,member_number.ilike.%${searchTerm}%,collector.ilike.%${searchTerm}%`);
      }

      if (userRole === 'collector' && collectorInfo?.name) {
        notesQuery = notesQuery.eq('collector', collectorInfo.name);
      }

      const { data } = await notesQuery;
      return data;
    },
    enabled: userRole === 'admin' // Only fetch for admin users
  });

  return (
    <DashboardTabs defaultValue="members" className="w-full">
      <DashboardTabsList className="w-full grid grid-cols-1 sm:grid-cols-3 gap-0">
        {userRole === 'collector' && (
          <>
            <DashboardTabsTrigger value="summary">Summary</DashboardTabsTrigger>
            <DashboardTabsTrigger value="payments">Payments</DashboardTabsTrigger>
          </>
        )}
        <DashboardTabsTrigger value="members">Members List</DashboardTabsTrigger>
        <RoleBasedRenderer allowedRoles={['admin']}>
          <DashboardTabsTrigger value="notes">Notes</DashboardTabsTrigger>
        </RoleBasedRenderer>
      </DashboardTabsList>

      {userRole === 'collector' && collectorInfo && (
        <>
          <DashboardTabsContent value="summary">
            <CollectorPaymentSummary collectorName={collectorInfo.name} />
          </DashboardTabsContent>

          <DashboardTabsContent value="payments">
            <CollectorMemberPayments collectorName={collectorInfo.name} />
          </DashboardTabsContent>
        </>
      )}

      <DashboardTabsContent value="members">
        <MembersListContent
          members={membersData?.members || []}
          isLoading={isLoading}
          userRole={userRole}
          currentPage={page}
          totalPages={Math.ceil((membersData?.totalCount || 0) / ITEMS_PER_PAGE)}
          onPageChange={setPage}
          onPaymentClick={(id) => setSelectedMemberId(id)}
          onEditClick={(id) => setSelectedMemberId(id)}
        />
      </DashboardTabsContent>

      <RoleBasedRenderer allowedRoles={['admin']}>
        <DashboardTabsContent value="notes">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {membersWithNotes?.map(member => (
                <div key={member.id} className="space-y-4">
                  <div className="bg-dashboard-card p-4 rounded-lg border border-dashboard-cardBorder hover:border-dashboard-accent1 transition-colors">
                    <div className="flex flex-col space-y-2">
                      <div className="flex justify-between items-start border-b border-dashboard-cardBorder pb-2">
                        <span className="text-sm font-medium text-dashboard-accent1">
                          {member.full_name}
                        </span>
                        <span className="text-xs text-dashboard-muted">
                          #{member.member_number}
                        </span>
                      </div>
                      <NotesList memberId={member.id} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {(!membersWithNotes?.some(member => member.admin_note)) && (
              <div className="text-center text-dashboard-muted py-8">
                No notes available
              </div>
            )}
          </div>
        </DashboardTabsContent>
      </RoleBasedRenderer>
    </DashboardTabs>
  );
};

export default MembersListView;