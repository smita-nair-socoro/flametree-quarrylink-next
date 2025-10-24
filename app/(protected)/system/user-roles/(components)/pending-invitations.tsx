'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface PendingInvitation {
  id: number;
  email: string;
  role: string;
  invitedBy: string;
  expiresIn: string;
}

// Mock data for pending invitations
const pendingInvitationsMockData: PendingInvitation[] = [
  {
    id: 1,
    email: 'new@company.com',
    role: 'User',
    invitedBy: 'John Doe',
    expiresIn: '2 days',
  },
  {
    id: 2,
    email: 'temp@company.com',
    role: 'Manager',
    invitedBy: 'Sarah M',
    expiresIn: '5 hours',
  },
];

export default function PendingInvitations() {
  const handleResend = (invitation: PendingInvitation) => {
    // TODO: Implement resend invitation functionality
    console.log('Resend invitation to:', invitation.email);
  };

  const handleRevoke = (invitation: PendingInvitation) => {
    // TODO: Implement revoke invitation functionality
    console.log('Revoke invitation for:', invitation.email);
  };

  return (
    <div className="border border-[#E4E4E7] rounded-lg bg-white p-6">
      <h3 className="text-[24px] font-semibold mb-4">Pending Invitations</h3>
      <div className="space-y-3">
        {pendingInvitationsMockData.map((invitation) => (
          <div
            key={invitation.id}
            className="border border-gray-200 rounded-lg bg-white p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium text-[16px]">
                  {invitation.email}
                </div>
                <div className="text-[14px] text-[#4B5563] font-normal mt-1">
                  <span>Role: {invitation.role}</span>
                  <span className="mx-2">•</span>
                  <span>Invited by: {invitation.invitedBy}</span>
                  <span className="mx-2">•</span>
                  <span>Expires in {invitation.expiresIn}</span>
                </div>
              </div>
              <div className="flex gap-2 text-[14px] font-medium text-[#09090B] ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleResend(invitation)}
                >
                  Resend
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRevoke(invitation)}
                >
                  Revoke
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
