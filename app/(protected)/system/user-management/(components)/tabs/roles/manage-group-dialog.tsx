'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Mail,
  Plus,
  Search,
  TriangleAlert,
  UserRoundMinus,
  Users,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UsersListQueryOptions } from '@/lib/api/user';
import {
  getAvatarColor,
  getInitials,
  getRoleLabel,
} from '@/lib/utils/user-helper';
import type { NotificationGroup } from './email-notification-groups';

export interface GroupMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface ManageGroupDialogProps {
  group: NotificationGroup | null;
  members: GroupMember[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddMembers: (members: GroupMember[]) => void;
  onRemoveMember: (member: GroupMember) => void;
}

function MemberAvatar({ name }: { name: string }) {
  const color = getAvatarColor(name);
  return (
    <span
      className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold shrink-0"
      style={{ backgroundColor: color.bg, color: color.text }}
    >
      {getInitials(name)}
    </span>
  );
}

export function ManageGroupDialog({
  group,
  members,
  open,
  onOpenChange,
  onAddMembers,
  onRemoveMember,
}: ManageGroupDialogProps) {
  const [activeTab, setActiveTab] = useState<'current' | 'add'>('current');
  const [search, setSearch] = useState('');
  const [selectedSubs, setSelectedSubs] = useState<string[]>([]);
  const [removeTarget, setRemoveTarget] = useState<GroupMember | null>(null);

  const { data: users = [] } = useQuery({
    ...UsersListQueryOptions(),
    enabled: open,
  });

  const availableUsers = useMemo(() => {
    const memberEmails = new Set(members.map((m) => m.email.toLowerCase()));
    const term = search.trim().toLowerCase();
    // Drivers can never be added to email notification groups
    return users.filter((user) => {
      if (getRoleLabel(user.groups) === 'Driver') return false;
      if (memberEmails.has(user.email?.toLowerCase())) return false;
      if (!term) return true;
      return (
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term)
      );
    });
  }, [users, members, search]);

  const selectedUsers = useMemo(
    () => availableUsers.filter((user) => selectedSubs.includes(user.sub)),
    [availableUsers, selectedSubs],
  );

  const resetState = () => {
    setActiveTab('current');
    setSearch('');
    setSelectedSubs([]);
    setRemoveTarget(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) resetState();
    onOpenChange(nextOpen);
  };

  const toggleSelected = (sub: string, checked: boolean) => {
    setSelectedSubs((prev) =>
      checked ? [...prev, sub] : prev.filter((s) => s !== sub),
    );
  };

  const handleAddToGroup = () => {
    onAddMembers(
      selectedUsers.map((user) => ({
        id: user.sub,
        name: user.name,
        email: user.email,
        role: getRoleLabel(user.groups),
      })),
    );
    setSelectedSubs([]);
  };

  const handleConfirmRemove = () => {
    if (removeTarget) {
      onRemoveMember(removeTarget);
      setRemoveTarget(null);
    }
  };

  if (!group) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md gap-3">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[15px] mt-0">
              <group.icon className="h-4 w-4 shrink-0" />
              {group.name} Group
            </DialogTitle>
            <DialogDescription className="text-[13px]">
              {group.description}
            </DialogDescription>
          </DialogHeader>

