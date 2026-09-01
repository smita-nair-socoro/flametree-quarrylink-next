# Feature Spec — Record Cash Sale Against Dockets

| | |
|---|---|
| **Client** | Flame Tree |
| **Prepared** | 31 August 2026 |
| **Status** | Ready for build — no open items |
| **Audience** | Developer (Cursor) |
| **Related** | `spec-payments-tab.md` — the cross-job Cash Payments table that surfaces these receipts and their sync status |

---

## 1. Summary

Allow users to record a **full cash / electronic payment** against one or more eligible dockets **without creating an invoice**.

Confirming a cash sale:

- Creates a **Cash Sale Receipt** (`CS-0001`, `CS-0002`, …)
- Marks each included docket as **Cash Sale**, blocking invoicing and any further cash sale
- **Pushes the payment to Acumatica**
- Appears on the job's **Cash Sales tab**, viewable and downloadable as a PDF receipt

Receipts are not editable. Two audited, permission-gated correction paths exist — **Amend Payment Type** and **Void** (§12) — and failed pushes are surfaced in the **Payments → Cash Payments** table with a manual retry, an alert badge and a banner (§9.3–9.4).

---

## 2. Corrections to the source material

The material this spec was built from contains three contradictions. **These are the resolved positions — follow this document, not the source.**

| Item | Source said | Resolved |
|---|---|---|
| **Delivery dockets** | The flow diagram states *"DD can ONLY be invoiced. No cash sale allowed."* | **Wrong — superseded.** Delivery dockets **can** be cash sold, on the same terms as collection dockets. **The flow diagram is out of date and should be updated.** |
| **Receipt prefix** | Body text says `CC-0000` | **`CS-` prefix**, matching every screenshot |
| **Payment types** | Variously "Cash / EFTPOS", then EFT / Cash / EFTPOS, then five types | **Five types** — see §8 |

---

## 3. Eligibility

A docket is eligible for cash sale when **all** of the following hold:

- It is a **collection docket in Collected status**, or a **delivery docket in Delivered status**
- It is **not already invoiced**
- It is **not already marked Cash Sale**
- It is **not cancelled and not voided**

The **Cash Sale** action is hidden or disabled for any docket failing these checks.

### 3.1 Mid-flow eligibility loss

If a docket becomes ineligible while a user is mid-flow — most commonly invoiced by another user — the system must:

- **Prevent confirmation**, and
- **Display an explanatory message naming the specific docket(s)** that are no longer eligible

The message must identify *which* dockets, not just report a generic failure. Re-check eligibility server-side at the moment of confirmation, not only when the selection screen loads.

### 3.2 One job only — hard guardrail

**Every financial document contains dockets from exactly one job.** No cash sale may span jobs. This applies to invoices too and is an existing platform rule; it is restated here because the selection screen makes it easy to get wrong.

---

## 4. Entry points

### 4.1 Job → Cash Sales tab (bulk)

User clicks **Create Cash Sale** on the job's Cash Sales tab → the **selection screen** opens, listing eligible dockets **for that job only**.

### 4.2 Docket → Cash Sale action (single)

User clicks **Cash Sale** from within a specific eligible docket → **skips selection entirely** and opens the confirmation modal directly, with that docket pre-selected and its total calculated.

### 4.3 The shared docket selection screen

The existing docket selection modal (used for Create Invoice) already carries a **Cash Sale (X selected)** action alongside **Invoice (X selected)**. This is the same selection component described in §5, and both actions live on it.

**Eligibility governs the buttons independently.** A selection containing a docket that can be invoiced but not cash sold leaves Invoice enabled and Cash Sale disabled, with the reason surfaced.

---

## 5. Selection screen

Reuse the existing Create Invoice selection modal.

- **Tabs**: `All Dockets` · `Delivery Dockets` · `Collection Dockets`, each with a count
- **Search**: `Search dockets by keyword…`
- **Table columns**: Docket Number · Product · Delivery Date · QTY · Total Invoice Price — each sortable
- **Multi-select** via row checkboxes and a select-all in the header
- **Selection banner**: `X items selected`, a **Clear Selection** action, and the `Invoice (X selected)` / `Cash Sale (X selected)` actions
- **Footer**: `X dockets selected` and the **summed total** of selected dockets
- Actions repeat in the modal footer alongside **Cancel**

