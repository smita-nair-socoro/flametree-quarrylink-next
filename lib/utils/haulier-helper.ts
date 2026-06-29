export function isInternalHaulier(
  haulierEmail: string | undefined | null,
  tenantEmail: string | undefined | null,
): boolean {
  if (!haulierEmail || !tenantEmail) return false;
  return haulierEmail.toLowerCase() === tenantEmail.toLowerCase();
}
