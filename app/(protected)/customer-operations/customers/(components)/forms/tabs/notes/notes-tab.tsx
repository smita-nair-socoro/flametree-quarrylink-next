'use client';

import * as React from 'react';
import { format } from 'date-fns';
import {
  Clock,
  Pencil,
  Trash2,
  Send,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Spinner } from '@/components/ui/spinner';
import { useUserStore } from '@/app/stores/user-store';
import { getAvatarColor, getInitials } from '@/lib/utils/user-helper';
import {
  CustomerNotesQueryOptions,
  useCreateCustomerNote,
  useUpdateCustomerNote,
  useDeleteCustomerNote,
} from '@/lib/api/customer';
import type { CustomerNoteDTO } from '@/lib/types/customer';
import { notifyError, notifySuccess } from '@/lib/toast';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';
import { formatCalendarDate } from '@/lib/utils/date';

const NOTES_PAGE_SIZE = 5;

interface NotesTabProps {
  customerId?: number;
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
  customerId = 0,
}: Readonly<NotesTabProps>) {
  const currentUserName = useUserStore((state) => state.userName) || 'You';

  const [page, setPage] = React.useState(0);
  const [draft, setDraft] = React.useState('');
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [editDraft, setEditDraft] = React.useState('');
  const [deleteTarget, setDeleteTarget] = React.useState<CustomerNoteDTO | null>(
    null,
  );

  const {
    data: notesPage,
    isPending,
    isFetching,
    isError,
  } = useQuery(
    CustomerNotesQueryOptions(customerId, {
      page,
      pageSize: NOTES_PAGE_SIZE,
    }),
  );

  const createNote = useCreateCustomerNote();
  const updateNote = useUpdateCustomerNote();
  const deleteNote = useDeleteCustomerNote();

  const notes = notesPage?.content ?? [];
  const totalElements = notesPage?.totalElements ?? 0;
  const totalPages = Math.max(notesPage?.totalPages ?? 0, 1);
  const isMutating =
    createNote.isPending || updateNote.isPending || deleteNote.isPending;

  React.useEffect(() => {
    if (!notesPage) return;
    const maxPage = Math.max((notesPage.totalPages ?? 1) - 1, 0);
    if (page > maxPage) setPage(maxPage);
  }, [notesPage, page]);

  const handleAddNote = async () => {
    const trimmed = draft.trim();
    if (!trimmed || !customerId) return;

    try {
      await createNote.mutateAsync({
        customerId,
        data: { body: trimmed, authorName: currentUserName },
      });
      setDraft('');
      setPage(0);
      notifySuccess('Note added');
    } catch (error) {
      notifyError(extractErrorMessage(error) || 'Failed to add note');
    }
  };

  const startEdit = (note: CustomerNoteDTO) => {
    setEditingId(note.id);
    setEditDraft(note.body);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft('');
  };

  const saveEdit = async () => {
    const trimmed = editDraft.trim();
    if (!trimmed || editingId == null || !customerId) {
      cancelEdit();
      return;
    }

    try {
      await updateNote.mutateAsync({
        customerId,
        noteId: editingId,
        data: { body: trimmed },
      });
      cancelEdit();
      notifySuccess('Note updated');
    } catch (error) {
      notifyError(extractErrorMessage(error) || 'Failed to update note');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || !customerId) return;

    try {
      await deleteNote.mutateAsync({
        customerId,
        noteId: deleteTarget.id,
      });
      setDeleteTarget(null);
      notifySuccess('Note deleted');
    } catch (error) {
      notifyError(extractErrorMessage(error) || 'Failed to delete note');
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300 relative rounded-md border mb-10">
      {isPending && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-white/50">
          <Spinner size="medium" />
        </div>
      )}

      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Notes</span>
          <Badge variant="secondary" className="rounded-full px-2 font-normal">
            {totalElements}
          </Badge>
        </div>
      </div>

      <div className="flex items-start gap-3 border-b px-4 py-4">
        <NoteAvatar name={currentUserName} />
        <div className="flex-1">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a note..."
            className="min-h-20 w-full"
            disabled={isMutating}
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
              disabled={!draft.trim() || createNote.isPending || !customerId}
              onClick={handleAddNote}
            >
              {createNote.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Add note
            </Button>
          </div>
        </div>
      </div>

      <div>
        {isError && (
          <div className="px-4 py-8 text-center text-sm text-destructive">
            Failed to load notes. Please try again.
          </div>
        )}
        {!isError && !isPending && notes.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            No notes yet.
          </div>
        )}
        {notes.map((note) => {
          const isEditingNote = editingId === note.id;
          return (
            <div
              key={note.id}
              className="flex items-start gap-3 border-b px-4 py-4 last:border-b-0"
            >
              <NoteAvatar name={note.authorName} />
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-sm flex items-center gap-2">
                    <span className="font-semibold">{note.authorName}</span>{' '}
                    <span className="text-muted-foreground">
                      {formatCalendarDate(
                        note.edited ? note.updatedAt : note.createdAt,
                      )}
                    </span>
                    {note.edited && (
                      <span className="italic text-muted-foreground">
                        {' '}
                        (edited)
                      </span>
                    )}
                  </div>
                  {!isEditingNote && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(note)}
                        disabled={isMutating}
                      >
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(note)}
                        aria-label="Delete note"
                        disabled={isMutating}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
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
                          void saveEdit();
                        } else if (e.key === 'Escape') {
                          e.preventDefault();
                          cancelEdit();
                        }
                      }}
                      className="min-h-16 w-full"
                      disabled={updateNote.isPending}
                    />
                    <div className="mt-3 flex items-center justify-end gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={cancelEdit}
                        disabled={updateNote.isPending}
                      >
                        <X className="h-3.5 w-3.5" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="gap-1.5"
                        disabled={!editDraft.trim() || updateNote.isPending}
                        onClick={saveEdit}
                      >
                        {updateNote.isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}
                        Save
                      </Button>
                    </div>
                    <span className="mt-4 block text-xs text-muted-foreground">
                      Cmd/Ctrl + Enter to save, Esc to cancel.
                    </span>
                  </div>
                ) : (
                  <p className="mt-1 text-sm whitespace-pre-wrap">{note.body}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {totalElements > 0 && (
        <div className="flex items-center justify-between gap-3 border-t px-4 py-3">
          <p className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
            {isFetching && !isPending ? (
              <Loader2 className="ml-2 inline h-3.5 w-3.5 animate-spin" />
            ) : null}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              disabled={page <= 0 || isFetching}
              onClick={() => setPage((p) => Math.max(p - 1, 0))}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              disabled={page >= totalPages - 1 || isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

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
