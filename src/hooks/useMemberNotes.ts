import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { NoteType } from '@/types/notes';

export const useMemberNotes = (memberId: string) => {
  const queryClient = useQueryClient();

  const { data: notes, isLoading } = useQuery({
    queryKey: ['member-notes', memberId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('member_notes')
        .select('*')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!memberId,
  });

  const addNote = useMutation({
    mutationFn: async ({ noteText, noteType }: { noteText: string; noteType: NoteType }) => {
      const { data, error } = await supabase
        .from('member_notes')
        .insert([
          {
            member_id: memberId,
            note_text: noteText,
            note_type: noteType,
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member-notes', memberId] });
    },
  });

  return {
    notes,
    isLoading,
    addNote: addNote.mutate,
    isAddingNote: addNote.isPending,
  };
};