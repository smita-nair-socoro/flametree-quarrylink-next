# Feature Spec — Internal Transfer Jobs and Dockets

| | |
|---|---|
| **Client** | Flame Tree |
| **Prepared** | 1 September 2026 |
| **Status** | Ready for build — no open items |
| **Audience** | Developer (Cursor) |
| **Related** | `spec-payments-tab.md` (adds an Internal Transfers sub-tab) · `spec-job-list-quarry-and-po-columns.md` (the Jobs tab, §3.4 below) · `spec-decimal-precision-acumatica-balancing.md` (journal amounts follow those rules) |

---

## 1. Summary

Support material moving **between Flame Tree's own sites**.

An **Internal Transfer job type** holds a From Site and a To Site. Only **internal transfer dockets** can be raised against it. There is no customer, no invoice and no cash sale.

Transfers are valued at **cost price**, moving value without creating internal profit. On completion, QuarryLink **creates a GL journal transaction in Acumatica via the API** — cost out of the source site, cost in to the destination site.

Completed transfers are corrected by a permission-gated **Void** (§12). Voiding is terminal — it reverses the journal and closes the docket permanently; a redo is a new docket.

---

## 2. The reference implementation

**Internal transfer dockets already exist** in the NWQC project. That implementation is the starting point — reuse its modal, its fields and its cost-price valuation.

**The one structural difference: NWQC has no jobs.** Its internal transfer docket carries From Site and To Site on the docket itself, chosen per docket.

**Flame Tree have jobs.** So From Site and To Site move up to the job, and dockets inherit them. Everything else about the docket carries across.

---

## 3. The Internal Transfer job type

A new job type. Selecting it changes what the job can hold.

### 3.1 Fields

| Field | Notes |
|---|---|
| **From Site** | Required. The supplying site |
| **To Site** | Required. The receiving site |
| **Customer** | **Not present.** No customer field is shown or stored |

**Both dropdowns list only Flame Tree's own sites.** No customers, no external suppliers — internal transfers move material between sites the business owns.

> **Terminology:** *Site* is the same entity displayed as **Quarry / Supplier** on job line items elsewhere. One record, two labels in the existing UI. Use *Site* in this feature, matching the existing internal transfer modal.

### 3.2 What the job type restricts

- **Only internal transfer dockets** can be raised against an internal transfer job.
- Delivery and collection dockets are unavailable on it.
- Conversely, **internal transfer dockets cannot be raised against any other job type.**
- The job never produces an invoice or a cash sale, and never appears in invoice or cash sale docket selection screens.

### 3.3 From Site and To Site are locked once set

Dockets **inherit the job's From Site and To Site and display them read-only.** One job, one movement direction.

If material needs to move a different direction or between a different pair of sites, that is a different job.

### 3.4 Internal transfer jobs live on their own tab

**Internal transfer jobs are not listed in the main Jobs table.** The Jobs page carries two tabs:

| Tab | Contents |
|---|---|
| **Jobs** | Customer jobs, as today — with the Quarry / Supplier and PO columns from `spec-job-list-quarry-and-po-columns.md` |
| **Internal Transfers** | Internal transfer jobs only |

**Why separate rather than mixed in.** An internal transfer job has no customer, no PO and no line-item quarry. Listing it in the Jobs table would mean either empty cells across three columns, or placeholder values invented to fill them — and it would force a job-type branch into the column aggregation logic. Splitting the tabs means each table shows real data for every row, and neither needs to know about the other's job type.

**The Jobs tab excludes internal transfer jobs at the query.** Do not write a job-type conditional inside the column logic — there is nothing for it to handle.

#### Internal Transfers tab columns

| Column | Notes |
|---|---|
| Job Number | |
| From Site | |
| To Site | |
| Dockets | Count of transfer dockets on the job |
| Status | Existing job status |
| Account Manager | |
| *(actions)* | Row menu, as the Jobs tab has |

