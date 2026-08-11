'use client';

import React from 'react';
import { Tab } from '@/components/ui/tabs';
import NotesTab from './tabs/notes/notes-tab';
import DetailsTab from './tabs/details/details-tab';

interface FormProps {
  id?: number;
  onSuccess?: () => void;
  onSaved?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  className?: string;
  onCancel?: () => void;
}

export default function CustomerForm({
  id,
  onCancel,
  onSaved,
  onDirtyChange,
  className,
  onSuccess,
}: Readonly<FormProps>) {
  const isEditing = Boolean(id);
  const customerId = id ?? 0;

  const detailsTabProps = {
    customerId,
    onCancel,
    onSuccess,
    onSaved,
    onDirtyChange,
    className,
  };

  if (isEditing) {
    return (
      <Tab
        tabsClassName="sticky top-0 z-10 w-fit mb-4 rounded-lg"
        tabsTriggerClassName="w-auto px-3"
        tabs={[
          {
            name: 'Details',
            content: <DetailsTab {...detailsTabProps} />,
          },
          {
            name: 'Notes',
            content: <NotesTab customerId={customerId} />,
          },
        ]}
      />
    );
  }

  return <DetailsTab {...detailsTabProps} />;
}
