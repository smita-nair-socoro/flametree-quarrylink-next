'use client';

import React from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  ChevronRight,
  Link2Off,
  Lock,
  Mail,
  RefreshCw,
  TriangleAlert,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  CustomerFormBlockState,
  CUSTOMER_STATUS,
  ACC_SOFTWARE_SYNC_DIRECTION,
  ACC_SOFTWARE_SYNC_STATUS,
} from '@/lib/types/customer-enums';
import { CustomerDTO } from '@/lib/types/customer';
import { useAccountingSoftwareLabel } from '@/lib/utils/tenant-config-helper';

const ARCHIVE_FAILED_PREFIX = 'Archive customer failed!';
const UNARCHIVE_FAILED_PREFIX = 'Unarchive customer failed!';

/** Returns the block state for a customer, or null if the form should be editable. */
export function getCustomerFormBlockState(
  customer: CustomerDTO | null | undefined,
): CustomerFormBlockState | null {
  if (!customer) return null;

  const { customerStatus, lastAccSoftwareSyncDirection, lastAccSoftwareSyncStatus, accSoftwareNotes } = customer;
  const syncFailed = lastAccSoftwareSyncStatus === ACC_SOFTWARE_SYNC_STATUS.FAILED;

  if (customerStatus === CUSTOMER_STATUS.ARCHIVED) {
    // Accounting software unarchived the contact but QL couldn't follow; it was re-archived to stay in sync
    if (
      syncFailed &&
      lastAccSoftwareSyncDirection === ACC_SOFTWARE_SYNC_DIRECTION.ACC_SOFTWARE_TO_QL &&
      accSoftwareNotes?.startsWith(UNARCHIVE_FAILED_PREFIX)
    ) {
      return CustomerFormBlockState.UNARCHIVE_ACCOUNTING_SOFTWARE_REARCHIVED;
    }
    return CustomerFormBlockState.ARCHIVED_IN_QUARRYLINK;
  }

  if (syncFailed && accSoftwareNotes?.startsWith(ARCHIVE_FAILED_PREFIX)) {
    if (lastAccSoftwareSyncDirection === ACC_SOFTWARE_SYNC_DIRECTION.ACC_SOFTWARE_TO_QL) {
      // Accounting software archived the contact but QL couldn't mirror it due to blocking dockets/jobs
      return CustomerFormBlockState.QUARRYLINK_ARCHIVE_BLOCKED;
    }
    if (lastAccSoftwareSyncDirection === ACC_SOFTWARE_SYNC_DIRECTION.QL_TO_ACC_SOFTWARE) {
      // QL tried to archive; the accounting software rejected it; QL reverted customer back to ACTIVE
      return CustomerFormBlockState.ACCOUNTING_SOFTWARE_ARCHIVE_FAILED;
    }
  }

  return null;
}

// =============================================================================
// Banner components (one per case)
// =============================================================================

