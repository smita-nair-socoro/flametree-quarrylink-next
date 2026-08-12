# Project Context

## Product Overview

QuarryLink is a multi-tenant business application for managing the commercial and operational flow of quarry and haulage work. This repository is the frontend; backend services remain authoritative for persisted data and business operations.

## Major Domains

| Area | Frontend scope |
| --- | --- |
| Customer operations | Customers, quotations, jobs, dockets, and scheduling |
| Logistics | Dispatch, deliveries, drivers, trucks, and hauliers |
| Inventory | Products, quarries and suppliers, production, stockpiles, and weighbridge views |
| Administration | Tenant management, users, accounting integrations, policies, and quote content |
| Driver experience | Driver-specific docket and checklist workflows under `/drivers-app` |
| Public experience | Authentication callbacks, login, and token-based quote review |

## Terminology

* **Quote / quotation:** Both terms refer to the quotation domain; code paths and API types commonly use `quotation` while UI copy may use `quote`.
* **Job:** Customer work with its own line items, invoices, and dockets.
* **Docket:** An operational delivery or collection record used by scheduling, dispatch, and driver workflows.
* **Haulier:** A transport provider associated with logistics resources such as drivers and trucks.
* **Tenant:** The customer organisation whose identity and configuration scope authenticated data, branding, currency, tax, and integrations.

These descriptions provide orientation, not a complete process model. Confirm state transitions and operation eligibility in current API types, services, validation, and workflow code before changing behaviour.

## Sources of Truth

* API transport and endpoint wrappers: `lib/api/APIClient.ts`
* Query factories, mutations, and cache keys: `lib/api/*.ts` and `lib/api/keys.ts`
* DTOs and domain enums: `lib/types/`
* Form rules: feature-local `schemas/` files and their tests
* Shared implementation conventions: [architecture.md](architecture.md)
* Confirmed cross-workflow rules: [business-rules.md](business-rules.md)

Do not turn inferred behaviour into a documented rule without supporting code, tests, or an authoritative product/API source.