Only **eligible** dockets for the job appear. Selecting dockets and clicking **Cash Sale (X selected)** opens the confirmation modal.

### 5.1 Mixed docket types

A single cash sale **may include both delivery and collection dockets**, provided they are on the same job.

Because the two types are mixable, the **docket type must be visible per row** in the selection list, in the confirmation modal's docket list, on the receipt PDF and in View Details. A receipt that doesn't distinguish a DD from a CD is ambiguous the moment anyone queries it.

---

## 6. Confirmation modal

Per the existing design:

- Green confirmation tick
- Heading: **Record Cash Sale**
- Body: *"Record cash/EFTPOS payment for X docket(s)? No invoice will be created."*
- **The list of included dockets** — see §6.1
- A prominent **Total Amount Received** panel showing the summed total
- **Cancel** and **Confirm Sale ⌄** (a split button — the dropdown selects the payment type)

### 6.1 Show the dockets, not just the count

**The modal must list the docket numbers being included**, with their type and amount — not only a count and a total.

A docket count of "3" gives the user no way to notice they selected the wrong three. Wrong-docket selection is the most likely error in this flow, and this is the last screen before an action with significant consequences. The list is what makes the confirmation meaningful.

Keep it compact — docket number, type, amount, one per line. For a single-docket cash sale entered from the docket itself (§4.2), the one docket is still listed.

### 6.2 Payment type selection

The payment type is chosen from the **Confirm Sale** dropdown. The list is the five types at §8.

**A payment type must be selected before the sale can be recorded.** If the user activates the button without choosing, either present the type list rather than submitting, or block with a clear prompt. Do not default silently to Cash — a wrong payment type cannot be corrected later (§12).

### 6.3 No partial payment

- The modal **must not** allow entry of a smaller amount.
- The system records the **full total** of the selected dockets.
- The amount field is display-only.

---

## 7. On confirm — system actions

### 7.1 Create the Cash Sale Receipt

| Field | Value |
|---|---|
| Reference | Sequential, `CS-` prefix, **one continuous sequence** |
| Job | Linked job ID |
| Dockets | Included docket IDs — one-to-many |
| Total amount received | Sum of included docket totals |
| Payment type | The type selected on Confirm Sale |
| Recorded date/time | Time of confirmation |
| Recorded by | Current logged-in user |
| Created by / Created timestamp | Audit fields |

**Recorded date and "paid date" are the same value.** Payment is recorded at the moment of confirmation; there is no separately captured payment date. Use one timestamp and label it consistently — **Recorded Date** — everywhere it appears. (The View Details mock labels it *Paid Date*; align it.)

### 7.2 Update each included docket

- Mark the docket **Cash Sale**
- Hide or disable all invoicing actions
- Prevent any further cash sale against it

### 7.3 Push to Acumatica

See §9.

### 7.4 Atomicity

Creating the receipt and updating the dockets is **one transaction**. A partial write — receipt created, dockets not updated — leaves dockets that can be invoiced *and* have been paid for. If any part fails, none of it commits.

---

## 8. Payment types

**Master list, five types:**

`Cash` · `EFTPOS` · `EFT` · `Credit Card` · `M-PAISA`

All five appear in the Confirm Sale dropdown. Flame Tree operate in Fiji and accept all of them, M-PAISA included.

The list is fixed in code for this implementation. No configuration screen, no enable/disable toggles.

**No connection to POS or bank.** The payment type is recorded for visibility and for Acumatica. QuarryLink does not process, verify or reconcile the payment itself.

---

## 9. Acumatica integration

Confirming a cash sale **records the payment and its method in Acumatica**.

**The cash sale records in QuarryLink regardless of whether Acumatica accepts it.** Record locally first, then push.

The reasoning: the customer has already paid. That fact cannot be contingent on an API being up, and a counter operator cannot be blocked from receipting a paying customer because an integration is down.

### 9.1 Classify the failure — do not retry everything

**Retrying does not fix a permanent rejection.** A closed period or an unmapped customer fails identically on attempt 500. Failures must be classified and handled differently:

| Failure type | Examples | Handling |
|---|---|---|
| **Transient** | Timeout, connection refused, 5xx, rate limit | Retry with backoff |
| **Permanent** | Validation error, closed accounting period, unmapped customer, missing account | **Stop retrying immediately.** Mark the receipt `Failed` and store Acumatica's actual error text against it |