- Sortable columns, consistent with the Jobs tab.
- Keyword search across job number, from site and to site.
- No Customer, PO or Quarry / Supplier columns — none of them apply.
- No KPI cards.

---

## 4. The Internal Transfer docket

Reuse the existing docket modal, minus the site pickers.

### 4.1 Modal

- Title: **Internal Transfer Docket**
- Subtitle: *"Track material moving between your sites. No customer sale or invoice is created."*
- Type indicator: **⇄ INTERNAL TRANSFER**
- Primary action: **Create Internal Transfer**, alongside **Cancel**

### 4.2 Sections and fields

**Product & Vehicle Details**

| Field | Required | Notes |
|---|---|---|
| Product | Yes | |
| Quantity | Yes | |
| UOM | Yes | |
| Product Density (TN/m³) | No | |

**From Site and To Site do not appear here.** They come from the job and are displayed read-only, so the operator can see the movement without being able to change it.

**Delivery Information**

- **Pick Up Address** and **Delivery Address**, derived from the job's From Site and To Site.
- The map, as in the existing modal.

**Time & Contact Details**

| Field | Required |
|---|---|
| Transfer Date | Yes |
| Start Time | Yes |
| End Time | Yes |
| Contact Name | No |
| Contact Phone | No |
| Docket Email | No — recipients for transfer notifications |
| Notes | No |

**Transfer Summary**

| Line | Notes |
|---|---|
| Quantity | |
| Cost price | Per unit — e.g. `$26.00 / TN` |
| Product cost | Quantity × cost price |

> The existing modal heads this block **Sale Summary**. **Rename it to Transfer Summary.** No sale occurs — the modal's own subtitle says so — and calling it a sale invites exactly the misunderstanding this feature exists to prevent.

### 4.3 Completion

Internal transfer dockets **reuse the existing completion actions and statuses**. Nothing new is introduced in the docket lifecycle.

Once completed, the only action available is **View Journal**. Invoice and Cash Sale are never offered, in any state, from any surface.

---

## 5. Valuation — cost price

Transfers are valued at **cost price**, using the same mechanism as the existing implementation.

**This is deliberate, and matches the existing NWQC implementation.** The transfer **moves value without creating internal profit**. The source site is relieved of cost; the destination site takes it on. Neither books a margin.

**Consequences to hold onto:**

- **No revenue is created anywhere** by an internal transfer. Nothing about this feature should appear in revenue reporting.
- **No tax applies** — see §5.1.
- Amounts follow the precision and rounding rules in `spec-decimal-precision-acumatica-balancing.md`.

**Missing cost price.** If a product has no cost price for the source site, the docket cannot be valued. Block creation with a clear message naming the product and site, rather than writing a zero-value transfer that quietly journals nothing.

### 5.1 No tax on an internal transfer

**Flame Tree's sites are all part of one legal entity.** Material moving between them is not a supply from one party to another — it is stock changing location within a single business.

**No VAT, no GST, no tax of any kind is calculated, stored or sent** for an internal transfer.

- The docket carries no tax line.
- The Transfer Summary shows no tax.
- **The journal payload carries no tax figure** and needs no tax account.
- The journal is two-sided and balances at cost, with nothing left over to post anywhere.

This is a deliberate departure from how a delivery or collection docket is treated. A supply to a customer is taxable; moving your own stock between your own yards is not.

---

## 6. The Acumatica journal

On completion of an internal transfer docket, QuarryLink **creates a GL journal transaction in Acumatica via the API**.

### 6.1 The two sides

| Side | Treatment |
|---|---|
| **From Site** | **Credit** — cost out |
| **To Site** | **Debit** — cost in |

Cost out, cost in. Equal and opposite, at cost price. **No margin, no revenue, no tax leg.** Two sides, and they balance — there is no third amount to post anywhere.

### 6.2 Account codes

