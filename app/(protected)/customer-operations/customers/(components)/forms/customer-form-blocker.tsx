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
import { CustomerFormBlockState, CUSTOMER_STATUS } from '@/lib/types/customer-enums';
import { CustomerDTO } from '@/lib/types/customer';

// =============================================================================
// DEV: Override block state by customer ID for UI testing.
//
// How to test each case:
//   1. Find a real customer ID in your database.
//   2. Uncomment the matching line below and replace the number with that ID.
//   3. Open that customer's profile — you will see the corresponding blocker.
//   4. Re-comment or remove when done testing.
//
//   Case 1 — XERO_ARCHIVED_QL_BLOCKED : red banner, form blocked
//   Case 2 — XERO_ARCHIVE_REVERTED    : amber banner, form blocked
//   Case 3 — XERO_UNARCHIVE_DUPLICATE : amber banner, form blocked
//   Case 4 — QL_ARCHIVED              : gray  banner, form blocked
// =============================================================================
export const DEV_BLOCK_STATE_OVERRIDES: Record<number, CustomerFormBlockState> = {
  24: CustomerFormBlockState.XERO_ARCHIVED_QL_BLOCKED,
  20: CustomerFormBlockState.XERO_ARCHIVE_REVERTED,
  15: CustomerFormBlockState.XERO_UNARCHIVE_DUPLICATE,
  19: CustomerFormBlockState.QL_ARCHIVED,
};

/** Returns the block state for a customer, or null if the form should be editable. */
export function getCustomerFormBlockState(
  customer: CustomerDTO | null | undefined,
): CustomerFormBlockState | null {
  if (!customer) return null;

  // DEV override — ID-based shortcut for local UI testing
  if (customer.id != null && DEV_BLOCK_STATE_OVERRIDES[customer.id]) {
    return DEV_BLOCK_STATE_OVERRIDES[customer.id];
  }

  // Real derivation — extend here when backend provides dedicated sync-state flags
  if (customer.customerStatus === CUSTOMER_STATUS.ARCHIVED) {
    return CustomerFormBlockState.QL_ARCHIVED;
  }

  return null;
}

// =============================================================================
// Banner components (one per case)
// =============================================================================

