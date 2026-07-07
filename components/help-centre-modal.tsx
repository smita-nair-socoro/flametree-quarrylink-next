'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Info, Layers, Truck, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';
import { getLocalStorage, setLocalStorage } from '@/lib/utils';

const HELP_CENTRE_URL =
  'https://socoro.atlassian.net/wiki/external/NTAxZTRkMDFiYzA1NDEwNGE4N2NlNDFkNTI2MWZmYmQ';

const features = [
  {
    icon: Layers,
    title: 'Get set up',
    description:
      'Add your quarries, products and customers, and connect your accounting software.',
  },
  {
    icon: FileText,
    title: 'Quote and win work',
    description:
      'Build priced quotes, send them for approval, and turn them into jobs.',
  },
  {
    icon: Truck,
    title: 'Dispatch and invoice',
    description:
      'Assign trucks and drivers, track every load, and invoice completed work.',
  },
];

export function HelpCentreButton() {
  const [open, setOpen] = useState(false);
  const { user: amplifyUser } = useAuth();
  const userId = amplifyUser?.userId;

  useEffect(() => {
    if (!userId) return;
    const key = `helpCentreWelcomeSeen:${userId}`;
    if (!getLocalStorage(key, false)) {
      setLocalStorage(key, true);
      setOpen(true);
    }
  }, [userId]);

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            className="bg-[#7138F5] hover:bg-[#5f2fd4] active:bg-[#5f2fd4] text-white hover:text-white active:text-white cursor-pointer h-9"
            onClick={() =>
              window.open(HELP_CENTRE_URL, '_blank', 'noopener,noreferrer')
            }
          >
            <Info className="h-5 w-5 shrink-0" />
            <span className="font-medium">Help Centre</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden gap-0 rounded-2xl">
          <div className="h-[10px] w-full bg-[linear-gradient(to_right,#6D28D9,#A78BFA,#6D28D9)]" />
          <div className="p-6 pb-4">
            <div className="flex items-center gap-2 mb-5">
              <Image
                src="/QuarryLink-Black.png"
                alt="QuarryLink Logo"
                width={140}
                height={40}
                className="object-contain"
              />
            </div>
            <DialogTitle className="text-2xl font-bold leading-tight mb-2">
              Welcome to QuarryLink
            </DialogTitle>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your all-in-one platform for quarry sales and logistics — from
              customers and quotes through to dockets and invoicing.
            </p>
          </div>

          <div className="border-t" />

          <div className="p-6 pt-5">
            <p className="text-xs font-semibold text-[#7138F5] uppercase tracking-wider mb-4">
              Here&apos;s how to get started
            </p>
            <div className="space-y-5">
              {features.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#7138F5]/10">
                    <Icon className="h-5 w-5 text-[#7138F5]" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{title}</p>
                    <p className="text-[#9D93B8] text-sm mt-0.5 leading-snug">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between px-6 py-4 bg-[#FAF8FF] border-t border-[#F0ECFB]">
            <p className="text-[#B0A8C8] text-sm">
              New here? We&apos;ll walk you through setup, step by step.
            </p>
            <a
              href={HELP_CENTRE_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-1.5 rounded-lg bg-[#7138F5] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5f2fd4] transition-colors"
            >
              Get started →
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