**Acumatica derives the accounts.** QuarryLink sends the transfer with the identifying information — from site, to site, product, quantity and cost value — and Acumatica's own rules determine which GL accounts are used. **No tax figure is sent** (§5.1).

QuarryLink holds **no account code configuration** for this. Do not build an account mapping table.

The developer establishes what identifiers Acumatica needs when inspecting the journal API.

### 6.3 Failure handling

**Identical to cash sales** — see `spec-cash-sale-recording.md` §9:

- The docket completes in QuarryLink regardless of whether Acumatica accepts the journal.
- Transient failures retry with backoff; permanent rejections stop immediately, are marked `Failed`, and store Acumatica's error text.
- Sync status uses the same three states: `Synced` / `Failed` / `Not synced`.
- A **Retry** action on failed records.
- Visibility is **in-app only** — alert badge and notification banner. **No emails.**
- Retries are idempotent; a duplicate response means the journal landed and marks the record `Synced`.

Do not build a second sync mechanism. This is the same one carrying a different document type.

---

## 7. Stock movement — none

**Flame Tree do not have the Stockpile module.** An internal transfer moves no stock in QuarryLink.

The transfer is a **journal only**: it records that material moved between two sites and pushes the accounting entry to Acumatica. There is no stockpile to decrement at the From Site or increment at the To Site, and nothing in this build should attempt one.

---

## 8. Where internal transfers are visible

**Both job level and cross-job.**

### 8.1 Job level

Internal transfer dockets appear on the job's dockets, with their sync status alongside.

### 8.2 Payments → Internal Transfers

A **third sub-tab** in the Payments area, alongside Invoices and Cash Payments. Same table pattern.

| Column |
|---|
| Docket |
| Job |
| From Site |
| To Site |
| Product |
| Quantity |
| Cost value |
| Date |
| Accounting Sync — with Retry on failures |
| *(actions)* — View Docket, View Journal, Retry Sync |

- Keyword search across docket, job, from site, to site and product.
- The same date range control as the other sub-tabs.
- No KPI cards.

---

## 9. Rules and edge cases

1. **From Site and To Site must differ.** Block selection of the same site for both on the job.
2. **Both must be set** before dockets can be raised against the job.
3. **Changing a job's sites after dockets exist** must be blocked — existing dockets and journals reference them.
4. **A job holds many dockets**, all moving between the same two sites, each with its own product, quantity and date.
5. **Different products on one job are fine.** The job fixes the route, the docket fixes the material.
6. **Journal creation and docket completion commit together.** A completed docket with no journal queued is the state to avoid.
7. **Existing dockets are unaffected.** No migration, no reclassification.
8. **Reporting.** Internal transfers create no revenue (§5). Anything reporting revenue must exclude them; anything reporting movement volumes should include them. Check existing reports before release.

---

## 10. Acceptance criteria

**Job type**

- [ ] Internal Transfer is available as a job type
- [ ] The job carries From Site and To Site, both required
- [ ] Both dropdowns list only Flame Tree's own sites
- [ ] No customer field is shown or stored on an internal transfer job
- [ ] From Site and To Site cannot be the same
- [ ] Only internal transfer dockets can be raised against an internal transfer job
- [ ] Internal transfer dockets cannot be raised against any other job type
- [ ] A job's sites cannot be changed once dockets exist
- [ ] The job never produces an invoice or cash sale and never appears in their selection screens

**Jobs page tabs**

- [ ] The Jobs page carries Jobs and Internal Transfers tabs
- [ ] Internal transfer jobs appear only on the Internal Transfers tab
- [ ] The Jobs tab excludes them at the query, with no job-type conditional in the column logic
- [ ] The Internal Transfers tab shows Job Number, From Site, To Site, Dockets, Status, Account Manager and row actions
- [ ] Its columns are sortable and keyword search covers job number, from site and to site
- [ ] No Customer, PO or Quarry / Supplier columns appear on that tab

**Docket**

