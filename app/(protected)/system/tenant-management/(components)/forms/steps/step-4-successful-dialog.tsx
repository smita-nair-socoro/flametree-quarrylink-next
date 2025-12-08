'use client';

import React from 'react';
import { ActionDialog } from '@/components/action-dialog';
import { CircleCheck, Mail } from 'lucide-react';

interface Step4SuccessfulDialogProps {
  open: boolean;
  onClose: () => void;
  clientName: string;
  clientEmail: string;
}

export default function Step4SuccessfulDialog({
  open,
  onClose,
  clientName,
  clientEmail,
}: Step4SuccessfulDialogProps) {
  const description = (
    <div className="flex justify-start items-center gap-2">
      <div className="flex w-[40px] h-[40px] justify-center bg-[#F0FDF4] rounded-full">
        <span className="flex items-center justify-center">
          <CircleCheck className="h-[20px] w-[20px] text-[#008236]" />
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-medium">{clientName}</span>
        <span className="text-sm text-[#6A7282]">
          has been added to QuarryLink
        </span>
      </div>
    </div>
  );
  const content = (
    <div className="flex flex-col gap-5">
      <div className="border-1 border-[#B9F8CF] rounded-md p-[16.625px] bg-[#F0FDF4]">
        <div className="flex justify-start gap-2 self-stretch">
          <Mail className="h-[20px] w-[20px] text-[#008236] flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="text-[16px] text-[#008236] font-medium">
              Welcome email sent
            </span>
            <span className="text-[14px] font-normal text-[#008236]">
              A welcome email with payment setup instructions has been sent to
              <span className="font-medium">{clientEmail}</span>
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <span className="text-[16px] font-medium text-[#101828]">
          Next Steps:
        </span>
        <div className="flex justify-start gap-2 items-center">
          <div className="flex rounded-full bg-[#E5E5E5] h-7 w-7 items-center justify-center">
            1
          </div>
          <span className="text-[14px] text-[#364153]">
            Client completes payment setup
          </span>
        </div>
        <div className="flex justify-start gap-2 items-center">
          <div className="flex rounded-full bg-[#E5E5E5] h-7 w-7 items-center justify-center">
            2
          </div>
          <span className="text-[14px] text-[#364153]">
            Account activation email sent
          </span>
        </div>
        <div className="flex justify-start gap-2 items-center">
          <div className="flex rounded-full bg-[#E5E5E5] h-7 w-7 items-center justify-center">
            3
          </div>
          <span className="text-[14px] text-[#364153]">
            Client gains full platform access
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <ActionDialog
      open={open}
      onOpenChangeAction={onClose}
      title="Client Successfully Added"
      content={content}
      description={description}
      cancelText="Done"
      cancelButtonClass="bg-[#008236] text-white cursor-pointer col-span-2 h-11"
      confirmActionNeeded={false}
      customWidth="w-[1050px]"
    />
  );
}
