import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useMemberNotes } from '@/hooks/useMemberNotes';
import { useToast } from '@/hooks/use-toast';

interface NotesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  existingNote?: string;
}

const NotesDialog = ({ isOpen, onClose, memberId, existingNote }: NotesDialogProps) => {
  const [note, setNote] = useState(existingNote || '');
  const { addNote } = useMemberNotes(memberId);
  const { toast } = useToast();

  const handleSaveNote = async () => {
    try {
      await addNote({ noteText: note, noteType: 'admin' });
      toast({
        title: "Success",
        description: "Note saved successfully",
      });
      onClose();
    } catch (err) {
      console.error('Error in handleSaveNote:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-dashboard-card border-dashboard-cardBorder">
        <DialogHeader>
          <DialogTitle className="text-dashboard-accent1">Add Admin Note</DialogTitle>
        </DialogHeader>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full h-24 bg-dashboard-card border border-dashboard-cardBorder rounded-md p-2 text-dashboard-text"
        />
        <Button onClick={handleSaveNote} className="bg-dashboard-accent1 hover:bg-dashboard-accent1/80">
          Save Note
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default NotesDialog;