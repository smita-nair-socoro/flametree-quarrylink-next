# QuarryLink Frontend

QuarryLink is a multi-tenant business application for customer, quotation, job, docket, logistics, inventory, pricing, and administration workflows. This repository contains the frontend.

## Local Development

Install [Bun](https://bun.sh/), then run:

```bash
bun install
bun run dev
```

The application loads environment-specific runtime settings from `public/config.json`. Obtain that file through the approved team channel; it is intentionally ignored and must not contain values committed to source control. The required shape is defined in `app/stores/runtimeConfigStore.ts`.

## Common Checks

```bash
bun run lint
bun run test:run
bun run build
```

`bun run build` produces a static export in `out/`.

## Project Documentation

Start with:

* [Project context](docs/project-context.md)
* [Architecture](docs/architecture.md)
* [Business rules](docs/business-rules.md)
* [Engineering decisions](docs/decisions.md)
* [Known gotchas](docs/gotchas.md)

Specialised references, including email-template placeholder documentation, also live under `docs/`.
