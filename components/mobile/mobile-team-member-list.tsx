'use client';

import * as React from 'react';
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Search,
  Filter,
  X,
  Plus,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { User } from '@/lib/types/user';
import { FormSelectOption } from '@/components/ui/form-select';
import { TeamMemberTableActions } from '@/app/(protected)/system/user-management/(components)/(data-tables)/team-member/team-member-table-actions';
import {
  getAvatarColor,
  getInitials,
  getRoleLabel,
} from '@/lib/utils/user-helper';

const ROLE_OPTIONS = ['Super Admin', 'Admin', 'User'];

const PAGE_SIZE = 10;

interface MobileTeamMemberListProps {
  users: User[];
  rolesOptions: readonly FormSelectOption[];
  currentUserId?: number | string;
  onRowClick?: (user: User) => void;
}

export function MobileTeamMemberList({
  users,
  rolesOptions,
  currentUserId,
  onRowClick,
}: MobileTeamMemberListProps) {
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [pageInput, setPageInput] = React.useState('1');

  // Applied filters
  const [selectedRoles, setSelectedRoles] = React.useState<string[]>([]);
  // Temp filters (inside drawer before applying)
  const [tempRoles, setTempRoles] = React.useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  // Sync temp state when drawer opens
  React.useEffect(() => {
    if (drawerOpen) setTempRoles(selectedRoles);
  }, [drawerOpen, selectedRoles]);

  const filtered = React.useMemo(() => {
    const q = search.toLowerCase().trim();
    return users.filter((u) => {
      const matchesSearch =
        !q ||
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q);
      const matchesRole =
        selectedRoles.length === 0 || selectedRoles.includes(getRoleLabel(u.groups));
      return matchesSearch && matchesRole;
    });
  }, [users, search, selectedRoles]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  React.useEffect(() => {
    setPage(1);
  }, [search, selectedRoles, users]);

  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  React.useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handlePageInputBlur = () => {
    const n = parseInt(pageInput, 10);
    if (Number.isFinite(n) && n >= 1 && n <= totalPages) {
      setPage(n);
    } else {
      setPageInput(String(page));
    }
  };

  const toggleTempRole = (role: string) => {
    setTempRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const applyFilters = () => {
    setSelectedRoles(tempRoles);
    setDrawerOpen(false);
  };

  const clearFilters = () => {
    setSelectedRoles([]);
    setTempRoles([]);
    setDrawerOpen(false);
  };

  return (
    <div className="flex flex-col">
      {/* Search + Filter row */}
      <div className="flex items-center gap-2 px-4 pb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search team members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline" size="sm" className="h-10 shrink-0">
              <Filter size={16} className="mr-2" />
              Filters
              {selectedRoles.length > 0 && (
                <div className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  {selectedRoles.length}
                </div>
              )}
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="text-left font-medium text-[31.67px]">
                Filters
              </DrawerTitle>
            </DrawerHeader>
            <div
              className="flex-1 overflow-y-auto px-4 py-3"
              style={{ maxHeight: 'calc(95vh - 12rem)' }}
            >
              <Accordion
                type="multiple"
                defaultValue={['role']}
                className="w-full"
              >
                <AccordionItem value="role">
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center justify-between w-full pr-4">
                      <span className="text-lg">Role</span>
                      {tempRoles.length > 0 && (
                        <div className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                          {tempRoles.length}
                        </div>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pt-2">
                      {ROLE_OPTIONS.map((role) => {
                        const isSelected = tempRoles.includes(role);
                        return (
                          <div
                            key={role}
                            className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => toggleTempRole(role)}
                          >
                            <div className="flex items-center space-x-3">
                              <div
                                className={cn(
                                  'flex h-4 w-4 items-center justify-center border border-primary rounded-sm',
                                  isSelected
                                    ? 'bg-primary text-primary-foreground'
                                    : 'opacity-50',
                                )}
                              >
                                {isSelected && <Check className="h-3 w-3" />}
                              </div>
                              <span className="text-sm">{role}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            <DrawerFooter>
              <Button variant="default" onClick={applyFilters}>
                <Plus size={16} className="mr-2" />
                Apply Filters
              </Button>
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full mb-4"
              >
                <X size={16} className="mr-2" />
                Clear All Filters
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>

      {/* List */}
      <div className="overflow-hidden border-t border-[#E4E4E7]">
        <div className="divide-y divide-gray-100">
          {paginated.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No team members found
            </div>
          ) : (
            paginated.map((user) => {
              const initials = getInitials(user.name || user.email || '');
              const color = getAvatarColor(user.name || user.email || '');
              const role = getRoleLabel(user.groups);
              return (
                <div
                  key={user.sub || user.email}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => onRowClick?.(user)}
                >
                  <div
                    className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-semibold"
                    style={{ backgroundColor: color.bg, color: color.text }}
                  >
                    {initials}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900 truncate">
                      {user.name || '—'}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {user.email}
                    </div>
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-[#F5F3FF] border border-[#F5F3FF] text-[#7008E7]">
                      {role}
                    </span>
                  </div>

                  <div
                    className="flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <TeamMemberTableActions
                      teamMember={user}
                      roles={rolesOptions}
                      currentUserId={currentUserId}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination footer */}
        <div className="flex flex-wrap items-center justify-between px-3 py-2 border-t border-[#E4E4E7] text-xs text-gray-500 gap-x-1.5 gap-y-1">
          <div className="flex items-center gap-1.5 basis-full justify-center sm:basis-auto sm:justify-start">
            <span className="whitespace-nowrap">{filtered.length} records</span>
            <input
              className="w-8 h-6 text-center text-xs border border-gray-200 rounded-md"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onBlur={handlePageInputBlur}
              onKeyDown={(e) => e.key === 'Enter' && handlePageInputBlur()}
            />
            <span className="whitespace-nowrap">Page {page} of {totalPages}</span>
          </div>

          <div className="flex items-center gap-0 basis-full justify-center sm:basis-auto sm:justify-start">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setPage(1)}
              disabled={page === 1}
            >
              <ChevronsLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
            >
              <ChevronsRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