- [ ] The modal is titled Internal Transfer Docket with the ⇄ INTERNAL TRANSFER indicator
- [ ] Product, Quantity and UOM are required; Product Density is optional
- [ ] From Site and To Site display read-only from the job and cannot be changed
- [ ] Pick Up and Delivery addresses derive from the job's sites
- [ ] Transfer Date, Start Time and End Time are required
- [ ] Contact Name, Contact Phone, Docket Email and Notes are present and optional
- [ ] The summary block is headed **Transfer Summary** and shows quantity, cost price per unit and product cost
- [ ] Completion reuses the existing actions and statuses
- [ ] A completed docket offers View Journal only

**Valuation**

- [ ] Dockets are valued at cost price for the product at the source site
- [ ] A product with no cost price blocks creation with a message naming the product and site
- [ ] No tax is calculated, stored, displayed or sent anywhere for an internal transfer
- [ ] The Transfer Summary shows no tax line
- [ ] Amounts follow the agreed precision and rounding rules
- [ ] No revenue is recorded anywhere as a result of an internal transfer

**Journal**

- [ ] Completing a docket creates a GL journal transaction in Acumatica
- [ ] The From Site is credited and the To Site debited, at cost, equal and opposite
- [ ] QuarryLink sends identifiers and lets Acumatica derive the accounts
- [ ] The journal payload contains no tax figure
- [ ] The journal balances on two sides with no third leg
- [ ] No account mapping configuration exists in QuarryLink
- [ ] Journal creation and docket completion commit together
- [ ] A failed journal push does not prevent docket completion
- [ ] Transient failures retry; permanent rejections stop and are marked `Failed` with Acumatica's error text
- [ ] Retry re-attempts and does not create duplicate journals
- [ ] Sync uses the same three states as invoices and cash payments
- [ ] Failures surface via alert badge and banner, with no emails sent

**Stock**

- [ ] No stock movement occurs — Flame Tree have no Stockpile module

**Visibility**

- [ ] Dockets and sync status appear at job level
- [ ] A third Payments sub-tab lists them cross-job with the specified columns
- [ ] Search and date range work on that sub-tab

**Void**

- [ ] A docket can be edited freely before completion, with no void and no special permission
- [ ] No journal exists and no stock has moved until the docket is completed
- [ ] Void is gated by the existing `Void Transactions` permission — no per-feature void permission is created
- [ ] Void is reachable from the docket and from the Payments row
- [ ] Void requires a reason
- [ ] Void creates a reversal record and never deletes or alters the original
- [ ] The voided docket stays listed, badged VOID, showing who, when and why
- [ ] **A voided docket is terminal — it cannot be edited, re-completed or returned to a pre-completion state**
- [ ] Redoing a transfer means raising a **new docket with a new reference**
- [ ] The voided reference is never reused
- [ ] No successor link is built between a voided docket and its replacement
- [ ] Voiding a `Synced` transfer pushes a reversing journal to Acumatica
- [ ] Voiding a `Not synced` or `Failed` transfer cancels the pending push and sends nothing
- [ ] The void and the push cancellation commit in one transaction
- [ ] The sync worker re-checks docket state at dispatch and aborts if it is VOID
- [ ] A journal that escapes despite the void falls through to the `Synced` path and a reversing journal is pushed
- [ ] No sequence of void and retry can leave Acumatica holding an unreversed journal
- [ ] A failed reversing journal shows as `Failed` and is retryable
- [ ] Void commits transactionally across reversal, docket state and journal
- [ ] A voided docket cannot be un-voided
- [ ] A voided transfer shows who completed the original, who voided it, when and why
- [ ] No void report is built
- [ ] No emails are sent on void

**Regressions**

- [ ] Delivery and collection dockets behave exactly as before
- [ ] Invoice and cash sale flows are unaffected
- [ ] Revenue reporting does not include internal transfers

---

## 11. Decisions taken

