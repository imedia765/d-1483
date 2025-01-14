import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import MemberProfileCard from './MemberProfileCard';
import SystemAnnouncements from './SystemAnnouncements';
import PaymentDialog from './members/PaymentDialog';
import PaymentHistoryTable from './PaymentHistoryTable';
import { useState } from 'react';

const DashboardView = () => {
  const { toast } = useToast();
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const { data: memberProfile, isError } = useQuery({
    queryKey: ['memberProfile'],
    queryFn: async () => {
      console.log('Fetching member profile...');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No user logged in');

      const { data: { user } } = await supabase.auth.getUser();
      const memberNumber = user?.user_metadata?.member_number;
      
      if (!memberNumber) {
        console.error('No member number found in user metadata');
        throw new Error('Member number not found');
      }

      console.log('Fetching member with number:', memberNumber);
      
      let query = supabase
        .from('members')
        .select('*');
      
      query = query.or(`member_number.eq.${memberNumber},auth_user_id.eq.${session.user.id}`);
      
      const { data, error } = await query.maybeSingle();

      if (error) {
        console.error('Error fetching member:', error);
        toast({
          variant: "destructive",
          title: "Error fetching member profile",
          description: error.message
        });
        throw error;
      }

      if (!data) {
        console.error('No member found with number:', memberNumber);
        toast({
          variant: "destructive",
          title: "Member not found",
          description: "Could not find your member profile"
        });
        throw new Error('Member not found');
      }
      
      return data;
    },
  });

  return (
    <div className="w-full px-2 sm:px-0 pt-[calc(6rem+1px)] lg:pt-[calc(8rem+1px)]">
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-medium mb-2 text-dashboard-softBlue">Dashboard</h1>
        <p className="text-dashboard-text">Welcome back!</p>
      </header>
      
      <div className="grid gap-4 sm:gap-6">
        <div className="overflow-hidden">
          <MemberProfileCard memberProfile={memberProfile} />
        </div>
        
        <div className="overflow-hidden">
          {memberProfile && (
            <PaymentDialog 
              isOpen={isPaymentDialogOpen}
              onClose={() => setIsPaymentDialogOpen(false)}
              memberId={memberProfile.id}
              memberNumber={memberProfile.member_number}
              memberName={memberProfile.full_name}
              collectorInfo={null}
            />
          )}
        </div>

        <div className="overflow-hidden">
          <SystemAnnouncements />
        </div>

        <div className="overflow-x-auto">
          <PaymentHistoryTable />
        </div>
      </div>
    </div>
  );
};

export default DashboardView;