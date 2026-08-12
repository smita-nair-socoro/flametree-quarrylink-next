# QuarryLink Frontend Agent Guide

This file is the repository entry point for AI coding agents. Keep it concise; durable project knowledge belongs in `docs/`.

## Start with Context

Before changing code:

1. Read the relevant component, hook, API service, types, schema, and tests.
2. Search for an existing implementation of the same pattern.
3. Verify request and response contracts in `lib/api/` and `lib/types/`; do not invent backend fields, endpoints, or fallback data.
4. Consult the relevant project docs:
   * [Project context](docs/project-context.md)
   * [Architecture](docs/architecture.md)
   * [Business rules](docs/business-rules.md)
   * [Decisions](docs/decisions.md)
   * [Gotchas](docs/gotchas.md)

Read `docs/active/` only when it contains a workstream relevant to the task. Do not read `docs/archive/` by default; use it only when historical context is specifically relevant.

## Tooling and Commands

Use Bun exclusively. Do not use npm, Yarn, or pnpm. Inspect `package.json` before running scripts.

| Task | Command |
| --- | --- |
| Install dependencies | `bun install` |
| Development server | `bun run dev` |
| Lint | `bun run lint` |
| Tests | `bun run test:run` |
| Coverage | `bun run test:coverage` |
| Production build | `bun run build` |

## Implementation Rules

* Prefer small, focused changes and preserve existing behaviour unless the task requires otherwise.
* Reuse existing components, hooks, utilities, query factories, schemas, and styling patterns before adding alternatives.
* Use explicit TypeScript types and avoid `any`, duplicate utilities, speculative abstractions, unnecessary state, and unnecessary effects.
* Follow existing TanStack Query key, query-options, mutation, and invalidation patterns for server state. Use Zustand only where nearby client-state patterns justify it.
* Use react-hook-form, Zod, and `zodResolver` for forms. Keep validation in schemas and account for create/edit differences.
* Prefer values derived during render. Use `useEffect` for genuine synchronisation or side effects, and `useCallback` only when referential stability matters.
* Use existing shadcn/ui, Radix, and project components with Tailwind styling. Preserve loading, error, empty, disabled, validation, keyboard, and mobile states.
* Respect the static-export and runtime-configuration boundaries described in `docs/architecture.md`.

## Verification and Review

Run the smallest relevant checks, then broader checks when risk warrants them. Do not fix unrelated existing failures.

Consider null/optional values, archived or deactivated entities, permissions, create vs edit mode, async races, loading/error states, mobile layouts, and API pagination/sorting.

For reviews, prioritise correctness, regressions, business-rule violations, API mismatches, state and async bugs, validation, accessibility, and maintainability. Separate confirmed defects from optional improvements.

## Project Knowledge

Treat project memory as curated knowledge, not ticket, PR, or conversation history. Preserve information only when the answer is yes:

> Would knowing this again materially improve future implementation, debugging, code review, planning, or decision-making?

Store stable context in the canonical docs, temporary multi-session work in `docs/active/`, and occasionally useful history in `docs/archive/`. Do not preserve blockers, deployment status, one-off debugging output, speculation, stale implementation detail, or duplicates. Preserve conclusions and rationale rather than transcripts.

When a substantial workstream finishes, perform a proportional cleanup: consolidate durable rules, decisions, and gotchas; archive or delete temporary context; and supersede outdated guidance. Do not perform large unrelated documentation cleanups during feature work.