Retrying a permanent rejection burns resource and buries the problem. Stopping and surfacing it is what gets it fixed.

**Store the error text verbatim.** "Sync failed" is useless to whoever has to resolve it. *"The period 2026-07 is closed"* tells them exactly what to do.

Transient retries need a ceiling — after a defined number of attempts or elapsed time, stop and reclassify as `Failed` so it stops being invisible.

### 9.2 Sync status

Every receipt carries a sync status, visible as a badge:

**Use the same wording as the existing invoice table** — not a new vocabulary for the same concept:

| Status | Meaning |
|---|---|
| `Synced` | Acumatica has the payment |
| `Not synced` | Not sent yet, or in progress |
| `Failed` | Attempted and unsuccessful — needs human action. A **Retry** action appears on the row |

Shown on the Cash Sales table (§10.1), in View Details (§11), and on the Payments → Cash Payments table (`spec-payments-tab.md`).

### 9.3 Where failures are surfaced

Failures surface in the **Payments → Cash Payments** table with its **`Failed only` toggle** switched on — see `spec-payments-tab.md` §5.5. That table carries reference, job, customer, amount, payment type, sync status and a Retry action, mirroring the pattern already used for invoices.

**This is a hard dependency.** The toggle is the only way to isolate failures — sync status is not in the keyword search and there is no filter chip for it. If the toggle is not built, nothing in this section works.

What that table must provide for this purpose:

- Acumatica's error text reachable from a failed row
- How long the record has been unsynced
- A **Retry** action on failed rows

**Retry is the single most valuable control in this section.** Most permanent rejections are fixable *in Acumatica* — reopen the period, map the customer, correct the account — and then the same payload succeeds. Without a manual retry, every one of those becomes a developer ticket. With it, they become a five-minute job for whoever administers Acumatica.

**Scope:** unsynced receipts for this implementation only. There is no cross-client support view.

### 9.4 Making failures impossible to ignore

**In-app only. No email alerts of any kind.**

Visibility comes from two existing UI patterns:

- **An alert badge** carrying the count of `Failed` receipts, shown on the Payments area and on the job's Cash Sales tab. Visible passively, so failures are noticed without anyone having to remember to check.
- **A notification banner** on the Payments area whenever there is at least one `Failed` record, linking straight to the Cash Payments table filtered by `Failed`.
- **Zero state shows neither** — no badge, no banner, no visual noise when everything is synced.

The badge and banner must be **live**, reflecting the current count each time the area is loaded.

### 9.5 Who resolves a failure

The person who can fix most failures is a **finance user with Acumatica admin rights** — reopening a period, mapping a customer, correcting an account — not QuarryLink support. The badge, banner and table exist to get the problem in front of that person, with enough detail (§9.1) to act without escalating.

Because there is no push notification, **someone has to be in the habit of looking.** Cash sales happen daily at a counter, so this should be a daily glance at the Payments area, not a month-end exercise. That is a rollout and training matter rather than a build one — see §17.

### 9.6 Precision

Amounts pushed to Acumatica must follow the precision and rounding rules in the **Decimal Precision / Acumatica Balancing** spec. A cash sale that balances to the cent is the whole point of recording it in both systems.

### 9.7 Idempotency

Retries must not create duplicate payments in Acumatica. Use the receipt reference as an idempotency key or equivalent.

**A duplicate-reference response is a success, not a failure.** If Acumatica reports the payment already exists, the payment landed — mark the receipt `Synced`. Treating it as an error creates a permanently stuck receipt for a payment that is already correctly recorded.

---

## 10. Job → Cash Sales tab

A **Cash Sales** tab at job level, alongside Products / Dockets / Invoices, listing every cash sale recorded against that job.

- Heading **Cash Sales**, with a **Create Cash Sale** button
- Search: `Search Cash Sales by keyword…`
- One row per cash sale transaction
- Only transactions linked to this job

### 10.1 Columns

