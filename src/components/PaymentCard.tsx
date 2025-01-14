import React from 'react';
import { Card } from './ui/card';
import { Progress } from './ui/progress';

interface PaymentCardProps {
  annualPaymentStatus: 'pending' | 'completed';
  emergencyCollectionStatus: 'pending' | 'completed';
  emergencyCollectionAmount: number;
  annualPaymentDueDate?: string;
  emergencyCollectionDueDate?: string;
  lastAnnualPaymentDate?: string;
  lastEmergencyPaymentDate?: string;
  lastAnnualPaymentAmount?: number;
  lastEmergencyPaymentAmount?: number;
  memberNumber: string;
}

const PaymentCard: React.FC<PaymentCardProps> = ({
  annualPaymentStatus,
  emergencyCollectionStatus,
  emergencyCollectionAmount,
  annualPaymentDueDate,
  emergencyCollectionDueDate,
  lastAnnualPaymentDate,
  lastEmergencyPaymentDate,
  lastAnnualPaymentAmount,
  lastEmergencyPaymentAmount,
  memberNumber
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  return (
    <Card className="p-4 space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Annual Payment</h3>
        <Progress 
          value={annualPaymentStatus === 'completed' ? 100 : 0} 
          className="mt-2"
        />
        <p className="mt-1 text-sm">
          Status: {annualPaymentStatus}
        </p>
        {lastAnnualPaymentAmount && (
          <p className="text-sm">
            Last Payment: {formatCurrency(lastAnnualPaymentAmount)}
          </p>
        )}
        <p className="text-sm">
          Due Date: {annualPaymentDueDate || 'No due date'}
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold">Emergency Collection</h3>
        <Progress 
          value={emergencyCollectionStatus === 'completed' ? 100 : 0}
          className="mt-2"
        />
        <p className="mt-1 text-sm">
          Status: {emergencyCollectionStatus}
        </p>
        {lastEmergencyPaymentAmount && (
          <p className="text-sm">
            Last Payment: {formatCurrency(lastEmergencyPaymentAmount)}
          </p>
        )}
        <p className="text-sm">
          Due Date: {emergencyCollectionDueDate || 'No due date'}
        </p>
      </div>
    </Card>
  );
};

export default PaymentCard;