'use client';

import * as React from 'react';
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User } from '@/lib/types/user';
import { FormSelectOption } from '@/components/ui/form-select';
import { TeamMemberTableActions } from '@/app/(protected)/system/user-management/(components)/(data-tables)/team-member/team-member-table-actions';

const AVATAR_PALETTE = [
  { bg: '#DBEAFE', text: '#2563EB' },
  { bg: '#D1FAE5', text: '#059669' },
  { bg: '#EDE9FE', text: '#7C3AED' },
  { bg: '#FEE2E2', text: '#DC2626' },
  { bg: '#FEF3C7', text: '#D97706' },
  { bg: '#FCE7F3', text: '#BE185D' },
  { bg: '#CCFBF1', text: '#0D9488' },
];

function getAvatarColor(name: string) {
  const hash = (name || '')
    .split('')
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

function getInitials(name: string) {
  if (!name?.trim()) return '??';
  return name
    .trim()
    .split(/\s+/)
    .map((n) => n[0]?.toUpperCase() || '')
    .join('')
    .slice(0, 2);
}

function getRole(groups: string[] | undefined): string {
  if (!groups || !Array.isArray(groups) || groups.length === 0) return 'User';
  const s = groups.join(',').toUpperCase();
  if (s.includes('SUPER_ADMIN') || s.includes('SUPERADMIN')) return 'Super Admin';
  if (s.includes('ADMIN')) return 'Admin';
  return 'User';
}

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

  const filtered = React.useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q),
    );
  }, [users, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  React.useEffect(() => {
    setPage(1);
  }, [search, users]);

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

  return (
    <div className="flex flex-col">
      {/* Search */}
      <div className="relative px-4 pb-3">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search team members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* List — no border, connects directly to the outer card */}
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
              const role = getRole(user.groups);
              return (
                <div
                  key={user.sub || user.email}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => onRowClick?.(user)}
                >
                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-semibold"
                    style={{ backgroundColor: color.bg, color: color.text }}
                  >
                    {initials}
                  </div>

                  {/* Name + Email + Role badge */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900 truncate">
                      {user.name || '—'}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {user.email}
                    </div>
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full border border-[#8E51FF] text-[#8E51FF]">
                      {role}
                    </span>
                  </div>

                  {/* Actions */}
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
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#E4E4E7] text-sm text-gray-500 gap-2 flex-wrap">
          <span className="whitespace-nowrap">{filtered.length} records</span>

          <input
            className="w-10 h-7 text-center text-sm border border-gray-200 rounded"
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            onBlur={handlePageInputBlur}
            onKeyDown={(e) => e.key === 'Enter' && handlePageInputBlur()}
          />

          <span className="whitespace-nowrap">
            Page {page} of {totalPages}
          </span>

          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setPage(1)}
              disabled={page === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