| Column | Notes |
|---|---|
| Cash Sale | The `CS-` reference |
| Dockets | Count badge — e.g. `2 dockets` |
| Amount | Total received |
| Recorded Date | |
| Payment Type | Status-style badge — `CASH`, `EFTPOS`, `EFT`, `CREDIT CARD`, `M-PAISA` |
| Payment Received By | The recording user |
| Accounting Sync | `Synced` / `Not synced` / `Failed` badge, with Retry on failures (§9.2) |
| *(actions)* | `⋯` menu |

Voided receipts remain in the table, visually de-emphasised and badged **`VOID`**.

All columns sortable, consistent with other tables in the app.

**Note on labelling:** the mock heads this column `Type` and labels the same value `Status` in the View Details modal. It is neither — it is a payment method. Label it **Payment Type** in both places. The badge treatment can stay.

### 10.2 Keyword search

Filters rows dynamically, partial matching, against:

- Cash Sale Reference
- Payment Type
- Payment Received By
- Amount

### 10.3 Actions menu

Each row's `⋯` menu offers:

| Action | Available to |
|---|---|
| **View Details** | All users |
| **Download Receipt** | All users |
| **Amend Payment Type** | Admins and Super Admins (§12.1) |
| **Void** | Holders of the `Void Transactions` permission (§12.5) |
| **Retry Sync** | Admins and Super Admins, and only when the receipt is not `Synced` (§9.3) |

On a voided receipt, only **View Details** and **Download Receipt** remain.

---

## 11. View Details modal

Opens read-only. Displays:

- **Cash Sale [reference]** as the title
- Customer Name
- Total Amount
- Recorded Date
- Payment Type (badge) — flagged as amended, with history, if §12.1 was used
- Payment Received By
- Sync status, and Acumatica's error text when `Failed`
- If voided: a **`VOID`** banner showing who voided it, when, and the reason

### 11.1 Included Dockets

A section headed **Included Dockets (N)**, one row per docket:

| Column |
|---|
| Docket # |
| Product |
| Quantity |
| Docket type *(delivery / collection — see §5.1)* |
| Delivery / Collection Date |

A **Download PDF** action sits in the modal.

### 11.2 Read-only

The modal displays only. No editing of receipt details, no modifying included dockets, no changing payment values from here. The two correction paths in §12 are Admin actions on the row's `⋯` menu, not inline edits in this modal.

---

## 12. Corrections

A cash sale is not editable. Two specific correction paths exist, both permission-gated and fully audited. Nothing else about a receipt can be changed.

The design principle: **a correction is an entry in the audit trail, not a hole in it.** Nothing is deleted or overwritten.

### 12.1 Amend Payment Type

**The most likely real-world error is the right dockets with the wrong payment type** — a thumb on Cash instead of EFTPOS. That does not warrant unwinding a receipt or releasing dockets.

- Available from the receipt's `⋯` menu, Admins and Super Admins only.
- Changes **only** the payment type. Amount, dockets, customer, date and reference are untouched.
- Requires the user to select the corrected type from the five at §8.
- **Records an audit entry**: previous type, new type, who changed it, when.
- View Details shows the current type, and that it was amended, with the history available.
- Pushes the corrected payment method to Acumatica. Behaviour depends on the receipt's sync state:

| Sync state | On amend |
|---|---|
| `Synced` | Push the correction to Acumatica |
| `Not synced` | Update the pending payload. Do not raise a second push |
| `Failed` | **Reset to `Not synced` and queue a fresh push.** Do not leave it `Failed` awaiting a separate Retry |

**Why `Failed` re-queues automatically:** a wrong payment type is a plausible *cause* of a permanent rejection — an unmapped payment method in Acumatica, for instance. Someone amending a failed receipt is most likely fixing the thing that broke it, so making them then hunt for Retry as a second step is a trap. Amend and re-attempt are one action.
- Amending does not change docket status — the dockets stay Cash Sale throughout.

### 12.2 Void

For a receipt recorded against the wrong dockets, recorded in error, or one Acumatica will never accept.

- Available from the receipt's `⋯` menu, to users holding the **Void Transactions** permission (§12.5).
- **Requires a reason.** A short selectable list plus free text: *Recorded in error* · *Wrong dockets selected* · *Customer to be invoiced instead* · *Acumatica rejection — unrecoverable* · *Other*.
- Creates a **reversal record**. The original receipt is never deleted or altered.
- The original remains listed and viewable, badged **`VOID`**, showing who voided it, when and why.
- **Returns every included docket to its prior status** — Collected or Delivered — making them eligible for invoicing or a corrected cash sale again.
- The reference number is **retired, never reused**.
- **A void cannot be undone.** Re-record the cash sale correctly instead.

