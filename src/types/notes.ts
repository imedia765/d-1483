export type NoteType = 'admin' | 'payment' | 'general';

export interface MemberNote {
  id: string;
  member_id: string;
  note_text: string | null;
  note_type: NoteType;
  created_at: string;
  updated_at: string;
}