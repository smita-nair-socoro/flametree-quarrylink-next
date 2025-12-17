'use client';

import { useState } from 'react';
import { addDays, startOfToday } from 'date-fns';
import { DatePicker } from '@/components/date-picker';
import { Button } from '@/components/ui/button';
import { DownloadIcon, Eye } from 'lucide-react';
import { TenantSuspendedModal } from './(components)/tenant-suspended-modal';
import { Role } from '@/lib/types/user-enums';

export default function DashboardPage() {
  const [date, setDate] = useState<Date | undefined>();

  // State for modal preview (UI/UX testing purposes)
  const [showModal, setShowModal] = useState(false);
  const [previewRole, setPreviewRole] = useState<string>(Role.SUPERADMIN);

  return (
    <>
      {/* Tenant Suspended Modal - for UI/UX preview */}
      <TenantSuspendedModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        clientName="Acme Corporation"
        userRole={previewRole}
      />

      {/* Dashboard Content */}
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div>
            <h1 className="text-2xl">Dashboard</h1>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1">
            <DatePicker
              value={date}
              onChangeAction={setDate}
              disabled={{ before: addDays(startOfToday(), 0) }}
              placeholder="Pick a date"
            />

            <Button variant="outline" className="flex items-center">
              <DownloadIcon className="mr-1 h-4 w-4" />
              Download
            </Button>
          </div>
        </div>

        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="bg-muted/50 aspect-video rounded-xl" >
          {/* UI/UX Preview Controls */}
        <div className="bg-white border rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">Modal Preview (UI/UX Testing)</h2>
          <p className="text-sm text-muted-foreground">
            Click the buttons below to preview the suspended tenant modal for different user roles.
          </p>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setPreviewRole(Role.SUPERADMIN);
                setShowModal(true);
              }}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Preview Super Admin Modal
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setPreviewRole(Role.USER);
                setShowModal(true);
              }}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Preview User Modal
            </Button>
          </div>

          {showModal && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> The modal is currently open. In production, this modal cannot be closed
                until the tenant status changes from SUSPENDED to ACTIVE. For testing purposes, you can close it
                by clicking the action button.
              </p>
            </div>
          )}
        </div>
          </div>
          
          <div className="bg-muted/50 aspect-video rounded-xl" />
          <div className="bg-muted/50 aspect-video rounded-xl" />
        </div>

        

        <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
      </div>
    </>
  );
}