### 12.3 Void and Acumatica

| Original receipt state | On void |
|---|---|
| `Synced` | Push a reversal to Acumatica. The reversal carries its own sync status |
| `Not synced` | Cancel the pending push. Nothing goes to Acumatica |
| `Failed` | Cancel the pending push. Nothing goes to Acumatica |

A void whose reversal fails to reach Acumatica is itself a sync failure and must appear as `Failed` alongside the rest (§9.3). It must not silently leave the two systems disagreeing.

### 12.4 What is still not possible

- Editing the amount
- Adding or removing dockets from an existing receipt
- Deleting a receipt
- Un-voiding
- Any correction by a user without the relevant permission

### 12.5 Void controls — segregation of duties

Voiding releases dockets and reverses a payment record. The person taking cash at a counter should not necessarily also be the person who can make a recorded payment disappear. Two controls, both required.

**1. A `Void Transactions` permission**

- Granted **independently of the Admin role**, so there can be six Admins and two people who can void.
- Not granted by default to any role on rollout — it must be assigned deliberately.
- **This one permission covers every void in the product**, not just cash sales — internal transfer voids are gated by the same right (`spec-internal-transfer-dockets.md` §13). One void permission, not one per feature.
- **Amend Payment Type** stays with Admins and Super Admins; it is a lower-consequence action that changes no financial position and releases no dockets.

**2. Voids visible in the existing tables**

- A voided receipt stays listed, de-emphasised and badged **`VOID`**, on both the job's Cash Sales tab and the Payments → Cash Payments table.
- **View Details on a voided receipt shows both `Payment Received By` and who voided it**, along with the date and the reason given. Anyone reviewing a void can see whether the same person did both, without a separate screen.

**No void report is built.** The tables already carry every fact a report would: what was voided, when, by whom, why, and who recorded the original. Building a second surface to restate that is work for no additional information.

The permission is the preventive control; the VOID rows in the tables are the record.

---

## 13. Download Receipt — PDF

Generates a printable PDF receipt containing:

- Cash Sale Reference
- Customer details
- Payment details — amount, payment type, recorded date, recorded by
- List of included dockets, with docket type shown
- Financial summary

Follow the existing docket PDF conventions for layout and branding. Amounts follow the precision rules in §9.2.

---

## 14. Post-financial restrictions

Once a docket carries a financial outcome, its available actions narrow:

| Docket state | Actions available |
|---|---|
| Collection docket, Collected | Invoice · Cash Sale |
| Delivery docket, Delivered | Invoice · Cash Sale |
| Any docket, Cash Sale | View Receipt only |
| Any docket, Invoiced | View Invoice only |

Action menus must reflect this exactly. An invoiced docket offering a Cash Sale button is the bug this table exists to prevent.

**After a void**, included dockets return to Collected or Delivered and regain the full action set — Invoice and Cash Sale both become available again.

---

## 15. Rules and edge cases

1. **Concurrency.** Two users confirming against overlapping dockets simultaneously: the first commits, the second is rejected with the §3.1 message naming the affected dockets. Enforced server-side.
2. **Zero-value dockets.** A docket totalling $0.00 is still eligible if otherwise valid. Recording a $0.00 cash sale is odd but not invalid — do not block it, and do not treat $0.00 as an error state.

   **Confirm what Acumatica does with a zero-value payment before building the push.** If it accepts one, push as normal. **If it rejects zero-value payments, do not push at all** — leave the receipt `Not synced`, record the reason, and let it sit. That state already covers "not applicable" (§9.2), so no new status is needed.

   What must not happen is pushing a zero-value payment that Acumatica always rejects, producing a permanently `Failed` receipt that no retry can ever clear.
