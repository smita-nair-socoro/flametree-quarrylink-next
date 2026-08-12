# Architecture

## Runtime Model

The application uses Next.js App Router, React, and strict TypeScript, but builds as a static export (`output: 'export'`). Dynamic application data is fetched client-side; do not introduce features that require a Next.js server, runtime API routes, or request-time server rendering without an explicit architecture change.

Startup follows this order:

```text
public/config.json
  -> ConfigProvider / runtime config store
  -> AWS Amplify authentication
  -> theme and TanStack Query providers
  -> public or protected route UI
```

`public/config.json` supplies API, Cognito, Google Maps, and observability settings at runtime and is intentionally not committed.

## Authentication and API Boundary

* AWS Amplify/Cognito manages authentication.
* `lib/api/APIClient.ts` is the shared HTTP boundary. Authenticated requests normally include a bearer token and the tenant ID from the Cognito token.
* Public token-based endpoints must explicitly opt out of authentication with `skipAuth`.
* Requests to services that reject tenant/CORS headers must explicitly use `omitTenantHeaders` while retaining the shared error handling.
* Treat `lib/types/` and the request/response signatures in `lib/api/` as the frontend contract. Confirm optional, nullable, pagination, sorting, and response-shape behaviour there before changing consumers.

## Data and State

* TanStack React Query owns server state. Query-key factories live in `lib/api/keys.ts`; resource modules expose query-options factories and mutation hooks. Mutations invalidate the affected list/detail key families.
* Zustand stores under `app/stores/` hold shared client or UI state such as selected records and current tenant/user details. Do not mirror React Query data into a store unless the existing workflow requires shared client state.
* Forms generally use react-hook-form with Zod schemas and `zodResolver`. Complex form orchestration commonly lives in feature hooks, while reusable validation remains in schemas.

## UI and Styling

* Shared primitives live in `components/ui/` and follow shadcn/ui and Radix patterns.
* Feature components stay close to their App Router route; reusable hooks live under `hooks/`.
* Tailwind CSS is the styling system. Reuse nearby responsive and overlay patterns, especially for dialog/drawer/mobile variants.
* `@/` resolves to the repository root.

## Key Directories

| Path | Responsibility |
| --- | --- |
| `app/(protected)/` | Authenticated product routes |
| `app/(public)/` | Login, callback, and public quote review |
| `components/` | Shared application and UI components |
| `hooks/` | Shared and domain-specific hooks |
| `lib/api/` | HTTP client, query factories, and mutations |
| `lib/types/` | API DTOs and domain enums |
| `lib/utils/` | Shared transformations and formatting |
| `app/stores/` | Zustand client-state stores |

## Testing and Delivery

Vitest runs in jsdom with Testing Library support. Tests are colocated in `__tests__/` directories. Bitbucket Pipelines installs with Bun, then runs lint and the static production build.
