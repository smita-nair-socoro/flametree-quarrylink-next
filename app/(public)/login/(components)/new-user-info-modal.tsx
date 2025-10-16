'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UserPlus, Mail, Key, ArrowRight } from 'lucide-react';

interface NewUserInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export function NewUserInfoModal({
  isOpen,
  onClose,
  onContinue,
}: NewUserInfoModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <img
              src="/quarrylink-logo.png"
              alt="QuarryLink Logo"
              width={48}
              height={48}
              className="rounded-lg"
            />
          </div>
          <DialogTitle className="flex items-center justify-center gap-2">
            <UserPlus className="h-5 w-5" />
            New User Setup
          </DialogTitle>
          <DialogDescription className="text-center">
            It looks like you might be a new user. Here's how to get started:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 ">
              <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-blue-900 ">
                  Check Your Email
                </div>
                <div className="text-blue-700 ">
                  Your administrator should have sent you a temporary password
                  via email.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 ">
              <Key className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-amber-900 ">
                  Use Temporary Password
                </div>
                <div className="text-amber-700 ">
                  Sign in with your email and the temporary password provided.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 ">
              <ArrowRight className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-green-900">
                  Set New Password
                </div>
                <div className="text-green-700 ">
                  You'll be prompted to create a permanent password on first
                  login.
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            Don't have a temporary password? Contact your administrator for
            assistance.
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="button" onClick={onContinue} className="flex-1">
              Try Again
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