/** Case 1 — Archived in Xero, QL archive blocked by active dockets/jobs */
function BlockerBanner1() {
  const [optionAOpen, setOptionAOpen] = React.useState(false);
  const [optionBOpen, setOptionBOpen] = React.useState(false);

  return (
    <div className="border border-[#FECACA] bg-[#FEF2F2] rounded-md p-4 mb-4 flex flex-col gap-3">
      {/* Title row */}
      <div className="flex items-start gap-2.5">
        <Link2Off className="h-4 w-4 text-[#DC2626] flex-shrink-0 mt-0.5" />
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-[#7F1D1D]">
            Archived in Xero — action required in QuarryLink
          </span>
          <p className="text-sm text-[#991B1B]">
            This contact is archived in Xero, but QuarryLink could not archive it here
            because there are still active dockets, jobs, or other items linked to this
            customer. QuarryLink cannot send an unarchive request back to Xero — that is
            not supported by the Xero API.
          </p>
          <p className="text-sm text-[#991B1B]">You have two ways to resolve this:</p>
        </div>
      </div>

      {/* Option A */}
      <Collapsible open={optionAOpen} onOpenChange={setOptionAOpen}>
        <CollapsibleTrigger className="flex items-center gap-1.5 text-sm font-semibold text-[#7F1D1D] hover:text-[#991B1B] w-full text-left border border-[#FECACA] bg-white rounded px-3 py-2 transition-colors">
          <ChevronRight
            className={cn('h-4 w-4 flex-shrink-0 transition-transform duration-150', optionAOpen && 'rotate-90')}
          />
          Option A — Process pending items, then archive here
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-1 border border-[#FECACA] bg-white rounded px-3 py-2.5">
            <ul className="text-sm text-[#991B1B] list-disc list-outside pl-4 space-y-1.5">
              <li>
                Go to <strong>Dockets</strong> for this customer and either{' '}
                <strong>invoice</strong> them (if work is complete) or{' '}
                <strong>void / cancel</strong> any that should not proceed.
              </li>
              <li>
                Do the same for any open <strong>Jobs</strong> or linked records.
              </li>
              <li>
                Once no blocking items remain, come back here and{' '}
                <strong>archive this customer from QuarryLink</strong> — the change will
                sync to Xero.
              </li>
            </ul>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Option B */}
      <Collapsible open={optionBOpen} onOpenChange={setOptionBOpen}>
        <CollapsibleTrigger className="flex items-center gap-1.5 text-sm font-semibold text-[#7F1D1D] hover:text-[#991B1B] w-full text-left border border-[#FECACA] bg-white rounded px-3 py-2 transition-colors">
          <ChevronRight
            className={cn('h-4 w-4 flex-shrink-0 transition-transform duration-150', optionBOpen && 'rotate-90')}
          />
          Option B — Unarchive the contact in Xero
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-1 border border-[#FECACA] bg-white rounded px-3 py-2.5">
            <ul className="text-sm text-[#991B1B] list-disc list-outside pl-4 space-y-1.5">
              <li>
                Open the contact in Xero ↗ and manually unarchive it there.
              </li>
              <li>
                QuarryLink will receive a notification and automatically clear this
                warning, restoring normal access.
              </li>
            </ul>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Footer */}
      <p className="text-xs text-[#991B1B] border-t border-[#FECACA] pt-2.5 mt-0.5">
        While this notice is active,{' '}
        <strong>editing this customer is disabled</strong> — Xero does not accept
        updates to archived contacts. Need help identifying what&apos;s blocking?{' '}
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

/** Case 2 — QL archive reverted because Xero did not accept the change */
function BlockerBanner2() {
  const [whyOpen, setWhyOpen] = React.useState(false);

  return (
    <div className="border border-[#FDE68A] bg-[#FFFBEB] rounded-md p-4 mb-4 flex flex-col gap-3">
      {/* Title row */}
      <div className="flex items-start gap-2.5">
        <div className="flex-shrink-0 mt-0.5 bg-[#FED7AA] rounded-full p-1">
          <RefreshCw className="h-3.5 w-3.5 text-[#EA580C]" />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-[#92400E]">
            Archive reverted in QuarryLink (Xero did not accept it)
          </span>
          <p className="text-sm text-[#92400E]">
            You archived this customer in QuarryLink. We could not apply the same change
            in Xero, so the archive was reverted here to keep both systems aligned. The
            customer is active in QuarryLink again.
          </p>
        </div>
      </div>

      {/* Why this can happen */}
      <Collapsible open={whyOpen} onOpenChange={setWhyOpen}>
        <CollapsibleTrigger className="flex items-center gap-1.5 text-sm font-semibold text-[#92400E] hover:text-[#78350F] w-full text-left transition-colors">
          <ChevronRight
            className={cn('h-4 w-4 flex-shrink-0 transition-transform duration-150', whyOpen && 'rotate-90')}
          />
          Why this can happen
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-2 pl-5">
            <ul className="text-sm text-[#92400E] list-disc list-outside pl-2 space-y-1.5">
              <li>Contact locked or restricted in Xero</li>
              <li>Invalid or incomplete Xero contact details</li>
              <li>Connection or configuration issues between QuarryLink and Xero</li>
            </ul>
            <p className="text-sm text-[#92400E] mt-2">
              In Xero, confirm the contact can be archived manually, check the Xero
              connection, then try archiving again from QuarryLink.{' '}
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

/** Case 3 — Xero unarchive reverted because QL detected a duplicate customer */
function BlockerBanner3({ contactEmail }: { contactEmail?: string | null }) {
  return (
    <div className="border border-[#FDE68A] bg-[#FFFBEB] rounded-md p-4 mb-4 flex flex-col gap-3">
      {/* Title row */}
      <div className="flex items-start gap-2.5">
        <TriangleAlert className="h-4 w-4 text-[#D97706] flex-shrink-0 mt-0.5" />
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-[#92400E]">
            Unarchive not applied in QuarryLink (Xero was reverted)
          </span>
          <p className="text-sm text-[#92400E]">
            You unarchived this contact in Xero. QuarryLink could not mirror the
            unarchive, so the change was reverted in Xero and the contact was re-archived
            there to stay in sync.
          </p>
        </div>
      </div>

      {/* Duplicate email hint */}
      {contactEmail && (
        <div className="flex items-start gap-2">
          <Mail className="h-4 w-4 text-[#D97706] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#92400E]">
            Check for duplicate or conflicting customers (search for{' '}
            <code className="bg-[#FEF3C7] border border-[#FDE68A] px-1 py-0.5 rounded text-xs font-mono">
              {contactEmail}
            </code>
            ). Resolve conflicts, then unarchive from QuarryLink so Xero updates
            correctly.
          </p>
        </div>
      )}

      {/* Support */}
      <p className="text-sm text-[#92400E]">
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
      <p className="text-xs text-[#A16207] border-t border-[#FDE68A] pt-2.5 mt-0.5">
        When the contact is unarchived in Xero, QuarryLink is notified and can clear
        this notice and any restrictions automatically.
      </p>
    </div>
  );
}

/** Case 4 — Customer is archived in QL; editing blocked; no unarchive action */
function BlockerBanner4() {
  return (
    <div className="border border-[#E5E7EB] bg-[#F9FAFB] rounded-md p-4 mb-4 flex flex-col gap-2">
      <div className="flex items-start gap-2.5">
        <Lock className="h-4 w-4 text-[#6B7280] flex-shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-[#374151]">
            This customer is archived
          </span>
          <p className="text-sm text-[#4B5563]">
            Archived customers cannot be edited in QuarryLink. To make changes, unarchive
            the customer directly in Xero — QuarryLink will be notified automatically.
          </p>
        </div>
      </div>
      <p className="text-xs text-[#9CA3AF] pl-7">
        Unarchiving via QuarryLink is not supported because the Xero API does not provide
        an unarchive endpoint.
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
  const contactEmail =
    customer?.contactPersonEmail?.trim() || customer?.businessEmail?.trim() || null;

  switch (blockState) {
    case CustomerFormBlockState.XERO_ARCHIVED_QL_BLOCKED:
      return <BlockerBanner1 />;
    case CustomerFormBlockState.XERO_ARCHIVE_REVERTED:
      return <BlockerBanner2 />;
    case CustomerFormBlockState.XERO_UNARCHIVE_DUPLICATE:
      return <BlockerBanner3 contactEmail={contactEmail} />;
    case CustomerFormBlockState.QL_ARCHIVED:
      return <BlockerBanner4 />;
    default:
      return null;
  }
}
