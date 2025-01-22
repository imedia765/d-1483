import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PaymentMethodSelector from "./payment/PaymentMethodSelector";
import PaymentTypeSelector from "./payment/PaymentTypeSelector";
import BankDetails from "./payment/BankDetails";
import PaymentConfirmationSplash from "./payment/PaymentConfirmationSplash";
import { useState } from "react";
import { Collector } from "@/types/collector";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Phone, User, AlertCircle } from "lucide-react";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  memberNumber: string;
  memberName: string;
  collectorInfo: Collector | null;
}

const PaymentDialog = ({ 
  isOpen, 
  onClose, 
  memberId,
  memberNumber,
  memberName,
  collectorInfo 
}: PaymentDialogProps) => {
  const [selectedPaymentType, setSelectedPaymentType] = useState<string>('yearly');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'bank_transfer' | 'cash'>('bank_transfer');
  const [showSplash, setShowSplash] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentRef, setPaymentRef] = useState<string>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { hasRole } = useRoleAccess();
  const isCollector = hasRole('collector');

  console.log('Payment Dialog - Role check:', { isCollector });
  console.log('Payment Dialog - Member Info:', { memberId, memberNumber, memberName });

  const handleSubmit = async () => {
    if (!isCollector) {
      toast({
        title: "Not Authorized",
        description: "Only collectors can record payments",
        variant: "destructive"
      });
      return;
    }

    if (!collectorInfo?.id) {
      console.error('No collector information available');
      toast({
        title: "Error",
        description: "No collector information available",
        variant: "destructive"
      });
      return;
    }

    const amount = selectedPaymentType === 'yearly' ? 40 : 20;

    try {
      console.log('Submitting payment request:', {
        memberId,
        memberNumber,
        paymentType: selectedPaymentType,
        paymentMethod: selectedPaymentMethod,
        amount,
        collectorId: collectorInfo.id
      });

      const { data, error } = await supabase
        .from('payment_requests')
        .insert({
          member_id: memberId,
          member_number: memberNumber,
          payment_type: selectedPaymentType,
          payment_method: selectedPaymentMethod,
          status: 'pending',
          collector_id: collectorInfo.id,
          amount: amount
        })
        .select()
        .single();

      if (error) {
        console.error('Payment submission error:', error);
        throw error;
      }

      console.log('Payment request created:', data);
      setPaymentRef(data.id);
      setPaymentSuccess(true);
      setShowSplash(true);

      await queryClient.invalidateQueries({ queryKey: ['payment-requests'] });
      await queryClient.invalidateQueries({ queryKey: ['member-payments'] });

    } catch (error: any) {
      console.error('Error submitting payment:', error);
      setPaymentSuccess(false);
      setShowSplash(true);
      
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to submit payment request",
        variant: "destructive"
      });
    }
  };

  const handleSplashClose = () => {
    setShowSplash(false);
    onClose();
  };

  const renderMemberView = () => (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please contact your collector to make a payment. Your collector's details are shown below.
        </AlertDescription>
      </Alert>

      {collectorInfo && (
        <div className="p-4 bg-blue-50 rounded-lg space-y-3">
          <h3 className="text-lg font-medium text-blue-900">Your Collector</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-700">
              <User className="w-4 h-4" />
              <span>{collectorInfo.name}</span>
            </div>
            {collectorInfo.phone && (
              <div className="flex items-center gap-2 text-blue-700">
                <Phone className="w-4 h-4" />
                <span>{collectorInfo.phone}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="text-base sm:text-lg font-semibold text-dashboard-highlight">
        Payment Amounts:
        <ul className="mt-2 text-base font-normal">
          <li>Yearly Payment: £40.00</li>
          <li>Emergency Collection: £20.00</li>
        </ul>
      </div>
    </div>
  );

  const renderCollectorView = () => (
    <div className="space-y-4 sm:space-y-6">
      {collectorInfo && (
        <div className="p-4 bg-blue-50 rounded-lg space-y-3">
          <h3 className="text-lg font-medium text-blue-900">Recording Payment For</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-700">
              <User className="w-4 h-4" />
              <span>{memberName}</span>
            </div>
            <div className="text-sm text-blue-600">
              Member Number: {memberNumber}
            </div>
          </div>
        </div>
      )}

      <PaymentTypeSelector
        selectedPaymentType={selectedPaymentType}
        onPaymentTypeChange={setSelectedPaymentType}
      />

      <PaymentMethodSelector
        paymentMethod={selectedPaymentMethod}
        onPaymentMethodChange={setSelectedPaymentMethod}
      />

      {selectedPaymentMethod === 'bank_transfer' && (
        <BankDetails memberNumber={memberNumber} />
      )}

      <div className="text-base sm:text-lg font-semibold text-dashboard-highlight">
        Amount: £{selectedPaymentType === 'yearly' ? '40.00' : '20.00'}
      </div>

      <Button 
        onClick={handleSubmit}
        className="w-full bg-dashboard-accent1 hover:bg-dashboard-accent1/90"
      >
        Record Payment
      </Button>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-dashboard-card border-white/10 w-[95%] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-semibold text-dashboard-highlight">
            {isCollector ? 'Record Payment' : 'Payment Information'}
          </DialogTitle>
        </DialogHeader>

        {isCollector ? renderCollectorView() : renderMemberView()}

        {showSplash && (
          <PaymentConfirmationSplash
            success={paymentSuccess}
            paymentRef={paymentRef}
            amount={selectedPaymentType === 'yearly' ? 40 : 20}
            paymentType={selectedPaymentType}
            memberNumber={memberNumber}
            onClose={handleSplashClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;