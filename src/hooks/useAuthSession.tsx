import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from '@tanstack/react-query';

export const useAuthSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSignOut = async (skipStorageClear = false) => {
    try {
      console.log('[Auth Debug] Starting sign out process...');
      setLoading(true);
      
      await queryClient.resetQueries();
      await queryClient.clear();
      
      if (!skipStorageClear) {
        localStorage.clear();
        sessionStorage.clear();
      }
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      console.log('[Auth Debug] Sign out successful');
      setSession(null);
      
      window.location.href = '/login';
      
    } catch (error: any) {
      console.error('[Auth Debug] Error during sign out:', error);
      toast({
        title: "Error signing out",
        description: error.message.includes('502') 
          ? "Network connection error. Please check your connection and try again."
          : error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | undefined;

    console.log('[Auth Debug] Initializing auth session...');
    
    const initializeSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[Auth Debug] Error getting session:', error);
          throw error;
        }

        if (mounted) {
          console.log('[Auth Debug] Session initialized:', {
            hasSession: !!currentSession,
            userId: currentSession?.user?.id
          });
          
          setSession(currentSession);
          setLoading(false);
        }
      } catch (error) {
        console.error('[Auth Debug] Unexpected error during session initialization:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const setupAuthListener = () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
        if (!mounted) return;

        console.log('[Auth Debug] Auth state changed:', {
          event,
          hasSession: !!currentSession,
          userId: currentSession?.user?.id
        });

        if (event === 'SIGNED_OUT') {
          setSession(null);
          queryClient.clear();
          window.location.href = '/login';
        } else if (event === 'SIGNED_IN') {
          setSession(currentSession);
          window.location.href = '/';
        } else {
          setSession(currentSession);
        }
      });

      unsubscribe = subscription.unsubscribe;
    };

    setupAuthListener();
    initializeSession();

    return () => {
      mounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [queryClient]);

  return {
    session,
    loading,
    handleSignOut
  };
};