          {/* Tab toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === 'current' ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'h-8 px-3 text-[12px] font-medium gap-1.5',
                activeTab === 'current' &&
                  'bg-[#8E51FF] hover:bg-[#7C3AED] text-white',
              )}
              onClick={() => setActiveTab('current')}
            >
              <Users className="h-3.5 w-3.5" />
              Current Members ({members.length})
            </Button>
            <Button
              variant={activeTab === 'add' ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'h-8 px-3 text-[12px] font-medium gap-1.5',
                activeTab === 'add' &&
                  'bg-[#8E51FF] hover:bg-[#7C3AED] text-white',
              )}
              onClick={() => setActiveTab('add')}
            >
              <Plus className="h-3.5 w-3.5" />
              Add Members
            </Button>
          </div>

          {activeTab === 'current' ? (
            <div className="space-y-2 max-h-[320px] overflow-y-auto">
              {members.length === 0 ? (
                <p className="text-[13px] text-muted-foreground text-center py-8">
                  No members in this group yet
                </p>
              ) : (
                members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 rounded-lg border border-border p-3"
                  >
                    <MemberAvatar name={member.name} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium truncate">
                        {member.name}
                      </p>
                      <p className="text-[12px] text-muted-foreground truncate">
                        {member.email}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-[11px] font-medium text-[#374151] shrink-0"
                    >
                      {member.role}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 text-red-500 hover:text-red-600"
                      aria-label={`Remove ${member.name} from group`}
                      onClick={() => setRemoveTarget(member)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search users by name or email..."
                  className="pl-9 h-9 text-[13px]"
                />
              </div>

              <div className="space-y-2 max-h-[280px] overflow-y-auto">
                {availableUsers.length === 0 ? (
                  <p className="text-[13px] text-muted-foreground text-center py-8">
                    No available users found
                  </p>
                ) : (
                  availableUsers.map((user) => {
                    const checked = selectedSubs.includes(user.sub);
                    return (
                      <label
                        key={user.sub}
                        className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-gray-50"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(value) =>
                            toggleSelected(user.sub, value === true)
                          }
                          className="data-[state=checked]:bg-[#8E51FF] data-[state=checked]:border-[#8E51FF]"
                        />
                        <MemberAvatar name={user.name} />
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-medium truncate">
                            {user.name}
                          </p>
                          <p className="text-[12px] text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className="text-[11px] font-medium text-[#374151] shrink-0"
                        >
                          {getRoleLabel(user.groups)}
                        </Badge>
                      </label>
                    );
                  })
                )}
              </div>

              {selectedUsers.length > 0 && (
                <div className="flex items-center justify-between rounded-lg bg-[#F3F4F6] px-3 py-2">
                  <p className="text-[12px] font-medium">
                    {selectedUsers.length} user
                    {selectedUsers.length > 1 ? 's' : ''} selected
                  </p>
                  <Button
                    size="sm"
                    className="h-7 px-3 text-[12px] font-medium bg-[#8E51FF] hover:bg-[#7C3AED] text-white"
                    onClick={handleAddToGroup}
                  >
                    Add to Group
                  </Button>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-4 text-[12px] font-medium"
              onClick={() => handleOpenChange(false)}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove member confirmation */}
      <Dialog
        open={removeTarget !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setRemoveTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md gap-3 max-h-[90vh] overflow-y-auto">
          {removeTarget && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-[15px] mt-0">
                  <UserRoundMinus className="h-4 w-4 shrink-0 text-red-500" />
                  Remove from notification group
                </DialogTitle>
                <DialogDescription className="text-[13px]">
                  Remove{' '}
                  <span className="font-medium text-foreground">
                    {removeTarget.name}
                  </span>{' '}
                  from the{' '}
                  <span className="font-medium text-foreground">
                    {group.name}
                  </span>{' '}
                  email notification group.
                </DialogDescription>
              </DialogHeader>

              <div className="flex items-center gap-3 rounded-lg bg-[#F9FAFB] p-3">
                <MemberAvatar name={removeTarget.name} />
                <div className="min-w-0">
                  <p className="text-[13px] font-medium truncate">
                    {removeTarget.name}
                  </p>
                  <p className="text-[12px] text-muted-foreground truncate">
                    {removeTarget.email}
                  </p>
                  <Badge
                    variant="secondary"
                    className="mt-1 text-[11px] font-medium text-[#374151]"
                  >
                    {removeTarget.role}
                  </Badge>
                </div>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="flex items-center gap-1.5 text-[13px] font-medium text-amber-800">
                  <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
                  Email notifications will stop
                </p>
                <p className="mt-1 text-[12px] text-amber-700">
                  This user will no longer receive{' '}
                  {group.name.toLowerCase()} emails. They will not be notified
                  of this change.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-[#F9FAFB] p-3 space-y-2">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Notification group
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[13px] font-medium">
                    <group.icon className="h-3.5 w-3.5" />
                    {group.name}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Emails they will no longer receive
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {group.emailTypes.map((emailType) => (
                      <Badge
                        key={emailType}
                        variant="outline"
                        className="bg-white text-[11px] font-medium text-[#18181B] rounded-full gap-1.5"
                      >
                        <Mail className="h-3 w-3" />
                        {emailType}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-[12px]">
                <p className="font-semibold text-[13px]">
                  What happens when you remove this user:
                </p>
                <p>
                  <span className="font-semibold">Immediate effect:</span>{' '}
                  User is removed from the {group.name} Cognito group
                </p>
                <p>
                  <span className="font-semibold">No more emails:</span> They
                  will stop receiving all {group.name.toLowerCase()}{' '}
                  notification emails immediately
                </p>
                <p>
                  <span className="font-semibold">
                    System access unchanged:
                  </span>{' '}
                  Their permission role ({removeTarget.role}) and system
                  access remain exactly the same
                </p>
                <p>
                  <span className="font-semibold">Reversible:</span> You can
                  add them back to this group at any time
                </p>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-[13px] font-medium md:flex-1"
                  onClick={() => setRemoveTarget(null)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-9 text-[13px] font-medium md:flex-1 bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleConfirmRemove}
                >
                  Remove from group
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
