import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from '@tanstack/react-query';
import { clearAuthState, verifyMember } from './utils/authUtils';

export const useLoginForm = () => {
  const [memberNumber, setMemberNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !memberNumber.trim()) return;
    
    try {
      setLoading(true);
      console.log('[Auth Debug] Starting login process for member:', memberNumber);

      // Check network connectivity first
      try {
        const response = await fetch('/api/health-check');
        if (!response.ok) {
          throw new Error('Network connectivity issue');
        }
      } catch (networkError) {
        console.error('[Auth Debug] Network connectivity error:', networkError);
        throw new Error('Please check your internet connection and try again.');
      }

      // Clear any existing sessions first
      await clearAuthState();
      console.log('[Auth Debug] Auth state cleared');

      // Verify member exists and get their email
      const { data: member, error: memberError } = await supabase
        .from('members')
        .select('id, email, status, auth_user_id')
        .eq('member_number', memberNumber.trim())
        .eq('status', 'active')
        .maybeSingle();

      if (memberError) {
        console.error('[Auth Debug] Member verification error:', memberError);
        if (memberError.message.includes('Failed to fetch')) {
          throw new Error('Network connection error. Please check your connection and try again.');
        }
        throw new Error('Failed to verify member');
      }

      if (!member) {
        console.log('[Auth Debug] Member not found or inactive:', memberNumber);
        throw new Error('Member not found or inactive');
      }

      if (!member.auth_user_id || !member.email) {
        console.error('[Auth Debug] Member not configured for login:', member);
        throw new Error('Member not configured for login. Please contact support.');
      }

      console.log('[Auth Debug] Member verified:', { id: member.id, email: member.email });

      // Attempt to sign in with email and member number as password
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: member.email,
        password: memberNumber,
      });

      if (signInError) {
        console.error('[Auth Debug] Sign in error:', signInError);
        if (signInError.message.includes('Failed to fetch')) {
          throw new Error('Network connection error. Please check your connection and try again.');
        }
        throw signInError;
      }

      if (!signInData.session) {
        console.error('[Auth Debug] No session established');
        throw new Error('Failed to establish session');
      }

      console.log('[Auth Debug] Session established:', signInData.session);

      // Clear any cached data
      await queryClient.cancelQueries();
      await queryClient.clear();

      toast({
        title: "Login successful",
        description: "Welcome back!",
      });

      setLoading(false);
      navigate('/', { replace: true });
      
    } catch (error: any) {
      console.error('[Auth Debug] Login error:', error);
      
      let errorMessage = 'An unexpected error occurred';
      
      if (error.message.includes('Member not found')) {
        errorMessage = 'Member number not found or inactive';
      } else if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid member number';
      } else if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message.includes('Member not configured')) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      setLoading(false);
    }
  };

  return {
    memberNumber,
    setMemberNumber,
    loading,
    handleLogin,
  };
};