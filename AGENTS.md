# Repository Guidelines

## Project Structure & Module Organization
QuarryLink Next is a Next.js 15 app using the App Router. Route groups under `app/(public)` host unauthenticated entry points, while `app/(protected)` contains the core dashboards. Shared Zustand stores sit in `app/stores`. Reusable UI primitives live in `components/ui`, and feature-level composites stay in `components/`. Domain hooks belong in `hooks/`. Shared helpers, API clients, and auth wrappers are under `lib/` (`lib/api`, `lib/auth`, `lib/utils`), with JSON fixtures for local testing in `lib/tests`. Static assets reside in `public/`, and static export artifacts emit to `out/`.

## Build, Test, and Development Commands
- `npm run dev` launches the Turbopack dev server on http://localhost:3000 with hot reload.
- `npm run lint` runs the Next/ESLint suite; treat warnings as blockers before pushing.
- `npm run build` generates the production static export inside `out/`.
- `npm run build && npx serve out` lets you sanity-check the exported bundle locally.

## Coding Style & Naming Conventions
TypeScript is mandatory for all source modules. Prefer function components with explicit prop types and React hooks. Components and files that render UI use PascalCase; utilities and hooks use camelCase (`useThing.ts`). Tailwind classes belong inline, with variants composed through the helpers in `lib/utils` and `clsx`. Follow the 2-space indentation and final newline enforced by `.editorconfig`. Run `npm run lint` (and enable format-on-save) to pick up the shared ESLint/Tailwind rules.

## Testing Guidelines
Automated testing is still minimal; expand coverage alongside new work. Prioritize lightweight unit or integration tests colocated with the feature (`feature-name.test.ts[x]`) using React Testing Library when adding dependencies. Until a harness ships, document manual QA steps in the PR and rely on the sample payloads in `lib/tests` to simulate API responses. Always run `npm run lint` and exercise the affected routes in `npm run dev` before marking a task complete.

## Commit & Pull Request Guidelines
Write concise, imperative commit messages (`Fix overflow`, `QLINK-804 add settings tab`). Group related changes and avoid "changed a lot" style summaries. For pull requests, include: 1) a narrative describing the user impact, 2) links to the relevant QLINK ticket or Jira issue, 3) screenshots or screen recordings for UI work, and 4) a test plan noting lint/build results and any manual scenarios. Confirm that the branch stays current with `main` before requesting review.
