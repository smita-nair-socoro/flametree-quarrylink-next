'use client';

import React from 'react';
import { FormDialog } from '@/components/form-dialog';
import InviteUserForm from '../forms/invite-user-form';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function TeamAdminTab() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h2 className="text-[24px] font-bold">Team Management</h2>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <FormDialog
            contentClass="px-2 mx-2"
            dialogTitle="Invite User"
            dialogDescription="Send an invitation to a new team member with their assigned role and contact information."
            buttonTitle="Invite User"
            dialogWidth="max-w-md"
          >
            <InviteUserForm />
          </FormDialog>
        </div>
      </div>
      <p className="text-muted-foreground">
        Team member table will be displayed here
      </p>
    </div>
  );
}
