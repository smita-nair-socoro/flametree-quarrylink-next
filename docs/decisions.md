# Engineering Decisions

Record current decisions in `Decision / Reason` form. Update or supersede an entry when the decision changes; do not leave contradictory guidance active.

## Bun Is the Package Manager

**Decision:** Use Bun for dependency installation and all repository scripts.

**Reason:** The repository commits `bun.lock`, CI uses the Bun image and commands, and a single package-manager workflow avoids lockfile drift.

## Build as a Static Export

**Decision:** Keep the frontend compatible with Next.js static export.

**Reason:** The production build emits static assets to `out/`. Runtime data and authentication are therefore client-side, and server-only Next.js features are outside the current deployment model.

## Load Environment Configuration at Runtime

**Decision:** Load API, authentication, maps, and observability settings from `public/config.json` before authentication and application rendering.

**Reason:** Runtime configuration keeps environment values out of the committed bundle configuration and makes them available to both React providers and non-React API utilities.

## Keep API Contracts in Code

**Decision:** Treat `lib/types/`, `lib/api/APIClient.ts`, and resource API modules as the current frontend API contract instead of maintaining a duplicate endpoint catalogue.

**Reason:** Types and request builders change with the implementation; duplicating every DTO and endpoint in prose would drift. Project docs should record only durable constraints and non-obvious behaviour.

## Separate Server and Client State

**Decision:** Use TanStack Query for server state and cache lifecycle; use local React state or established Zustand stores for client/UI state.

**Reason:** Clear ownership avoids duplicate caches and keeps refetching, invalidation, and optimistic behaviour in the existing data layer.

## Preserve Tenant-Local Wall-Clock Time

**Decision:** Display, compare, and submit backend date/time values as tenant-local wall-clock components unless an endpoint explicitly defines another contract.

**Reason:** The backend sends tenant-local values without meaningful UTC offsets and handles UTC storage internally. Automatic `Date`/UTC conversion can shift the displayed day or time.