3. **Empty selection.** The Cash Sale action is disabled when nothing is selected.
4. **All dockets ineligible.** If a job has no eligible dockets, the selection screen shows an empty state rather than an empty table with no explanation.
5. **Cancel discards.** Nothing is recorded and no docket status changes.
6. **Job status.** Cash sales can be recorded on jobs in any status, consistent with invoicing.
7. **Deleted or archived jobs.** Receipts remain intact and viewable. A financial record is not removed because its job was tidied away.
8. **The reference sequence never reuses a number**, including after a failed confirmation or a void. Gaps are acceptable; duplicates are not.
9. **Voiding is transactional.** Reversal record, receipt state and every docket status change commit together, or none of them do.
10. **A docket released by a void can be immediately re-receipted or invoiced.** No cooling-off period, no residual lock.
11. **Voiding a receipt whose dockets were released and then re-used** is not a concern — the void already happened; the dockets' new financial state is independent.
12. **Amend Payment Type on a voided receipt is not available.** Void ends the receipt's life.

---

## 16. One selection, one receipt — no bulk/individual dropdown

**Resolved: the Cash Sale button takes no bulk/individual dropdown**, unlike the Invoice button beside it.

Selecting multiple dockets and clicking **Cash Sale (X selected)** creates **one receipt covering all selected dockets**. Individual receipts come from the docket entry point (§4.2). The flow diagram's *Cash Sale (Bulk)* and *Cash Sale (Individual)* are both satisfied by these two paths.

### 16.1 Why, so nobody re-adds it later

Invoice carries the dropdown for a real reason: customers legitimately want one invoice per docket sometimes and a consolidated one other times. That is a presentation choice about how a debt is rendered.

**A cash sale is not a document preference — it is a record of a payment event.** A customer handing over $7,500 covering three dockets made *one* payment. Splitting that into three receipts would assert three payments that did not happen, and would push three separate payments into Acumatica. That is not a formatting option; it misstates what occurred.

### 16.2 Paying for different dockets by different methods

This is supported, and it is the reason the dropdown isn't needed:

> A customer pays $2,500 cash for one docket and $5,000 by EFTPOS for two others.

Record it as **two cash sales** from the selection screen — select the cash-paid docket, confirm as Cash; select the other two, confirm as EFTPOS. Two receipts, two payments, accurate in both systems.

### 16.3 The limit

**A single docket cannot be split across payment methods.** Confirmed with Flame Tree: one docket, one payment method. If that ever changes it requires a proper split-payment design, not a variation on this flow — see §20.

---

## 17. Risks

| Risk | Note |
|---|---|
| **Nothing pushes a sync failure to anyone** | Visibility is in-app only, by deliberate choice — the client already receives too many emails. The badge and banner make failures visible **to whoever opens the Payments area**, and nobody is told otherwise. Name a person at Flame Tree with Acumatica admin rights, and make a daily glance at Payments part of their routine, before go-live. |
| **Nothing surfaces a void proactively** | No email, no report. A void is visible in the tables to anyone who looks. That is a deliberate choice to avoid building extra, and it puts the whole weight of the control on `Void Transactions` being granted narrowly. If that permission ends up widely held, there is effectively no oversight of voids at all. |
| **`Void Transactions` must be assigned deliberately** | The permission defaults to nobody. If it is never granted, the only correction path is unavailable and unrecoverable receipts return as a problem. Assign it to at least one person — ideally not the person taking payment — as part of go-live. |
| **Delivery dockets now in scope** | This widens the feature well beyond the original story and invalidates the flow diagram. Anyone working from that diagram will build the wrong eligibility rules. |
| **Mixed docket types on one receipt** | Reporting that assumes a cash sale is collection-only will be wrong. Worth checking any existing reporting before release. |

---

## 18. Decisions taken

