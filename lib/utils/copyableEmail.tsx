'use client';

import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { notifySuccess } from '@/lib/toast';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function CopyableEmail({ email }: { email: string }) {
  const { copyToClipboard } = useCopyToClipboard({
    onCopy: () => notifySuccess('Email copied'),
  });

  if (!email) return null;

  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={() => copyToClipboard(email)}
          className="text-xs text-blue-600 block w-full !min-h-0 min-w-0 truncate text-left hover:underline cursor-pointer"
        >
          {email}
        </button>
      </TooltipTrigger>
      <TooltipContent variant="white" className="max-w-xs">
        <p className="break-all">{email}</p>
      </TooltipContent>
    </Tooltip>
  );
}