| # | Question | Decision |
|---|---|---|
| 1 | What moves | Material between Flame Tree's own sites |
| 2 | How it is structured | An Internal Transfer **job type** holding From Site and To Site; only internal transfer dockets can be raised against it |
| 3 | Customer | None. No customer field on the job |
| 4 | Site dropdowns | Flame Tree's own sites only |
| 5 | Site changes on the docket | Not permitted — inherited from the job, read-only |
| 6 | Valuation | **Cost price.** No margin, no revenue created |
| 7 | Journal | Cost credited out of From Site, debited in to To Site |
| 8 | Account codes | Acumatica derives them — no mapping in QuarryLink |
| 9 | Tax | **None.** One legal entity, so an internal movement is not a taxable supply. No tax calculated, stored or sent |
| 10 | Docket fields | The full existing field set, minus the site pickers |
| 11 | Summary block | Renamed **Transfer Summary** |
| 12 | Stock | None — Flame Tree have no Stockpile module. Journal only |
| 13 | Visibility | Own tab on the Jobs page, job level, and a third Payments sub-tab |
| 14 | Pre-completion changes | Allowed and normal. The journal only exists on completion, so nothing needs unwinding before then |
| 15 | Corrections after completion | **Void**, gated by the existing `Void Transactions` permission — reverses the journal, audited. **No void report, no emails** |
| 16 | What a void leaves behind | A terminal, immutable `VOID` docket. The redo is a **new docket with a new reference**, not the old one reopened |
| 17 | Void / sync race | Void and cancel commit together; the worker re-checks at dispatch; an escaped push falls through to the `Synced` reversal path |
| 18 | Where transfer jobs are listed | Their own **Internal Transfers** tab on the Jobs page, not mixed into the Jobs table |

---

## 12. Corrections — Void

A completed internal transfer docket is not editable. **Void** is the single correction path, matching the approach taken for cash sales.

The design principle is the same: **a correction is an entry in the audit trail, not a hole in it.** Nothing is deleted or overwritten.

### 12.1 When corrections are needed at all

**The journal is only created on completion** — when the docket is marked delivered or collected. Before that point no journal exists and no stock has moved.

| Docket state | Corrections |
|---|---|
| **Before completion** | **Edit the docket under the platform's existing docket editing rules.** No journal exists, nothing to unwind. Nothing new is introduced — no special permission, no void, no audit ceremony |
| **After completion** | The journal exists and stock has moved. **Void** is the only correction path |

Do not gate ordinary pre-completion editing behind any of the machinery below. A quantity being corrected before the load is signed off is routine data entry, not a financial correction.

### 12.2 Permission

Gated by the existing **`Void Transactions`** permission — the same right that gates cash sale voids (`spec-cash-sale-recording.md` §12.5).

- **One void permission across the product.** Do not create a per-feature void permission.
- Grantable independently of the Admin role.
- Granted to no role by default — it must be assigned deliberately.

### 12.3 What Void does

**Voiding does not reopen the docket. It closes it permanently and you raise a new one.**

This is the part most likely to be got wrong, so it is stated as a data-model requirement rather than a behaviour:

| | |
|---|---|
| **The voided docket** | Terminal state. Immutable. Badged **`VOID`** forever. Reference retired and never reused. It is an audit record, not a draft |
| **The redo** | A **new internal transfer docket with a new reference**, raised on the same job like any other |

A voided docket is never edited, never re-completed, and never returns to a pre-completion state. Nothing about it changes after the void except that it is voided.

**The mechanics:**

- Available from the docket's `⋯` menu and from the Payments → Internal Transfers row.
- **Requires a reason.** A short selectable list plus free text: *Recorded in error* · *Wrong product* · *Wrong quantity* · *Wrong job* · *Acumatica rejection — unrecoverable* · *Other*.
- Creates a **reversal record**. The original docket is never deleted or altered.
- The original remains listed and viewable, badged **`VOID`**, showing who voided it, when and why.
- **A void cannot be undone.** Raise a new docket instead.