| # | Question | Decision |
|---|---|---|
| 1 | Delivery dockets | **Eligible** — flow diagram superseded |
| 2 | Payment types | Cash, EFTPOS, EFT, Credit Card and M-PAISA — fixed in code, no configuration screen |
| 3 | Corrections | Admin-only **Amend Payment Type** and **Void**, both audited. No editing, no deletion, no un-void |
| 4 | Acumatica | In scope, pushed on confirm |
| 5 | Push failure | Record locally; classify transient vs permanent; retry transient only; surface the rest as `Failed` with a manual retry |
| 6 | Mixed docket types | Allowed on one receipt, same job only |
| 7 | Receipt reference | `CS-` prefix, one continuous sequence |
| 8 | Permissions | Recording a cash sale: same as invoicing. Amend Payment Type: Admin / Super Admin. Void: the `Void Transactions` permission, which covers every void |
| 9 | Partial payment | Not supported |
| 10 | Cross-job | Prohibited |
| 11 | Sync visibility | **In-app only — an alert badge and a notification banner. No emails.** Failed records surface in the Payments → Cash Payments table — see `spec-payments-tab.md` |
| 12 | Void oversight | The `Void Transactions` permission plus VOID rows in the existing tables. **No void report, no emails** — nothing additional is built |
| 13 | Bulk/individual dropdown | Not needed — one selection produces one receipt |
| 14 | Mixed tender | Different dockets by different methods: supported via separate receipts. One docket split across methods: not supported |
| 15 | Finding failures | The `Failed only` toggle on the Payments → Cash Payments table — a hard dependency on `spec-payments-tab.md` §5.5 |
| 16 | Amend on a `Failed` receipt | Resets to `Not synced` and re-queues automatically — no separate Retry click |
| 17 | Zero-value pushes | Confirm Acumatica's behaviour first. If it rejects zero-value payments, skip the push and leave the receipt `Not synced` |

---

## 19. Acceptance criteria

**Eligibility**

- [ ] Cash Sale is available on collection dockets in Collected status
- [ ] Cash Sale is available on delivery dockets in Delivered status
- [ ] Cash Sale is unavailable on invoiced, already cash-sold, cancelled or voided dockets
- [ ] Eligibility is re-checked server-side at confirmation, not only at selection
- [ ] A docket invoiced by another user mid-flow blocks confirmation with a message naming that docket
- [ ] No cash sale can contain dockets from more than one job

**Entry points**

- [ ] Create Cash Sale on the job's Cash Sales tab opens the selection screen
- [ ] The selection screen lists only eligible dockets for that job
- [ ] Cash Sale from within a docket skips selection and opens the confirmation modal with that docket pre-selected
- [ ] The shared selection modal enables Invoice and Cash Sale independently by eligibility

**Selection screen**

- [ ] Tabs for All / Delivery / Collection dockets with counts
- [ ] Keyword search filters the list
- [ ] Multi-select with a working Clear Selection
- [ ] Selected count and summed total both display and update live
- [ ] Docket type is visible per row
- [ ] Cash Sale is disabled with nothing selected

**Confirmation**

- [ ] Modal states that a cash/EFTPOS payment will be recorded and no invoice created
- [ ] Docket count and Total Amount Received both display correctly
- [ ] The modal lists the included docket numbers with type and amount, not just a count
- [ ] The docket list appears for single-docket cash sales too
- [ ] The amount cannot be edited or reduced
- [ ] Confirm Sale requires an explicit payment type selection
- [ ] All five payment types appear in the dropdown
- [ ] Cancel records nothing and changes no docket

**On confirm**

- [ ] A receipt is created with reference, job, dockets, total, payment type, recorded date, recorded by and audit fields
- [ ] References are sequential with a `CS-` prefix and never reused
- [ ] Every included docket is marked Cash Sale
- [ ] Invoicing actions disappear from included dockets
- [ ] A second cash sale cannot be recorded against an included docket
- [ ] Receipt creation and docket updates commit as one transaction
- [ ] Two concurrent confirmations on overlapping dockets cannot both succeed

**Acumatica**

- [ ] Confirming pushes the payment and its method to Acumatica
- [ ] A failed push does not prevent the cash sale being recorded
- [ ] Transient failures retry automatically with backoff
- [ ] Permanent rejections stop retrying immediately and are marked `Failed`
- [ ] Acumatica's error text is stored and displayed against the receipt
- [ ] Transient retries stop at a defined ceiling and reclassify as `Failed`
- [ ] Each receipt shows a `Synced` / `Not synced` / `Failed` badge
- [ ] Failed receipts are findable via the `Failed only` toggle on the Payments → Cash Payments table
- [ ] Retry re-attempts the push and succeeds once the cause is fixed in Acumatica
- [ ] An alert badge shows the count of failed receipts on the Payments area and the job's Cash Sales tab
- [ ] A notification banner appears whenever at least one record is `Failed`, linking to the filtered table
- [ ] Neither badge nor banner appears when everything is synced
- [ ] The badge count is current each time the area is loaded
- [ ] **No emails are sent for sync failures**
- [ ] Retries do not create duplicate payments in Acumatica
- [ ] A duplicate-reference response marks the receipt `Synced`, not failed
- [ ] Pushed amounts follow the agreed precision and rounding rules

