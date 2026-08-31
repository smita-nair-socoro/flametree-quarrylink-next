# Phase 0 — Decimal precision / Acumatica balancing (Render)

Recorded 31 August 2026 from the Flametree Render codebases. Live Acumatica payloads were not available in this environment, so field precision is taken from the existing integration contract and Acumatica’s documented money handling. Recheck against a real Flame Tree payload before calling reconciliation done.

## Acumatica (from current fusion contract)

| Field | Precision used on the wire | Notes |
|---|---|---|
| Unit price / rate | 4dp for Flame Tree, 2dp otherwise | `SalesOrder.Details.UnitPrice`. Previously forced through `NumberUtils.scale2`. |
| Quantity | 6dp | Already `scale6`. Unchanged. |
| Line amount | 2dp | Acumatica computes this from qty × unit price. QuarryLink stores line totals at 2dp. |
| Document total | 2dp | Payable amount. Unchanged. |
| Tax | 2dp | Tenant tax % and computed GST stay at 2dp. |

### Rounding

- Mode: **HALF_UP** (same as current QuarryLink `BigDecimal.setScale(..., HALF_UP)`).
- Where: calculate at stored rate precision; round **once** at the line-amount boundary (2dp); document total is the sum of those line amounts, rounded once.
- Do not pre-round unit prices to 2dp and then multiply.

## QuarryLink monetary storage

All money columns inspected are `NUMERIC` / `BigDecimal`. **No `float` / `double` / `real` money columns.**

| Class | Column scale after this change |
|---|---|
| Unit rates and prices (`job_items`, `quote_items`, `quarry_supplier_products`, customer sales prices) | `NUMERIC(19,4)` |
| Quantities | Unchanged (2dp) |
| Line and document totals | Unchanged (2dp) |

Values on the API are stored in **cents** (`$2.2450` → `224.50`). Widening the column does not change existing numbers.

## Variance sources found in code

1. **Outbound cents → dollars at 2dp** in `TenantFusionAccountingApi` — a stored `224.50` became `2.25` before Fusion saw it.
2. **Acumatica `UnitPrice` serialised at 2dp** in `MyobAcumaticaSalesOrderPayloadBuilderService`.
3. **Frontend `dollarsToCents` truncated to integer cents** — `$2.2450` became `224`.
4. **2dp calculation path** rounded qty and price to 2dp *before* multiplying (compounding). Kept for 2dp tenants; 4dp tenants multiply then round once.

## Tenant setting (Render only)

`tenant_registry.unit_price_decimal_places` defaults to **2**. Rows whose tenant/business/id name matches `%flame%` are set to **4**. Calculation code reads the setting, never a tenant id.

## Historical data

Existing rows are not recalculated. Opening and saving a 4dp tenant job now preserves fractional cents instead of truncating them.
