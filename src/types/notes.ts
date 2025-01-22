export type NoteType = 'admin' | 'payment' | 'general';

export interface MemberNote {
  id: string;
  member_id: string;
  note_text: string | null;
  note_type: NoteType;
  created_at: string;
  created_by: string | null;
  updated_at: string;
}