/** Case 1 — Archived in the accounting software, QL archive blocked by active dockets/jobs */
function QuarryLinkArchiveBlockedBanner({ accSoftware }: { accSoftware: string }) {
  const [optionAOpen, setOptionAOpen] = React.useState(false);
  const [optionBOpen, setOptionBOpen] = React.useState(false);

  return (
    <div className="border border-[#FECACA] bg-[#E7000B0D] rounded-md p-4 mb-4 flex flex-col gap-3">
      {/* Title row */}
      <div className="flex items-start gap-2.5">
        <Link2Off className="h-4 w-4 text-[#D42422] flex-shrink-0 mt-0.5" />
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-[#7F1D1D]">
            Archived in {accSoftware} — action required in QuarryLink
          </span>
          <p className="text-sm text-[#991B1B]">
            This contact is archived in {accSoftware}, but QuarryLink could not
            archive it here because there are still active dockets, jobs, or
            other items linked to this customer. QuarryLink cannot send an
            unarchive request back to {accSoftware} — that is not supported by
            the {accSoftware} API.
          </p>
          <p className="text-sm text-[#991B1B]">
            You have two ways to resolve this:
          </p>
        </div>
      </div>

      {/* Option A */}
      <Collapsible open={optionAOpen} onOpenChange={setOptionAOpen}>
        <div className="ml-[26px] border border-[#FECACA] rounded overflow-hidden">
          <CollapsibleTrigger className="flex items-center gap-1.5 text-sm font-semibold text-[#7F1D1D] hover:text-[#991B1B] w-full text-left bg-[#E7000B0D] px-3 pt-2 pb-1.5 transition-colors">
            <ChevronRight
              className={cn(
                'h-4 w-4 flex-shrink-0 transition-transform duration-150',
                optionAOpen && 'rotate-90',
              )}
            />
            Option A — Process pending items, then archive here
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="bg-[#E7000B0D] px-3 pt-0 pb-2.5">
              <ul className="text-sm text-[#991B1B] list-disc list-outside pl-4 space-y-1.5">
                <li>
                  Go to <strong>Dockets</strong> for this customer and either{' '}
                  <strong>invoice</strong> them (if work is complete) or{' '}
                  <strong>void / cancel</strong> any that should not proceed.
                </li>
                <li>
                  Do the same for any open <strong>Jobs</strong> or linked
                  records.
                </li>
                <li>
                  Once no blocking items remain, come back here and{' '}
                  <strong>archive this customer from QuarryLink</strong> — the
                  change will sync to {accSoftware}.
                </li>
              </ul>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Option B */}
      <Collapsible open={optionBOpen} onOpenChange={setOptionBOpen}>
        <div className="ml-[26px] border border-[#FECACA] rounded overflow-hidden">
          <CollapsibleTrigger className="flex items-center gap-1.5 text-sm font-semibold text-[#7F1D1D] hover:text-[#991B1B] w-full text-left bg-[#E7000B0D] px-3 pt-2 pb-1.5 transition-colors">
            <ChevronRight
              className={cn(
                'h-4 w-4 flex-shrink-0 transition-transform duration-150',
                optionBOpen && 'rotate-90',
              )}
            />
            Option B — Unarchive the contact in {accSoftware}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="bg-[#E7000B0D] px-3 pt-0 pb-2.5">
              <ul className="text-sm text-[#991B1B] list-disc list-outside pl-4 space-y-1.5">
                <li>
                  Open the contact in {accSoftware} ↗ and manually unarchive it
                  there.
                </li>
                <li>
                  QuarryLink will receive a notification and automatically clear
                  this warning, restoring normal access.
                </li>
              </ul>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Footer */}
      <p className="ml-[26px] text-xs text-[#991B1B] border-t border-[#FECACA] pt-2.5 mt-0.5">
        While this notice is active,{' '}
        <strong>editing this customer is disabled</strong> — {accSoftware} does
        not accept updates to archived contacts. Need help identifying
        what&apos;s blocking?{' '}
        <a
          href="mailto:support@quarrylink.com.au"
          className="underline hover:no-underline"
        >
          support@quarrylink.com.au
        </a>
      </p>
    </div>
  );
}

