import { Card, CardContent } from "@/components/ui/card";
import { Member } from "@/types/member";
import ProfileHeader from "./profile/ProfileHeader";
import ProfileAvatar from "./profile/ProfileAvatar";
import ContactInfo from "./profile/ContactInfo";
import AddressDetails from "./profile/AddressDetails";
import MembershipDetails from "./profile/MembershipDetails";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { Button } from "@/components/ui/button";
import { Edit, CreditCard, UserPlus, ChevronDown, ChevronUp } from "lucide-react";
import EditProfileDialog from "./members/EditProfileDialog";
import PaymentDialog from "./members/PaymentDialog";
import AddFamilyMemberDialog from "./members/AddFamilyMemberDialog";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import FamilyMemberCard from "./members/FamilyMemberCard";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MemberProfileCardProps {
  memberProfile: Member | null;
}

const MemberProfileCard = ({ memberProfile }: MemberProfileCardProps) => {
  const { userRole } = useRoleAccess();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showAddFamilyDialog, setShowAddFamilyDialog] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  const { data: collectorInfo } = useQuery({
    queryKey: ['collectorInfo', memberProfile?.collector],
    queryFn: async () => {
      if (!memberProfile?.collector) return null;
      
      const { data, error } = await supabase
        .from('members_collectors')
        .select('id, name, phone, prefix, number, email, active, created_at, updated_at')
        .eq('name', memberProfile.collector)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!memberProfile?.collector
  });

  const { data: familyMembers } = useQuery({
    queryKey: ['familyMembers', memberProfile?.id],
    queryFn: async () => {
      if (!memberProfile?.id) return [];
      
      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('member_id', memberProfile.id);
        
      if (error) throw error;
      return data;
    },
    enabled: !!memberProfile?.id
  });

  const { data: diagnostics } = useQuery({
    queryKey: ['memberDiagnostics', memberProfile?.id],
    queryFn: async () => {
      if (!memberProfile?.id) return null;
      
      const { data: roles } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', memberProfile.auth_user_id);

      const { data: payments } = await supabase
        .from('payment_requests')
        .select('*')
        .eq('member_id', memberProfile.id)
        .order('created_at', { ascending: false })
        .limit(5);

      return {
        roles: roles || [],
        recentPayments: payments || [],
        accountStatus: {
          isVerified: memberProfile.verified,
          hasAuthId: !!memberProfile.auth_user_id,
          membershipStatus: memberProfile.status,
          paymentStatus: memberProfile.yearly_payment_status,
        }
      };
    },
    enabled: !!memberProfile?.id && !!memberProfile?.auth_user_id
  });

  if (!memberProfile) {
    return (
      <Card className="bg-dashboard-card border-white/10 shadow-lg">
        <ProfileHeader />
        <CardContent>
          <p className="text-dashboard-text">
            Your profile has not been set up yet. Please contact an administrator.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleProfileUpdated = () => {
    window.location.reload();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="bg-dashboard-card border-white/10 shadow-lg hover:border-dashboard-accent1/50 transition-all duration-300">
        <ProfileHeader />
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-start gap-4 sm:gap-6">
            <ProfileAvatar memberProfile={memberProfile} />
            
            <div className="flex-1 space-y-4 sm:space-y-6 min-w-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-4">
                  <ContactInfo memberProfile={memberProfile} />
                  <AddressDetails memberProfile={memberProfile} />
                  
                  <div className="flex flex-col gap-2">
                    {(userRole === 'collector' || userRole === 'admin' || userRole === 'member') && (
                      <Button
                        onClick={() => setShowEditDialog(true)}
                        className="w-full bg-dashboard-accent2 hover:bg-dashboard-accent2/80 text-white transition-colors"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    )}
                    
                    <Button
                      onClick={() => setShowPaymentDialog(true)}
                      className="w-full bg-dashboard-accent1 hover:bg-dashboard-accent1/80 text-white transition-colors"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Make Payment
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <MembershipDetails 
                    memberProfile={memberProfile}
                    userRole={userRole}
                  />
                </div>
              </div>
            </div>
          </div>

          {userRole === 'admin' && (
            <div className="mt-6 border-t border-white/10 pt-4">
              <Button
                onClick={() => setShowDiagnostics(!showDiagnostics)}
                variant="ghost"
                className="w-full justify-between text-dashboard-text hover:text-white"
              >
                User Diagnostics
                {showDiagnostics ? (
                  <ChevronUp className="w-4 h-4 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-2" />
                )}
              </Button>
              
              {showDiagnostics && diagnostics && (
                <ScrollArea className="h-[300px] mt-4 rounded-md border border-white/10 p-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-dashboard-accent1 mb-2">Account Status</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-dashboard-text">Verified:</div>
                        <div className={diagnostics.accountStatus.isVerified ? "text-dashboard-accent3" : "text-dashboard-warning"}>
                          {diagnostics.accountStatus.isVerified ? "Yes" : "No"}
                        </div>
                        <div className="text-dashboard-text">Auth ID:</div>
                        <div className={diagnostics.accountStatus.hasAuthId ? "text-dashboard-accent3" : "text-dashboard-warning"}>
                          {diagnostics.accountStatus.hasAuthId ? "Linked" : "Not Linked"}
                        </div>
                        <div className="text-dashboard-text">Member Status:</div>
                        <div className="text-dashboard-accent2">{diagnostics.accountStatus.membershipStatus}</div>
                        <div className="text-dashboard-text">Payment Status:</div>
                        <div className={`${
                          diagnostics.accountStatus.paymentStatus === 'completed' 
                            ? 'text-dashboard-accent3' 
                            : 'text-dashboard-warning'
                        }`}>
                          {diagnostics.accountStatus.paymentStatus}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-dashboard-accent1 mb-2">User Roles</h4>
                      <div className="space-y-1">
                        {diagnostics.roles.map((role: any) => (
                          <div key={role.id} className="text-dashboard-text">
                            {role.role} (since {new Date(role.created_at).toLocaleDateString()})
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-dashboard-accent1 mb-2">Recent Payments</h4>
                      <div className="space-y-2">
                        {diagnostics.recentPayments.map((payment: any) => (
                          <div key={payment.id} className="text-dashboard-text flex justify-between">
                            <span>{new Date(payment.created_at).toLocaleDateString()}</span>
                            <span className="text-dashboard-accent2">${payment.amount}</span>
                            <span className={`${
                              payment.status === 'approved' 
                                ? 'text-dashboard-accent3' 
                                : 'text-dashboard-warning'
                            }`}>
                              {payment.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Family Members Card */}
      <Card className="bg-dashboard-card border-white/10 shadow-lg hover:border-dashboard-accent1/50 transition-all duration-300">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <h3 className="text-dashboard-muted text-lg font-medium">Family Members</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddFamilyDialog(true)}
              className="bg-dashboard-accent2/10 hover:bg-dashboard-accent2/20 text-dashboard-accent2 border-dashboard-accent2/20 hover:border-dashboard-accent2/30"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Family Member
            </Button>
          </div>
          <div className="space-y-2 overflow-x-auto">
            {familyMembers?.map((familyMember) => (
              <FamilyMemberCard
                key={familyMember.id}
                name={familyMember.full_name}
                relationship={familyMember.relationship}
                dob={familyMember.date_of_birth?.toString() || null}
                gender={familyMember.gender}
                memberNumber={familyMember.family_member_number}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <EditProfileDialog
        member={memberProfile}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onProfileUpdated={handleProfileUpdated}
      />

      {showPaymentDialog && (
        <PaymentDialog
          isOpen={showPaymentDialog}
          onClose={() => setShowPaymentDialog(false)}
          memberId={memberProfile.id}
          memberNumber={memberProfile.member_number}
          memberName={memberProfile.full_name}
          collectorInfo={collectorInfo}
        />
      )}

      <AddFamilyMemberDialog
        member={memberProfile}
        open={showAddFamilyDialog}
        onOpenChange={setShowAddFamilyDialog}
        onFamilyMemberAdded={handleProfileUpdated}
      />
    </div>
  );
};

export default MemberProfileCard;