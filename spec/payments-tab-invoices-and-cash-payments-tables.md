# Feature Spec — Payments Tab: Invoices and Cash Payments Tables

| | |
|---|---|
| **Client** | Flame Tree |
| **Prepared** | 1 September 2026 |
| **Status** | Ready for build |
| **Audience** | Developer (Cursor) |
| **Related** | `spec-cash-sale-recording.md` — the Cash Payments table surfaces the receipts that spec creates · `spec-internal-transfer-dockets.md` — the third sub-tab |

---

## 1. Summary

Introduce a top-level **Payments** area containing two sub-tabs:

- **Invoices** — the invoice table that today only exists inside a job, lifted to its own cross-job table
- **Cash Payments** — the equivalent table for cash sale receipts

A third sub-tab, **Internal Transfers**, sits alongside them — see `spec-internal-transfer-dockets.md` §8.2.

Both show **accounting sync status**, so a failed push to Acumatica is visible in one place rather than discovered at reconciliation.

**Payments replaces the Invoices item in the main navigation.** Invoices becomes a sub-tab within it.

---

## 2. What this is and isn't

**This is a surfacing change.** It takes data that already exists and gives it a cross-job home with sync visibility.

**It is not a change to how anything syncs.** ⚠️ **Flame Tree's invoice sync runs sales order → invoice, driven by the Acumatica process.** **That setup must be retained exactly as it is.** This spec changes where invoices are *displayed* and adds a sync status column. It does not alter the sync mechanism, its triggers, its sequence or its behaviour.

Any change to Flame Tree's existing invoice sync behaviour as a result of this work is a defect.

---

## 3. Navigation

- **Payments** replaces the existing **Invoices** navigation item.
- Inside Payments, three sub-tabs: **Invoices** (default), **Cash Payments** and **Internal Transfers**.
- Existing routes to the invoice list must not break. Redirect the old path to `Payments → Invoices` rather than leaving a dead link.

---

## 4. Payments → Invoices

A cross-job table of all invoices.

### 4.1 Columns

| Column | Notes |
|---|---|
| Invoice Number | |
| Job | Which job the invoice belongs to |
| Dockets | Count of included dockets |
| Amount | |
| Due Date | |
| Status | Existing invoice status badge |
| Accounting Sync | Status badge, with a **Retry** action on failures — §7 |
| *(actions)* | `⋯` menu → **View Invoice** |

Sortable columns, consistent with other tables in the app.

### 4.2 KPI summary cards

Four cards above the table, matching the existing pattern:

| Card | Shows |
|---|---|
| **Total Invoices** | Count of all customer invoices |
| **Overdue Invoices** | Count past due date and unpaid, with the sub-label *Past due date and unpaid* |
| **Value of Uninvoiced Dockets** | Total value, broken down as *X Delivery │ Y Collection* |
| **Due Payment** | Count of outstanding invoices awaiting payment |

Cards reflect the full data set, not the current page.

### 4.3 Due date range

A due date range control above the table, matching the existing pattern:

- The active range displayed as a label — e.g. *04 Jun 2026 – 01 Sep 2026*
- Presets: **Today**, **Last 7 days**, **This month**, **Last 90 days**, **Clear dates**
- Two date pickers for a custom from/to range
- The selected preset is visibly active

**The range filters the table only. It does not drive the KPI cards** — the cards always reflect the full data set (§4.2). A count of overdue invoices that changes when someone picks a date preset is a worse number than one that doesn't, because it stops answering the question the card is there to answer.

### 4.4 Search

A keyword search field, matching partially against invoice number, job and customer.

### 4.5 Failed-only toggle

**A simple toggle above the table: `Failed only`.** Off by default. On, the table shows only rows whose Accounting Sync is `Failed`.

This is **not** the filter chip pattern excluded below — it is one toggle, one state, no dropdown. It exists because the whole failure-recovery workflow (§7.3) depends on being able to see just the failures, and sorting by the sync column and scanning is not that.

The alert badge and notification banner (§7.3) link straight to the table with this toggle already on.

**Sync status is not in the keyword search** (§4.4). Typing "failed" into the search box finds nothing — the toggle is the mechanism.

### 4.6 Not included

The equivalent page in the blueprint product carries more than the above. **These parts are not in scope:**

- ❌ Source / Status / Type / Customer filter chips *(the `Failed only` toggle at §4.5 is not one of these)*
- ❌ Show voided toggle
- ❌ Show/Hide Columns
- ❌ Prepaid invoice actions

They can be added later once the table is in use.

---

## 5. Payments → Cash Payments

A cross-job table of all cash sale receipts.

### 5.1 Columns

