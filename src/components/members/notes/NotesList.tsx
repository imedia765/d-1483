import { format } from 'date-fns';
import { useMemberNotes } from '@/hooks/useMemberNotes';
import { Card } from '@/components/ui/card';

interface NotesListProps {
  memberId: string;
}

const NotesList = ({ memberId }: NotesListProps) => {
  const { notes, isLoading } = useMemberNotes(memberId);

  if (isLoading) {
    return <div className="text-dashboard-text">Loading notes...</div>;
  }

  if (!notes?.length) {
    return <div className="text-dashboard-muted">No notes available</div>;
  }

  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <Card key={note.id} className="p-4 bg-dashboard-card border-dashboard-cardBorder">
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-start">
              <span className="text-sm text-dashboard-accent1">
                {format(new Date(note.created_at), 'dd/MM/yyyy HH:mm')}
              </span>
              <span className="text-xs text-dashboard-muted capitalize">
                {note.note_type}
              </span>
            </div>
            <p className="text-dashboard-text whitespace-pre-wrap">{note.note_text}</p>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default NotesList;