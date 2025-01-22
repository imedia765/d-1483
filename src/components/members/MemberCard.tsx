import { useState } from 'react';
import { Member } from '@/types/member';
import { Collector } from "@/types/collector";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import PaymentDialog from './PaymentDialog';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';

interface MemberCardProps {
  member: Member;
  userRole: string;
  onPaymentClick: () => void;
  onEditClick: () => void;
}

const MemberCard = ({ member, userRole, onPaymentClick, onEditClick }: MemberCardProps) => {
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [note, setNote] = useState(member.admin_note || '');
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const { toast } = useToast();
  const { hasRole } = useRoleAccess();
  const isCollector = hasRole('collector');

  const { data: collectorInfo } = useQuery({
    queryKey: ['collector', member.collector],
    queryFn: async () => {
      if (!member.collector) return null;
      
      const { data: collectorData, error } = await supabase
        .from('members_collectors')
        .select('*')
        .eq('name', member.collector)
        .maybeSingle();
      
      if (error) throw error;

      // Transform the data to match the Collector type
      const collector: Collector = {
        ...collectorData,
        roles: [], // Initialize with empty array as we'll fetch roles separately
        enhanced_roles: [], // Initialize with empty array as we'll fetch enhanced roles separately
        syncStatus: undefined // Optional property
      };

      // Fetch roles if we have the collector's auth_user_id
      if (collectorData.member_number) {
        const { data: memberData } = await supabase
          .from('members')
          .select('auth_user_id')
          .eq('member_number', collectorData.member_number)
          .single();

        if (memberData?.auth_user_id) {
          const { data: rolesData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', memberData.auth_user_id);

          collector.roles = rolesData?.map(r => r.role) || [];

          // Fetch enhanced roles
          const { data: enhancedRolesData } = await supabase
            .from('enhanced_roles')
            .select('role_name, is_active')
            .eq('user_id', memberData.auth_user_id);

          collector.enhanced_roles = enhancedRolesData || [];
        }
      }

      return collector;
    },
    enabled: !!member.collector
  });

  // Fetch payment history
  const { data: paymentHistory } = useQuery({
    queryKey: ['payment-history', member.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_requests')
        .select('*')
        .eq('member_id', member.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const handleSaveNote = async () => {
    // Save note logic here
  };

  const handlePaymentClick = () => {
    if (!isCollector) {
      toast({
        title: "Not Authorized",
        description: "Only collectors can record payments",
        variant: "destructive"
      });
      return;
    }
    setIsPaymentDialogOpen(true);
  };

  return (
    <AccordionItem value={member.id} className="border-b border-white/10">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full text-left px-1">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-dashboard-accent1">{member.full_name}</h3>
            <p className="text-sm text-dashboard-muted">Member Number: {member.member_number}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={onEditClick} className="bg-dashboard-accent2 hover:bg-dashboard-accent2/80">Edit</Button>
            <Button onClick={handlePaymentClick} className="bg-dashboard-accent3 hover:bg-dashboard-accent3/80">Pay</Button>
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent>
        <div className="space-y-6 py-4">
          {/* Contact Information */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-dashboard-accent1">Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-dashboard-card p-3 rounded-lg border border-dashboard-cardBorder">
              <p className="text-sm text-dashboard-text">Email: <span className="text-white">{member.email || 'Not provided'}</span></p>
              <p className="text-sm text-dashboard-text">Phone: <span className="text-white">{member.phone || 'Not provided'}</span></p>
              <p className="text-sm text-dashboard-text">Date of Birth: <span className="text-white">{member.date_of_birth ? format(new Date(member.date_of_birth), 'dd/MM/yyyy') : 'Not provided'}</span></p>
              <p className="text-sm text-dashboard-text">Gender: <span className="text-white">{member.gender || 'Not provided'}</span></p>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-dashboard-accent2">Address Details</h4>
            <div className="bg-dashboard-card p-3 rounded-lg border border-dashboard-cardBorder">
              <p className="text-sm text-dashboard-text">Street: <span className="text-white">{member.address || 'Not provided'}</span></p>
              <p className="text-sm text-dashboard-text">Town: <span className="text-white">{member.town || 'Not provided'}</span></p>
              <p className="text-sm text-dashboard-text">Postcode: <span className="text-white">{member.postcode || 'Not provided'}</span></p>
            </div>
          </div>

          {/* Payment History */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-dashboard-accent3">Payment History</h4>
            <div className="bg-dashboard-card p-3 rounded-lg border border-dashboard-cardBorder">
              {paymentHistory && paymentHistory.length > 0 ? (
                <div className="space-y-3">
                  {paymentHistory.map((payment) => (
                    <div key={payment.id} className="border-b border-dashboard-cardBorder pb-2">
                      <p className="text-sm text-dashboard-text">Amount: <span className="text-dashboard-accent3">£{payment.amount}</span></p>
                      <p className="text-sm text-dashboard-text">Date: <span className="text-white">{format(new Date(payment.created_at), 'dd/MM/yyyy')}</span></p>
                      <p className="text-sm text-dashboard-text">Status: 
                        <span className={`ml-1 ${
                          payment.status === 'completed' ? 'text-dashboard-accent3' :
                          payment.status === 'pending' ? 'text-dashboard-warning' :
                          'text-dashboard-error'
                        }`}>
                          {payment.status}
                        </span>
                      </p>
                      <p className="text-sm text-dashboard-text">Type: <span className="text-dashboard-accent2">{payment.payment_type}</span></p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-dashboard-muted">No payment history available</p>
              )}
            </div>
          </div>

          {userRole === 'admin' && (
            <div>
              <Button onClick={() => setIsNoteDialogOpen(true)} 
                     className="bg-dashboard-card hover:bg-dashboard-cardHover text-dashboard-text">
                Add Note
              </Button>
              <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
                <DialogContent className="bg-dashboard-card border-dashboard-cardBorder">
                  <DialogHeader>
                    <DialogTitle className="text-dashboard-accent1">Add Admin Note</DialogTitle>
                  </DialogHeader>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full h-24 bg-dashboard-card border border-dashboard-cardBorder rounded-md p-2 text-dashboard-text"
                  />
                  <Button onClick={handleSaveNote} className="bg-dashboard-accent1 hover:bg-dashboard-accent1/80">
                    Save Note
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
          )}

          <PaymentDialog
            isOpen={isPaymentDialogOpen}
            onClose={() => setIsPaymentDialogOpen(false)}
            memberId={member.id}
            memberNumber={member.member_number}
            memberName={member.full_name}
            collectorInfo={collectorInfo}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default MemberCard;