/** Case 2 — QL archive reverted because the accounting software did not accept the change */
function AccountingSoftwareArchiveFailedBanner({ accSoftware }: { accSoftware: string }) {
  const [whyOpen, setWhyOpen] = React.useState(false);

  return (
    <div className="border border-[#FDE68A] bg-[#FFFBEB] rounded-md p-4 mb-4 flex flex-col gap-3">
      {/* Title row */}
      <div className="flex items-start gap-2.5">
        <div className="flex-shrink-0 mt-0.5 bg-[#FFFBEB] rounded-full p-1">
          <RefreshCw className="h-3.5 w-3.5 text-[#461901]" />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-[#461901]">
            Archive reverted in QuarryLink ({accSoftware} did not accept it)
          </span>
          <p className="text-sm text-[#7B3306E5]">
            You archived this customer in QuarryLink. We could not apply the
            same change in {accSoftware}, so the archive was reverted here to
            keep both systems aligned. The customer is active in QuarryLink
            again.
          </p>
        </div>
      </div>

      {/* Why this can happen */}
      <Collapsible open={whyOpen} onOpenChange={setWhyOpen}>
        <CollapsibleTrigger className="flex items-center gap-1.5 text-sm ml-[26px] text-[#7B3306] hover:text-[#78350F] w-full text-left transition-colors">
          <ChevronRight
            className={cn(
              'h-4 w-4 flex-shrink-0 transition-transform duration-150',
              whyOpen && 'rotate-90',
            )}
          />
          Why this can happen
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-2 pl-5 ml-[26px]">
            <ul className="text-sm text-[#92400E] list-disc list-outside pl-2 space-y-1.5">
              <li>Contact locked or restricted in {accSoftware}</li>
              <li>Invalid or incomplete {accSoftware} contact details</li>
              <li>
                Connection or configuration issues between QuarryLink and{' '}
                {accSoftware}
              </li>
            </ul>
            <p className="text-sm text-[#92400E] mt-2">
              In {accSoftware}, confirm the contact can be archived manually,
              check the{' '}
              <strong>integration tab</strong>, then try archiving again from
              QuarryLink.{' '}
              <a
                href="mailto:support@quarrylink.com.au"
                className="underline hover:no-underline"
              >
                support@quarrylink.com.au
              </a>{' '}
              can help investigate.
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

/** Case 3 — Accounting-software unarchive reverted because QL detected a duplicate customer */
function UnarchiveAccountingSoftwareRearchivedBanner({
  contactEmail,
  accSoftware,
}: {
  contactEmail?: string | null;
  accSoftware: string;
}) {
  return (
    <div className="border border-[#FDE68A] bg-[#FFFBEB] rounded-md p-4 mb-4 flex flex-col gap-3">
      {/* Title row */}
      <div className="flex items-start gap-2.5">
        <TriangleAlert className="h-4 w-4 text-[#461901] flex-shrink-0 mt-0.5" />
        <div className="flex flex-col gap-2">
          <span className="text-sm text-[#461901]">
            Unarchive not applied in QuarryLink ({accSoftware} was reverted)
          </span>
          <p className="text-sm text-[#7B3306E5]">
            You unarchived this contact in {accSoftware}. QuarryLink could not
            mirror the unarchive, so the change was reverted in {accSoftware}{' '}
            and the contact was re-archived there to stay in sync.
          </p>
        </div>
      </div>

      {/* Duplicate email hint */}
      {contactEmail && (
        <div className="ml-[26px] flex items-start gap-2">
          <Mail className="h-4 w-4 text-[#7B3306E5] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#7B3306E5]">
            Check for duplicate or conflicting customers (search for{' '}
            <span className="font-medium text-[#7B3306E5]">{contactEmail}</span>
            ). Resolve the conflict first, then unarchive the contact directly in
            {' '}{accSoftware} — QuarryLink will be notified automatically.
          </p>
        </div>
      )}

      {/* Support */}
      <p className="text-sm ml-[26px] text-[#7B3306E5]">
        Need help? Contact{' '}
        <a
          href="mailto:support@quarrylink.com.au"
          className="underline hover:no-underline"
        >
          support@quarrylink.com.au
        </a>
        .
      </p>

      {/* Auto-clear footer */}
      <p className="text-xs text-[#71717B] border-t border-[#E4E4E799] pt-2.5 mt-0.5 ml-[26px]">
        When the contact is unarchived in {accSoftware}, QuarryLink is notified
        and can clear this notice and any restrictions automatically.
      </p>
    </div>
  );
}

/** Case 4 — Customer is archived in QL; editing blocked; no unarchive action */
function ArchivedInQuarryLinkBanner({ accSoftware }: { accSoftware: string }) {
  return (
    <div className="border border-[#E5E7EB] bg-[#F9FAFB] rounded-md p-4 mb-4 flex flex-col gap-2">
      <div className="flex items-start gap-2.5">
        <Lock className="h-4 w-4 text-[#1E2939] flex-shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1.5">
          <span className="text-sm text-[#1E2939]">
            This customer is archived
          </span>
          <p className="text-sm text-[#1E2939]">
            Archived customers cannot be edited in QuarryLink. To make changes,
            unarchive the customer directly in {accSoftware} — QuarryLink will
            be notified automatically.
          </p>
        </div>
      </div>
      <p className="text-xs text-[#71717B] ml-[26px]">
        Unarchiving via QuarryLink is not supported because the {accSoftware}{' '}
        API does not provide an unarchive endpoint.
      </p>
    </div>
  );
}

// =============================================================================
// Main export — renders the correct banner based on block state
// =============================================================================

interface CustomerFormBlockBannerProps {
  blockState: CustomerFormBlockState;
  customer?: CustomerDTO | null;
}

export function CustomerFormBlockBanner({
  blockState,
  customer,
}: CustomerFormBlockBannerProps) {
  const accSoftware = useAccountingSoftwareLabel();
  const contactEmail =
    customer?.contactPersonEmail?.trim() ||
    customer?.businessEmail?.trim() ||
    null;

  switch (blockState) {
    case CustomerFormBlockState.QUARRYLINK_ARCHIVE_BLOCKED:
      return <QuarryLinkArchiveBlockedBanner accSoftware={accSoftware} />;
    case CustomerFormBlockState.ACCOUNTING_SOFTWARE_ARCHIVE_FAILED:
      return <AccountingSoftwareArchiveFailedBanner accSoftware={accSoftware} />;
    case CustomerFormBlockState.UNARCHIVE_ACCOUNTING_SOFTWARE_REARCHIVED:
      return (
        <UnarchiveAccountingSoftwareRearchivedBanner
          contactEmail={contactEmail}
          accSoftware={accSoftware}
        />
      );
    case CustomerFormBlockState.ARCHIVED_IN_QUARRYLINK:
      return <ArchivedInQuarryLinkBanner accSoftware={accSoftware} />;
    default:
      return null;
  }
}
