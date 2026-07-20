'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Clock, Pencil, Trash2, Send, X, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { useUserStore } from '@/app/stores/user-store';
import { getAvatarColor, getInitials } from '@/lib/utils/user-helper';

interface CustomerNote {
  id: string;
  authorName: string;
  note: string;
  createdAt: string;
  editedAt?: string;
}

interface NotesTabProps {
  customerId?: number;
  onCountChange?: (count: number) => void;
}

// Placeholder data — no backend endpoint exists for customer notes yet.
// Replace with a real query/mutation once the API is available.
const MOCK_NOTES: Omit<CustomerNote, 'id'>[] = [
  {
    authorName: 'Bec Smith',
    note: 'Called the customer to confirm pricing for the June delivery window. They are happy with the quoted rate and asked us to lock it in.',
    createdAt: '2026-07-07T23:00:00',
  },
  {
    authorName: 'Dan Carter',
    note: 'Left a voicemail about the outstanding invoice #4821. Customer mentioned they are waiting on a PO from their finance team.',
    createdAt: '2026-07-06T21:00:00',
  },
  {
    authorName: 'Bec Smith',
    note: 'Updated billing contact to finance@actinfra.gov.au per customer request.',
    createdAt: '2026-07-05T14:30:00',
  },
];

function formatNoteTimestamp(dateString: string): string {
  return format(new Date(dateString), 'd MMMM yyyy, h:mm aa');
}

function NoteAvatar({ name }: Readonly<{ name: string }>) {
  const color = getAvatarColor(name);
  const initials = getInitials(name);
  return (
    <div
      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold"
      style={{ backgroundColor: color.bg, color: color.text }}
    >
      {initials}
    </div>
  );
}

export default function NotesTab({
  customerId,
  onCountChange,
}: Readonly<NotesTabProps>) {
  const currentUserName = useUserStore((state) => state.userName) || 'You';

  const [notes, setNotes] = React.useState<CustomerNote[]>(() =>
    MOCK_NOTES.map((n, i) => ({ ...n, id: `mock-${customerId ?? 0}-${i}` })),
  );
  const [draft, setDraft] = React.useState('');
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editDraft, setEditDraft] = React.useState('');
  const [deleteTarget, setDeleteTarget] = React.useState<CustomerNote | null>(
    null,
  );

  React.useEffect(() => {
    onCountChange?.(notes.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes.length]);

  const handleAddNote = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    const newNote: CustomerNote = {
      id: `local-${Date.now()}`,
      authorName: currentUserName,
      note: trimmed,
      createdAt: new Date().toISOString(),
    };
    setNotes((prev) => [...prev, newNote]);
    setDraft('');
  };

  const startEdit = (note: CustomerNote) => {
    setEditingId(note.id);
    setEditDraft(note.note);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft('');
  };

  const saveEdit = () => {
    const trimmed = editDraft.trim();
    if (!trimmed || !editingId) {
      cancelEdit();
      return;
    }
    setNotes((prev) =>
      prev.map((n) =>
        n.id === editingId
          ? { ...n, note: trimmed, editedAt: new Date().toISOString() }
          : n,
      ),
    );
    cancelEdit();
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setNotes((prev) => prev.filter((n) => n.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300 rounded-md border mb-10">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Notes</span>
          <Badge variant="secondary" className="rounded-full px-2 font-normal">
            {notes.length}
          </Badge>
        </div>
        <div
          className="flex items-center gap-1.5 text-sm text-muted-foreground"
        >
          <Clock className="h-3.5 w-3.5" />
          Newest first
        </div>
      </div>

      {/* Composer */}
      <div className="flex items-start gap-3 border-b px-4 py-4">
        <NoteAvatar name={currentUserName} />
        <div className="flex-1">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a note..."
            className="min-h-20 w-full"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Posting as{' '}
              <span className="font-medium text-foreground">
                {currentUserName}
              </span>
            </span>
            <Button
              type="button"
              size="sm"
              className="gap-2"
              disabled={!draft.trim()}
              onClick={handleAddNote}
            >
              <Send className="h-4 w-4" />
              Add note
            </Button>
          </div>
        </div>
      </div>

      {/* Notes list */}
      <div>
        {notes.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            No notes yet.
          </div>
        )}
        {notes.map((note) => {
          // Placeholder notes use synthetic author IDs. Keep them manageable
          // until the notes API supplies real ownership data.
          const canManageNote = note.id.startsWith('mock-');
          const isEditingNote = editingId === note.id;
          return (
            <div
              key={note.id}
              className="flex items-start gap-3 border-b px-4 py-4 last:border-b-0"
            >
              <NoteAvatar name={note.authorName} />
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-sm">
                    <span className="font-semibold">{note.authorName}</span>{' '}
                    <span className="text-muted-foreground">
                      {formatNoteTimestamp(note.editedAt ?? note.createdAt)}
                    </span>
                    {note.editedAt && (
                      <span className="italic text-muted-foreground">
                        {' '}
                        (edited)
                      </span>
                    )}
                  </div>
                  {canManageNote && !isEditingNote && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                        onClick={() => startEdit(note)}
                        aria-label="Edit note"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-muted text-[#FC0000] focus-visible:bg-muted focus-visible:text-[#FC0000] active:bg-muted active:text-[#FC0000]"
                        onClick={() => setDeleteTarget(note)}
                        aria-label="Delete note"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {isEditingNote ? (
                  <div className="mt-2">
                    <Textarea
                      autoFocus
                      value={editDraft}
                      onChange={(e) => setEditDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                          e.preventDefault();
                          saveEdit();
                        } else if (e.key === 'Escape') {
                          e.preventDefault();
                          cancelEdit();
                        }
                      }}
                      className="min-h-16 w-full"
                    />
                    <div className="mt-3 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                        onClick={cancelEdit}
                      >
                        <X className="h-3.5 w-3.5" />
                        Cancel
                      </button>
                      <Button
                        type="button"
                        size="sm"
                        className="gap-1.5"
                        disabled={!editDraft.trim()}
                        onClick={saveEdit}
                      >
                        <Check className="h-3.5 w-3.5" />
                        Save
                      </Button>
                    </div>
                    <span className="mt-4 block text-xs text-muted-foreground">
                      Cmd/Ctrl + Enter to save, Esc to cancel.
                    </span>
                  </div>
                ) : (
                  <p className="mt-1 text-sm">{note.note}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChangeAction={(open) => !open && setDeleteTarget(null)}
        title="Delete note?"
        description={`This will permanently remove the note by ${deleteTarget?.authorName ?? ''}. This action cannot be undone.`}
        btnVariant="destructive"
        onConfirmAction={confirmDelete}
      />
    </div>
  );
}
