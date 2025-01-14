import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import PaymentDialog from '../members/PaymentDialog';
import { renderWithProviders } from '@/test/setupTests';
import type { Collector } from '@/types/collector';

describe('PaymentDialog Component', () => {
  const mockCollector: Collector = {
    id: 'collector-id',
    name: 'Test Collector',
    phone: '1234567890',
    prefix: 'TC',
    number: '001',
    email: 'test@collector.com',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    member_number: 'TC001'
  };

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    memberId: 'test-id',
    memberNumber: 'TEST001',
    memberName: 'Test User',
    collectorInfo: mockCollector
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders payment sections correctly', () => {
    renderWithProviders(<PaymentDialog {...defaultProps} />);
    expect(screen.getByText(/Annual Payment/i)).toBeInTheDocument();
    expect(screen.getByText(/Emergency Collection/i)).toBeInTheDocument();
  });

  it('displays correct payment status', () => {
    renderWithProviders(<PaymentDialog {...defaultProps} />);
    expect(screen.getByText('pending')).toBeInTheDocument();
  });

  it('shows completed status correctly', () => {
    renderWithProviders(<PaymentDialog {...defaultProps} />);
    expect(screen.getByText(/Make Payment/i)).toBeInTheDocument();
  });
});