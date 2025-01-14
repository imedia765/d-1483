import { supabase } from "@/integrations/supabase/client";

export const clearAuthState = async () => {
  try {
    console.log('[Auth Debug] Clearing auth state...');
    await supabase.auth.signOut({ scope: 'local' });
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear cookies
    document.cookie.split(";").forEach(c => {
      document.cookie = c.replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    console.log('[Auth Debug] Auth state cleared successfully');
  } catch (error) {
    console.error('[Auth Debug] Error clearing auth state:', error);
    throw error;
  }
};

export const verifyMember = async (memberNumber: string) => {
  console.log('[Auth Debug] Starting member verification for:', memberNumber);
  
  const { data: member, error: memberError } = await supabase
    .from('members')
    .select('id, email, status, auth_user_id')
    .eq('member_number', memberNumber.trim())
    .eq('status', 'active')
    .maybeSingle();

  if (memberError) {
    console.error('[Auth Debug] Member verification error:', memberError);
    throw memberError;
  }

  if (!member) {
    console.log('[Auth Debug] Member not found or inactive:', memberNumber);
    throw new Error('Member not found or inactive');
  }

  console.log('[Auth Debug] Member verified successfully:', member);
  return member;
};