'use client';

import { ActionDialog } from '@/components/action-dialog';
import { AlertCircle, CreditCard, Mail } from 'lucide-react';
import { Role } from '@/lib/types/user-enums';
import { Separator } from '@/components/ui/separator';

interface TenantSuspendedModalProps {
  isOpen: boolean;
  onClose?: () => void;
  clientName?: string | null;
  userRole?: string | null;
}

/**
 * Modal displayed when tenant/client status is SUSPENDED
 *
 * Shows different content based on user role:
 * - SUPERADMIN/ADMIN: "Subscription Suspended" with payment details
 * - USER: "Access Denied" with instructions to contact administrator
 */
export function TenantSuspendedModal({
  isOpen,
  onClose,
  clientName,
  userRole,
}: TenantSuspendedModalProps) {
  const handleUpdatePayment = () => {
    // TODO: Implement payment update logic
    // For now, redirect to billing page or open payment modal
    console.log('Update payment method');

    // For preview purposes, allow closing the modal
    // In production, this would only close after actual payment update
    if (onClose) {
      onClose();
    }
  };

  const handleContactAdmin = () => {
    // Open email client to contact admin
    window.location.href = 'mailto:admin@acme.com?subject=Account%20Access%20Request';

    // For preview purposes, allow closing the modal
    // In production, the modal stays open until admin resolves the issue
    if (onClose) {
      onClose();
    }
  };

  // Render content for SUPERADMIN/ADMIN users
  const renderAdminContent = () => (
    <div className="space-y-4">
      {/* Suspension notice */}
      <div className="rounded-lg bg-red-50 p-4 text-sm border border-red-100">
        <p className="text-gray-700">
          Your <strong>{clientName || 'organization'}</strong> subscription has
          been suspended due to a payment issue. Update your payment method to
          restore access immediately.
        </p>
      </div>

      {/* Payment details */}
      <div className="rounded-lg bg-gray-50 p-4 space-y-3 border border-[#E5E5E5">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Last Payment Date</span>
          <span className="text-sm font-medium text-foreground">
            November 15, 2024
          </span>
        </div>
        <Separator />
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Amount Due</span>
          <span className="text-sm font-semibold text-foreground">$249.00</span>
        </div>
      </div>
    </div>
  );

  // Render content for USER role
  const renderUserContent = () => (
    <div className="space-y-4">
      {/* Access denied notice */}
      <div className="rounded-lg bg-red-50 p-4 text-sm border border-red-100">
        <p className="text-gray-700">
          Your access to <strong>{clientName || 'the organization'}</strong> has
          been suspended due to a subscription issue. Please contact your
          organisation's administrator to restore your access.
        </p>
      </div>

      {/* Instructions */}
      <div className="rounded-lg bg-[#F5F5F54D] p-4 border border-[#E5E5E5]">
        <h4 className="text-sm font-semibold text-foreground mb-3">
          What you can do:
        </h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-gray-400">•</span>
            <span>
              Contact your organisation administrator to resolve the issue
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-400">•</span>
            <span>Ask them to update the payment information</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-400">•</span>
            <span>Your account will be restored once payment is processed</span>
          </li>
        </ul>
      </div>
    </div>
  );

  // Determine if user is admin
  const isAdmin = userRole === Role.SUPERADMIN || userRole === Role.ADMIN;

  return (
    <ActionDialog
      open={isOpen}
      onOpenChangeAction={(open) => {
        // IMPORTANT: Do not allow closing the modal
        // The modal will only close when tenant status changes from SUSPENDED to active
        // This is controlled by the isOpen prop which comes from useUserValidation hook
        if (open === false) {
          return; // Prevent closing
        }
      }}
      customWidth="w-[544px]"
      description={
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-md bg-red-100">
            <AlertCircle className="h-4.5 w-4.5 text-red-600" />
          </div>
          <div className='flex flex-col'>
            <h1 className='text-xl font-semibold'>
              {isAdmin ? 'Subscription Suspended' : 'Access Denied'}
            </h1>
            <p className="text-sm text-gray-500">
            {isAdmin
              ? 'Action required to restore access'
              : 'Your account is currently suspended'}
            </p>
          </div>
        </div>
        
      }
      content={isAdmin ? renderAdminContent() : renderUserContent()}
      cancelActionNeeded={false}
      confirmText={isAdmin ? 'Update Payment Method' : 'Contact Administrator'}
      confirmVariant="default"
      confirmCustomColor="#8B5CF6"
      confirmCustomClass='text-base'
      confirmIcon={isAdmin ? <CreditCard className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
      onConfirmAction={isAdmin ? handleUpdatePayment : handleContactAdmin}
      confirmActionNeeded={true}
      cancelButtonClass="hidden"
      hideSeparator={true}
      textbelowbutton={
        isAdmin ? (
          <p className="text-xs text-center text-gray-500">
            Need help? Contact our support team at{' '}
            <a
              href="mailto:support@quarrylink.com.au"
              className="underline font-base text-black"
            >
              support@quarrylink.com.au
            </a>
          </p>
        ) : (
          <div className="text-xs text-gray-600 p-4 rounded-md bg-[#F5F5F580]">
            <div className="font-medium mb-1 text-foreground">Administrator Contact</div>
            <a
              href="mailto:admin@acme.com"
              className='text-muted-foreground'
            >
              admin@acme.com
            </a>
          </div>
        )
      }
    />
  );
}
