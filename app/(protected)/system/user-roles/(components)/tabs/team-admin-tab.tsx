'use client';

import React from 'react';
import { FormDialog } from '@/components/form-dialog';
import InviteUserForm from '../forms/invite-user-form';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function TeamAdminTab() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[24px] font-bold">Team Management</h2>
        <FormDialog
          dialogTitle="Invite User"
          dialogWidth="max-w-md"
          trigger={
            <Button className="bg-[#8E51FF] hover:bg-[#7a42e6] text-white">
              <Plus className="h-4 w-4" /> Invite User
            </Button>
          }
        >
          <InviteUserForm />
        </FormDialog>
      </div>
      <p className="text-muted-foreground">Team & Admin content goes here</p>
    </div>
  );
}
