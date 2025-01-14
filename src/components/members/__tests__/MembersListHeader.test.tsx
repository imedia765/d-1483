import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MembersListHeader from '../MembersListHeader';
import { renderWithProviders } from '@/test/setupTests';
import type { Member } from '@/types/member';

describe('MembersListHeader Component', () => {
  const defaultProps = {
    userRole: 'admin',
    hasMembers: true,
    collectorInfo: {},
    selectedMember: undefined,
    onProfileUpdated: vi.fn(),
    onPrint: vi.fn(),
    members: [
      {
        id: '1',
        member_number: 'TEST001',
        full_name: 'Test User',
        address: '',
        admin_note: '',
        auth_user_id: '',
        collector: '',
        collector_id: '',
        cors_enabled: true,
        created_at: '',
        created_by: '',
        date_of_birth: '',
        email: '',
        emergency_collection_amount: null,
        emergency_collection_due_date: null,
        emergency_collection_status: null,
        gender: '',
        marital_status: '',
        membership_type: 'standard',
        phone: '',
        postcode: '',
        status: 'active',
        town: '',
        updated_at: '',
        verified: false,
        yearly_payment_amount: null,
        yearly_payment_due_date: null,
        yearly_payment_status: 'pending'
      } as Member,
    ],
  };

  it('renders header with title', () => {
    renderWithProviders(<MembersListHeader {...defaultProps} />);
    expect(screen.getByText('Members')).toBeInTheDocument();
  });

  it('shows export button for admin users', () => {
    renderWithProviders(<MembersListHeader {...defaultProps} />);
    expect(screen.getByText('Export Members')).toBeInTheDocument();
  });

  it('hides export button for non-admin users', () => {
    renderWithProviders(
      <MembersListHeader {...defaultProps} userRole="member" />
    );
    expect(screen.queryByText('Export Members')).not.toBeInTheDocument();
  });

  it('displays correct member count', () => {
    renderWithProviders(<MembersListHeader {...defaultProps} />);
    expect(screen.getByText('Showing 1 member')).toBeInTheDocument();
  });

  it('handles empty members list', () => {
    renderWithProviders(
      <MembersListHeader 
        {...defaultProps} 
        members={[]}
        hasMembers={false}
      />
    );
    expect(screen.queryByText(/Showing/)).not.toBeInTheDocument();
  });
});