# Business Rules

Document only rules confirmed by current validation, tests, API contracts, or an authoritative product source. Domain enums list possible values but do not, by themselves, define valid state transitions.

## Tenant and Access Scope

* Authenticated backend requests are tenant-scoped using the tenant ID carried in the Cognito token.
* Users in the `driver` group are routed to `/drivers-app`; non-driver users are routed away from driver-only pages. Changing this requires reviewing the protected layout and permission model together.
* Tenant details supply values such as currency, tax label/rate, and accounting integration. Do not hardcode tenant-specific presentation or behaviour when tenant configuration is available.

## Public Quote Review

Token-based public quote review is intentionally unauthenticated. Public quote endpoints must use the shared API client's explicit unauthenticated path; authenticated preview behaviour is separate.

## Quote and Job Delivery Windows

The quote and job forms share these confirmed validation rules:

* The delivery date and both time fields may all be empty.
* A delivery date may be provided without a time.
* A start time, an end time, or both may be provided when a delivery date is present.
* Any delivery time without a delivery date is invalid.
* Time fields use local wall-clock values rather than timezone-bearing timestamps.

Shared scheduling utilities expose delivery-hour choices from `04:00` through `23:00` and prevent selecting a start at or after the chosen end, or an end at or before the chosen start. Verify backend constraints before treating this UI guard as a broader API rule.

## Create and Edit Validation

Create and edit modes intentionally differ in some forms:

* Quotes always require an expiry date. Quote edit mode additionally requires a valid phone number and at least one recipient email.
* Jobs require at least one receipt email. Job edit mode additionally requires a contact-person name and valid phone number.

Preserve these differences unless the product and API requirements explicitly change.

## Job Attachments

Jobs may have at most three attachments, each no larger than 10 MB. Categories are Purchase Order, Quote / Contract, Site Map / Access, Permit / Approval, Safety Documentation, Correspondence, and Other. Attachments belong to the job only and can be added or deleted in any job status. Anyone who can edit the job can add and delete attachments.

## Canonical Evidence

* `app/(protected)/layout.tsx`
* Quote and job form schemas and their `__tests__/` suites
* `lib/utils/time.ts` and `lib/utils/__tests__/time.test.ts`
* `lib/api/APIClient.ts` and `lib/api/quotation.ts`
* `lib/types/*-enums.ts`