**Corrections**

- [ ] Amend Payment Type is available to Admins and Super Admins
- [ ] Void is gated by a separate `Void Transactions` permission, grantable independently of Admin
- [ ] `Void Transactions` is granted to no role by default
- [ ] An Admin without `Void Transactions` can amend a payment type but cannot void
- [ ] A voided receipt shows de-emphasised and badged VOID in both the job tab and the Payments table
- [ ] View Details on a voided receipt shows who recorded it, who voided it, when and why
- [ ] No separate void report is built
- [ ] **No emails are sent on void**
- [ ] Amend Payment Type changes the type and nothing else
- [ ] Amending records previous type, new type, user and timestamp
- [ ] Amending a `Synced` receipt pushes the correction to Acumatica
- [ ] Amending a `Not synced` receipt updates the pending payload rather than raising a second push
- [ ] Amending a `Failed` receipt resets it to `Not synced` and queues a fresh push automatically
- [ ] No separate Retry click is needed after amending a failed receipt
- [ ] Amending does not change docket status
- [ ] Void requires a reason to be given
- [ ] Void creates a reversal record and never deletes or alters the original
- [ ] A voided receipt stays listed, badged `VOID`, showing who, when and why
- [ ] Voiding returns every included docket to Collected or Delivered
- [ ] Released dockets can immediately be invoiced or cash sold again
- [ ] Voiding a `Synced` receipt pushes a reversal to Acumatica
- [ ] Voiding a `Not synced` or `Failed` receipt cancels the pending push and sends nothing
- [ ] A failed reversal push shows as `Failed` and is retryable
- [ ] Void commits transactionally across reversal, receipt and all docket statuses
- [ ] A voided receipt cannot be un-voided or amended
- [ ] A voided reference is never reused
- [ ] Non-Admins see neither correction action

**Cash Sales tab**

- [ ] The tab lists only that job's cash sales, one row per transaction
- [ ] Columns: Cash Sale, Dockets count, Amount, Recorded Date, Payment Type, Payment Received By, Accounting Sync, actions
- [ ] Payment type and sync status both render as badges
- [ ] Voided receipts remain listed, de-emphasised and badged `VOID`
- [ ] Keyword search matches reference, payment type, received by and amount, partially
- [ ] The `⋯` menu offers View Details and Download Receipt to all users
- [ ] Amend Payment Type and Retry Sync appear only for Admins and Super Admins
- [ ] Void appears only for users holding `Void Transactions`
- [ ] Retry Sync appears only on receipts that are not `Synced`
- [ ] A voided receipt's menu offers View Details and Download Receipt only

**View Details**

- [ ] Shows reference, customer, total, recorded date, payment type, received by and sync status
- [ ] An amended payment type is flagged as amended, with its history visible
- [ ] A `Failed` receipt shows Acumatica's error text
- [ ] A voided receipt shows a VOID banner with who, when and why
- [ ] Included Dockets lists every docket with number, product, quantity, type and date
- [ ] The modal displays only, with no inline edit path
- [ ] Download PDF is available from the modal

**PDF**

- [ ] Contains reference, customer details, payment details, included dockets with type, and a financial summary
- [ ] Amounts match the on-screen values exactly

**Restrictions**

- [ ] A cash-sold docket offers View Receipt only
- [ ] An invoiced docket offers View Invoice only
- [ ] A zero-value cash sale is not blocked, and its push behaviour matches Acumatica's confirmed handling
- [ ] No action menu offers Cash Sale on an ineligible docket

---

## 20. Out of scope

- Editing a receipt's amount, customer, date or included dockets
- Deleting a receipt, or un-voiding one
- Corrections by non-Admin users
- Partial payments
- Splitting a single docket across multiple payment methods
- Multiple payment types on one receipt
- A cross-client sync failure view for QuarryLink support
- **Email alerts of any kind** — for sync failures, voids or anything else in this spec
- **A void report or any other new reporting surface** — voids are reviewed in the existing tables
- Any in-app notification system — visibility is the alert badge and banner only
- POS or bank integration, payment processing or verification
- Cash sales spanning multiple jobs
- Refunds or credit notes against a cash sale
- Emailing the receipt to the customer
- Reconciliation reporting on cash sales