| Column | Notes |
|---|---|
| Cash Sale | The `CS-` reference |
| Job | Which job the receipt belongs to |
| Customer | |
| Dockets | Count badge |
| Amount | |
| Recorded Date | |
| Payment Type | Badge — Cash / EFTPOS / EFT / Credit Card / M-PAISA |
| Payment Received By | |
| Accounting Sync | Status badge, with **Retry** on failures — §7 |
| *(actions)* | `⋯` menu |

Voided receipts appear de-emphasised and badged **`VOID`**, as they do on the job-level tab.

### 5.2 Actions

The `⋯` menu carries the same actions and the same permission gates as the job-level Cash Sales tab — View Details, Download Receipt, Amend Payment Type, Void, Retry Sync. See `spec-cash-sale-recording.md` §10.3 and §12.

**Do not build a second set of actions.** Same components, same permissions, two locations.

### 5.3 Date range

The same due date range control as §4.3, applied to Recorded Date — same presets, same custom pickers.

### 5.4 Search

Keyword search matching partially against cash sale reference, job, customer, payment type, payment received by, and amount.

### 5.5 Failed-only toggle

The same `Failed only` toggle as §4.5, behaving identically. Sync status is not in the keyword search here either.

### 5.6 Not included

No KPI summary cards on this sub-tab. The four cards in §4.2 are invoice measures and have no cash payment equivalent.

---

## 6. Payments → Internal Transfers

A third sub-tab listing internal transfer dockets and their journal sync status.

**Its columns, actions, search and date range are specified in `spec-internal-transfer-dockets.md` §8.2** — that spec owns the detail, this one owns the fact that the sub-tab exists and sits alongside the other two.

What carries over from here without restatement: the same sync status vocabulary (§7), the same `Failed only` toggle (§4.5), the same Retry behaviour, and the same table conventions.

---

## 7. Accounting sync status — one vocabulary

Both tables use the **existing invoice table's wording**, not a new one:

| Status | Meaning |
|---|---|
| `Synced` | Acumatica has it |
| `Failed` | Attempted and unsuccessful. A **Retry** action appears beneath the badge |
| `Not synced` | Not sent yet, in progress, or not applicable to this record type |

These three are the only sync states in the product. They apply to invoices, cash payments and internal transfers alike, in every place sync status appears — the Payments tables, the job-level tabs, and record detail views.

**Confirm the mapping for Flame Tree's invoices before building the badge.** Their invoice sync runs sales order → invoice, driven by the Acumatica process (§2) — a different path from the standard flow this vocabulary was written for. This is a **new display layer over unchanged behaviour**, so the risk is not that the sync breaks but that a real intermediate state has no honest badge.

Two rules:

- **Anything not definitively `Synced` or `Failed` displays as `Not synced`.** That state deliberately covers "not sent yet, in progress, or not applicable".
- **If a state is found that `Not synced` misrepresents rather than merely simplifies, raise it — do not invent a fourth badge.** Adding a status to make one client's flow fit would fork the vocabulary the rest of this work depends on.

### 7.1 Retry

- Appears only on `Failed` rows.
- Re-attempts the push.
- Available to the same roles as today for invoices; for cash payments, per the cash sale spec.
- Most failures are fixed **in Acumatica** — reopening a period, mapping a customer — and then the same record syncs on retry. Retry is what turns those from a developer ticket into a two-minute job.

### 7.2 Error detail

Where a sync has failed, the underlying error from Acumatica must be visible — on hover, in the row's detail view, or on the record itself. *"Failed"* alone doesn't tell anyone what to fix.

### 7.3 Working through failures

These tables are where sync failures get worked. **The `Failed only` toggle (§4.5, §5.5)** gives whoever owns the problem a working list, in the place they already are.

That toggle is the mechanism. There is no sync filter chip and no sync term in the keyword search — if the toggle is not built, this workflow does not exist.

The in-app signals described in `spec-cash-sale-recording.md` §9.4 — an alert badge carrying the count of `Failed` records, and a notification banner linking to the filtered table — drive people here. **No emails are sent.**

---

## 8. Job-level tables are unchanged

The job's own **Invoices** and **Cash Sales** tabs stay exactly as they are, scoped to that job.

Same data, two lenses: people working a job stay in the job; people chasing payments or sync failures across the business use Payments. Neither replaces the other.

The sync status column and Retry action should appear in both places, driven by the same components.

---

## 9. Rules and edge cases

1. **Empty states.** Each sub-tab shows a proper empty state — not a bare table with headers.
2. **Pagination and sorting are server-side**, working across the full result set rather than a loaded page.
3. **Search combines with sorting** without resetting it.
4. **Permissions.** Users see only what they can already see today. Making invoices cross-job must not expose invoices for jobs a user couldn't otherwise access.
5. **A record appears identically in both places.** The job-level and Payments views of the same invoice or receipt show the same status, amount and sync state. They read from the same source, not from separate queries that can drift.
6. **Retry is idempotent.** Repeated clicks must not create duplicate documents or payments in Acumatica.
7. **Deleted or archived jobs.** Their invoices and receipts remain in the Payments tables. A financial record isn't hidden because its job was tidied away.

