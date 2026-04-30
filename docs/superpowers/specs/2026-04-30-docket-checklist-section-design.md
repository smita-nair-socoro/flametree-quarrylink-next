# Docket Form — Checklist Section Design

**Date:** 2026-04-30
**Branch:** feature/QLINK-1836-truck-inspection-driver-checklist-api-integration

## Overview

Add a "Checklist" section inline in `docket-form.tsx`, displayed below the Assignment section, when viewing an existing docket in statuses where compliance data is relevant.

## Visibility

Renders only when **all** of the following are true:
- `isEditing` is `true`
- `selectedDocket` is non-null
- `selectedDocket.docketStatus` is one of:
  - `DOCKET_STATUS.IN_TRANSIT`
  - `DOCKET_STATUS.STOPPED`
  - `DOCKET_STATUS.ARRIVED`
  - `DOCKET_STATUS.DELIVERED`
  - `DOCKET_STATUS.INVOICED`

## Layout

A single `<div>` with a `border rounded-md p-4` wrapper containing a `grid grid-cols-2 gap-4` of two cards.

### Each card structure

```
┌────────────────────────────────────────┐
│ 📄 Pre-Start Checklist   View Full Report │
│                                          │
│  ✅ Driver OK                            │
│  ✅ BAC                                  │
└────────────────────────────────────────┘
```

- **Header row**: `FileText` icon (already imported) + bold title + "View Full Report" as a blue underlined `<span>` — static, no onClick handler (API not ready)
- **Item rows**: icon + label text

### Cards

| Card | Title | Items |
|------|-------|-------|
| Left | Pre-Start Checklist | "Driver OK", "BAC" |
| Right | Truck Inspection | "Truck OK", "Trailer OK" |

## Data Source

Both checklists come from `selectedDocket`:
- `selectedDocket.driverChecklist` → Pre-Start card
- `selectedDocket.truckChecklist` → Truck Inspection card

## Icon Logic

Per checklist object:
- `hasIssues === false` → `CircleCheck` with `text-green-500` for all items
- `hasIssues === true` → `CircleX` with `text-red-500` for all items
- checklist is `null`/`undefined` → show muted "Not completed" text, no item rows

## New Imports

Add to existing `lucide-react` import in `docket-form.tsx`:
- `CircleCheck`
- `CircleX`

No new files, no new hooks, no API calls.
