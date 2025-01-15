import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import PaymentCard from '../PaymentCard';
import { renderWithProviders } from '@/test/setupTests';

describe('PaymentCard Component', () => {
  const defaultProps = {
    annualPaymentStatus: 'pending' as const,
    emergencyCollectionStatus: 'pending' as const,
    emergencyCollectionAmount: 100,
    annualPaymentDueDate: '2025-01-01',
    emergencyCollectionDueDate: '2025-02-01',
    lastAnnualPaymentDate: '2024-01-01',
    lastEmergencyPaymentDate: '2024-02-01',
    lastAnnualPaymentAmount: 40,
    lastEmergencyPaymentAmount: 50,
    memberNumber: 'TEST001',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders payment sections correctly', () => {
    renderWithProviders(<PaymentCard {...defaultProps} />);
    
    expect(screen.getByText(/Annual Payment/i)).toBeInTheDocument();
    expect(screen.getByText(/Emergency Collection/i)).toBeInTheDocument();
  });

  it('displays correct payment status', () => {
    renderWithProviders(<PaymentCard {...defaultProps} />);
    
    expect(screen.getByText('pending')).toBeInTheDocument();
    expect(screen.getByText('£40.00')).toBeInTheDocument();
  });

  it('shows completed status correctly', () => {
    renderWithProviders(
      <PaymentCard 
        {...defaultProps} 
        annualPaymentStatus="completed"
        emergencyCollectionStatus="completed"
      />
    );
    
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('handles missing dates gracefully', () => {
    renderWithProviders(
      <PaymentCard 
        {...defaultProps}
        annualPaymentDueDate={undefined}
        emergencyCollectionDueDate={undefined}
      />
    );
    
    expect(screen.getByText(/No due date/i)).toBeInTheDocument();
  });

  it('displays correct progress indicators', () => {
    renderWithProviders(<PaymentCard {...defaultProps} />);
    
    const progressElements = screen.getAllByRole('progressbar');
    expect(progressElements).toHaveLength(2);
  });

  it('formats currency values correctly', () => {
    renderWithProviders(
      <PaymentCard 
        {...defaultProps}
        lastAnnualPaymentAmount={99.99}
        lastEmergencyPaymentAmount={199.99}
      />
    );
    
    expect(screen.getByText('£99.99')).toBeInTheDocument();
    expect(screen.getByText('£199.99')).toBeInTheDocument();
  });
});