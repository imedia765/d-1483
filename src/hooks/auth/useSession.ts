import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import type { Session } from '@supabase/supabase-js';

export const useSession = () => {
  return useQuery({
    queryKey: ['session'],
    queryFn: async (): Promise<Session | null> => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    }
  });
};