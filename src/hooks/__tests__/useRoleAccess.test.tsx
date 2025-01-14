import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useRoleAccess } from '../useRoleAccess';
import { supabase } from "@/integrations/supabase/client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useRoleAccess Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('initializes with loading state', () => {
    const { result } = renderHook(() => useRoleAccess(), { wrapper });
    expect(result.current.roleLoading).toBe(true);
  });

  it('identifies admin access correctly', async () => {
    (supabase.auth.getSession as any).mockResolvedValue({
      data: {
        session: {
          user: { id: '123', user_metadata: { member_number: 'TM10003' } }
        }
      },
      error: null,
    });

    const { result } = renderHook(() => useRoleAccess(), { wrapper });

    await waitFor(() => {
      expect(result.current.roleLoading).toBe(false);
    });

    expect(result.current.canAccessTab('system')).toBe(true);
  });

  it('handles unauthorized access', async () => {
    (supabase.auth.getSession as any).mockResolvedValue({
      data: {
        session: {
          user: { id: '123', user_metadata: { member_number: 'TEST123' } }
        }
      },
      error: null,
    });

    const { result } = renderHook(() => useRoleAccess(), { wrapper });

    await waitFor(() => {
      expect(result.current.roleLoading).toBe(false);
    });

    expect(result.current.canAccessTab('system')).toBe(false);
  });

  it('handles session errors', async () => {
    (supabase.auth.getSession as any).mockRejectedValue(new Error('Session error'));

    const { result } = renderHook(() => useRoleAccess(), { wrapper });

    await waitFor(() => {
      expect(result.current.roleLoading).toBe(false);
    });

    expect(result.current.userRole).toBeNull();
  });

  it('updates role when session changes', async () => {
    let sessionCallback: any;
    (supabase.auth.onAuthStateChange as any).mockImplementation((callback) => {
      sessionCallback = callback;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    const { result } = renderHook(() => useRoleAccess(), { wrapper });

    await waitFor(() => {
      expect(result.current.roleLoading).toBe(false);
    });

    // Simulate session change
    await sessionCallback('SIGNED_IN', {
      user: { id: '123', user_metadata: { member_number: 'TM10003' } }
    });

    await waitFor(() => {
      expect(result.current.userRole).toBe('admin');
    });
  });
});