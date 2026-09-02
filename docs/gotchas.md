# Known Gotchas

## Static Export Limits Server Features

`next.config.ts` uses `output: 'export'`. Do not add request-time server rendering, server-only API routes, or dynamic routes that cannot be generated statically without first changing the deployment architecture. Images are also configured without Next.js runtime optimisation.

## Runtime Configuration Must Load First

API and maps utilities call `getRuntimeConfig()`, which throws until `ConfigProvider` has loaded `/config.json`. Keep consumers below the provider and do not import environment-specific secrets into committed source. `public/config.json` is intentionally ignored.

## Backend Times Are Wall-Clock Values

Backend date/time strings are tenant-local wall-clock values, even when legacy data contains a trailing `Z` or offset. Use `lib/utils/date.ts` and `lib/utils/time.ts`:

* use calendar-date helpers when only the day matters;
* use local date/time helpers for display;
* parse time-only values directly rather than through APIs requiring a full date;
* submit local components without appending `Z` or an offset.

Using `new Date(string)` or `toISOString()` casually can move a date or time across timezone boundaries.

## API Query Serialization Is Deliberate

`HttpClient` omits `undefined` and empty-string query values, omits empty array members, and serialises arrays as repeated keys. Do not prebuild a conflicting query string or assume nested objects are supported.

Public requests require `skipAuth`; special cross-service requests may require `omitTenantHeaders`. These flags change authentication and CORS behaviour and should not be copied without checking the endpoint contract.

## Pagination Uses Two Index Bases

TanStack table state is zero-based, while paginated backend endpoints are one-based. Resource query factories such as customers and dockets convert table pages before calling the API. Infinite queries begin at API page `1`. Keep pagination parameters in the query key, use `keepPreviousData` for paged tables, and do not pass a raw table `pageIndex` directly to `APIClient`.

API sorting may support only a mapped subset of column IDs and, in current customer/docket patterns, only the first sort entry. Verify each resource's mapping and server behaviour rather than forwarding table state blindly.

## Create and Edit Forms May Differ

Several schemas add requirements in edit mode that are not present in create mode. Use the existing schema factory and form-state hook; do not replace it with the base schema without checking [business-rules.md](business-rules.md).

## Cash Sales and Internal Transfer Journals Stay Local Until Fusion Exposes Payment/Journal APIs

Flame Tree invoice sync (sales order → invoice) is unchanged. Cash-sale payments and internal-transfer GL journals are recorded locally first, then the orch service posts to tenant-fusion `/accounts/internal/payments` and `/accounts/internal/journals`.

Those fusion endpoints do not exist today. The push classifier maps a missing API to **Not synced** — not Failed — so operators are not asked to Retry a call that cannot succeed. Do not invent a fourth sync badge. Retry remains on Failed rows only, for when fusion later returns a real Acumatica rejection. Zero-value cash sales and journals are also left **Not synced** rather than pushed.
