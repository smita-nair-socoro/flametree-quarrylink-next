import { formatLocalDateShort } from '@/lib/utils/date';
import { cn } from '@/lib/utils';

interface AuditInformationProps {
  createdBy?: string | null;
  lastModifiedBy?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  className?: string;
}

export function AuditInformation({
  createdBy,
  lastModifiedBy,
  createdAt,
  updatedAt,
  className,
}: AuditInformationProps) {
  return (
    <div className={cn('space-y-6 mb-10 col-span-full', className)}>
      <h2 className="text-[18px] font-bold">Audit Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-3 md:pl-2 gap-6 md:max-w-3xl">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground">Created By:</p>
          <p className="text-sm text-muted-foreground">{createdBy || '—'}</p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground">Last Modified By:</p>
          <p className="text-sm text-muted-foreground">{lastModifiedBy || '—'}</p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground">Created Date:</p>
          <p className="text-sm text-muted-foreground">
            {formatLocalDateShort(createdAt) || '—'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground">Modified Date:</p>
          <p className="text-sm text-muted-foreground">
            {formatLocalDateShort(updatedAt) || '—'}
          </p>
        </div>
      </div>
    </div>
  );
}