---

## 10. Acceptance criteria

**Navigation**

- [ ] Payments replaces Invoices in the main navigation
- [ ] Payments contains Invoices and Cash Payments sub-tabs, Invoices default
- [ ] The old invoices route redirects to Payments → Invoices rather than breaking

**Invoices table**

- [ ] Lists all invoices across jobs
- [ ] Columns: Invoice Number, Job, Dockets, Amount, Due Date, Status, Accounting Sync, actions
- [ ] Columns are sortable
- [ ] `⋯` menu offers View Invoice
- [ ] Keyword search matches invoice number, job and customer, partially
- [ ] Four KPI cards show Total Invoices, Overdue Invoices, Value of Uninvoiced Dockets (split Delivery / Collection) and Due Payment
- [ ] KPI cards reflect the full data set, not the current page
- [ ] A due date range control offers Today, Last 7 days, This month, Last 90 days and Clear dates
- [ ] Custom from/to date pickers work alongside the presets
- [ ] The active preset is visibly indicated and the range is labelled
- [ ] The date range filters the table
- [ ] A `Failed only` toggle sits above the table, off by default
- [ ] Turning it on shows only rows whose Accounting Sync is `Failed`
- [ ] The alert badge and notification banner link to the table with the toggle already on
- [ ] The date range filters the table but does not change the KPI cards
- [ ] No filter chips, voided toggle or column chooser are present

**Cash Payments table**

- [ ] Lists all cash sale receipts across jobs
- [ ] Columns: Cash Sale, Job, Customer, Dockets, Amount, Recorded Date, Payment Type, Payment Received By, Accounting Sync, actions
- [ ] Voided receipts show de-emphasised and badged VOID
- [ ] `⋯` menu carries the same actions and permission gates as the job-level tab
- [ ] Keyword search matches reference, job, customer, payment type, received by and amount
- [ ] The same date range control filters by Recorded Date
- [ ] No KPI cards appear on this sub-tab
- [ ] The same `Failed only` toggle is present and behaves identically

**Sync**

- [ ] All three tables show Synced / Failed / Not synced using the existing invoice wording
- [ ] Flame Tree's sales-order-driven invoice states map onto the three badges without a fourth being added
- [ ] Anything not definitively Synced or Failed displays as Not synced
- [ ] Retry appears only on Failed rows
- [ ] Retry re-attempts the push and succeeds once the cause is fixed in Acumatica
- [ ] Repeated Retry does not create duplicates in Acumatica
- [ ] Acumatica's error detail is reachable from a failed row

**Preservation — the important ones**

- [ ] **Flame Tree's existing invoice sync behaviour is completely unchanged**
- [ ] The sales-order-driven process still runs exactly as it does today
- [ ] Job-level Invoices and Cash Sales tabs are unchanged and still scoped to their job
- [ ] The same record shows identical data in the job-level and Payments views
- [ ] No user can see invoices or receipts for jobs they could not previously access

---

## 11. Decisions taken

| # | Question | Decision |
|---|---|---|
| 1 | Job-level tables | Both stay — job view and cross-job view coexist |
| 2 | Feature scope | What Flame Tree have today, plus sync status and Retry, KPI cards, due date range and search. No filter chips, voided toggle or column chooser |
| 3 | Sync wording | `Synced` / `Failed` / `Not synced` — the only sync states in the product |
| 4 | Navigation | Payments replaces the Invoices nav item |
| 5 | Invoice sync mechanics | Untouched — Flame Tree's sales-order-driven process retained as is |
| 6 | Working failures | Done by filtering the Payments tables by `Failed` |
| 7 | Job column | On both tables |
| 8 | KPI cards | Invoices only — no cash payment equivalent. Not affected by the date range |
| 9 | Finding failures | A `Failed only` toggle on each table — not a filter chip, not keyword search |
| 10 | Internal Transfers sub-tab | Third sub-tab, detail owned by `spec-internal-transfer-dockets.md` §8.2 |
| 11 | Flame Tree's invoice states | Must map onto the existing three badges. No fourth status |

---

## 12. Out of scope

- Any change to how invoices or cash sales sync to Acumatica
- Any change to Flame Tree's sales-order-driven invoice process
- Filter chips, voided toggle, column chooser
- KPI cards on the Cash Payments sub-tab
- Prepaid invoice creation or handling
- Bulk actions on either table
- Export
- Cross-client views for QuarryLink support