**No link between the voided docket and its replacement is required.** Both sit on the same job in date order, one badged `VOID` and one live, which is enough to follow. Do not build a successor relationship.

### 12.4 Void and Acumatica

| Original journal state | On void |
|---|---|
| `Synced` | Push a reversing journal to Acumatica. The reversal carries its own sync status |
| `Not synced` | Cancel the pending push. Nothing goes to Acumatica |
| `Failed` | Cancel the pending push. Nothing goes to Acumatica |

A void whose reversing journal fails to reach Acumatica is itself a sync failure and must appear as `Failed` alongside the rest (§6.3). It must not silently leave the two systems disagreeing.

**The race, and how to settle it.** A retry could fire between the void being actioned and the pending push being cancelled, sending the journal to Acumatica moments before or after the void lands.

**Do not try to guarantee the cancellation wins.** Guarantee instead that both outcomes converge on the same correct end state:

1. **Void and cancel in one transaction.** Setting the docket to `VOID` and marking the queued push cancelled commit together.
2. **The sync worker re-checks state at dispatch.** Immediately before sending — inside whatever lock claims the job — it re-reads the docket. If it is `VOID`, it aborts and sends nothing.
3. **If a push escapes anyway** — already in flight, unrecallable — **fall through to the `Synced` path.** The journal landed, so push the reversing journal as though the transfer had been `Synced` at the point of voiding.

Step 3 is the one that actually makes this safe. Steps 1 and 2 shrink the window; step 3 means it doesn't matter if something slips through. The two systems end up agreeing either way — either nothing was ever sent, or a journal and its reversal were both sent.

### 12.5 Oversight

Voided transfers stay listed, de-emphasised and badged **`VOID`**, on the job's dockets and in the Payments → Internal Transfers table. Opening one shows who completed the original docket, who voided it, when, and the reason.

**No void report is built, and no emails are sent.** The tables already carry every fact a report would restate. The `Void Transactions` permission is the control; the VOID rows are the record.

### 12.6 What is still not possible

- Editing a **completed** docket's product, quantity or value — void it and raise a new one (pre-completion editing follows existing rules, §12.1)
- Changing the job a docket belongs to
- Deleting a docket or a journal
- Editing a voided docket, in any way, for any reason
- Un-voiding
- Voiding by a user without `Void Transactions`

---

## 13. Risks

| Risk | Note |
|---|---|
| **Cost price availability** | Valuation depends on a cost price existing per product per site. Confirm this is populated for every product Flame Tree will transfer, or the feature blocks at docket creation. |
| **Journal API capability** | Whether Acumatica accepts GL journal transactions over the existing integration is unconfirmed. Establish this first; everything downstream depends on it. |
| **Two implementations of one concept** | Internal transfers now exist in two shapes — site-level (NWQC) and job-level (Flame Tree). Reuse as much as possible, or they will drift. |
| **`Void Transactions` must be assigned deliberately** | The permission defaults to nobody. If it is never granted, there is no correction path and an erroneous completed transfer becomes unrecoverable. Assign it to at least one person as part of go-live — the same assignment that unblocks cash sale voids. |
| **Nothing surfaces a void proactively** | No email, no report — deliberately, to avoid building extra. A void is visible in the tables to anyone who looks. That puts the whole weight of the control on `Void Transactions` being granted narrowly. |

---

## 14. Out of scope

- Modelling construction projects, cost centres or internal departments in QuarryLink
- GL account configuration or mapping within QuarryLink
- Changes to the existing NWQC site-level implementation
- Invoicing or cash sale of internal transfer dockets
- Transfers to or from anything other than Flame Tree's own sites
- Changes to how delivery or collection dockets work
- Editing a completed or voided docket, or un-voiding
- Email alerts of any kind
- A void report or any other new reporting surface
- Reporting beyond the Payments sub-tab
- Tax handling of any kind on an internal transfer
- A successor link between a voided docket and its replacement
