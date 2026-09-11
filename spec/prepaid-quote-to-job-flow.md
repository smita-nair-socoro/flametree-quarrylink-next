# Feature Spec — Prepaid Quote → Job Flow

| | |
|---|---|
| **Client** | Flame Tree |
| **Prepared** | 10 September 2026 |
| **Status** | Ready for build — no open items |
| **Audience** | Developer (Cursor) |
| **Related** | `spec-cash-sale-recording.md` — recording a cash sale against dockets, which this reuses but does not modify<br>`spec-payments-tab.md` — the Cash Payments table these receipts appear in

---

## 1. Summary

A **Prepay toggle**, off by default, on every quote and every job. When it is on, the customer pays in full before work is released, and everything raised against the job afterwards settles against that payment instead of being invoiced.

Turning it on and taking payment:

- Records a **Cash Sale** against the quote or job — the same receipt `spec-cash-sale-recording.md` creates, taken before collection rather than after
- **Locks quantity and price** on the quote or job
- **Releases the next step** — Approve on a quote, docket raising on a job
- **Pushes the payment to Acumatica**, exactly as a cash sale against dockets does
- Causes every docket completed on that job to be marked **Cash Sale** and linked to the receipt, with no invoicing path

**Prepaid is collection only.** A prepaid quote or job can carry collection line items and nothing else — see §4.4.

Nothing about the customer turns the toggle on. There is no customer type, no derived state and nothing read from Acumatica to decide it — the quarry manager decides per quote, per job.

---

## 2. Corrections to the source material

The material this spec was built from is superseded in three places. **Follow this document.**

| Item | Earlier position | Resolved |
|---|---|---|
| **What makes a quote or job prepaid** | An Acumatica **Customer Type** field (Account / Non-Account), read by QuarryLink, forcing non-account customers down the prepaid path and locking it on | **A manual toggle on every quote and job, off by default.** The Acumatica field is not created, not read and not backfilled |
| **Decline after payment** | Disabled once a quote was paid | **Available at every stage**, paid or not |
| **Backing out of a job** | Described as cancel or void | **Cancel only.** Job void does not exist in QuarryLink |

**This spec upholds the collection-only rule rather than carving an exception out of it.** `spec-cash-sale-recording.md` §3 states delivery dockets are never eligible for cash sale, in any status, from any surface. Prepaid is a cash sale, so it inherits that rule wholesale: a prepaid quote or job is collection only, enforced at the line item (§4.4). No prepaid docket is ever a delivery docket, so the question of settling one never arises.

---

## 3. What already exists — reuse it

| Existing | Reuse for |
|---|---|
| **Cash Sale Receipt** entity, `CS-` sequence, PDF generation (`spec-cash-sale-recording.md` §7.1, §13) | **Unchanged.** A prepaid cash sale is a Cash Sale Receipt — no new type, no distinguishing field, no parallel entity |
| **Acumatica payment push**, failure classification, retry, idempotency (`spec-cash-sale-recording.md` §9) | Identical. A prepaid cash sale is a payment against the customer, pushed the same way, with the same transient/permanent handling |
| **Payments → Cash Payments table** and its `Failed only` toggle (`spec-payments-tab.md` §5) | These appear here alongside cash sales raised against dockets, with **no new column**. No new table, no fourth sub-tab |
| **Job → Cash Sales tab** (`spec-cash-sale-recording.md` §10) | The cash sale appears on it, like any other |
| **`Void Transactions` permission** (`spec-cash-sale-recording.md` §12.5) | Gates voiding the receipt. One void permission product-wide — do not add a second |
| **Docket `Cash Sale` status** | The status a settled prepaid docket carries. Same status, same suppression of invoicing actions |

---

## 4. The toggle

### 4.1 Placement and default

A **Prepay** toggle on the quote form and the job form. **Off by default**, on every quote and every job, for every customer.

Nothing sets it automatically. Not customer type, not account status, not trading history, not anything read from Acumatica.

### 4.2 When it can be changed

| State | Toggle |
|---|---|
| Quote or job not yet paid | Freely on and off |
| Payment recorded | **Fixed.** Cannot be changed in either direction |

The toggle is disabled with the reason shown once a payment exists. Reversing it would leave a recorded payment attached to a job that intends to invoice the same material.

### 4.3 What the toggle gates

| Prepay | Behaviour |
|---|---|
| **Off** | Standard flow. Delivery and collection line items both allowed. Dockets are invoiced |
| **On** | **Collection line items only** (§4.4). Approve / docket raising blocked until paid. Dockets settle against the payment and can never be invoiced |

### 4.4 Prepaid is collection only

**A prepaid quote or job can hold collection line items and nothing else.** Delivery is never available on a prepaid quote or job, in any state, at any point.

This is not a new restriction. `spec-cash-sale-recording.md` §3 already holds that a delivery docket can only ever be invoiced, and a prepaid docket can never be invoiced (§6.3). Allowing a delivery line item onto a prepaid job would create a docket that can be neither — material out with nowhere for the money to go.

Enforcing it at the line item is what makes that impossible. A docket takes its type from its line item, so a job with no delivery line items can raise no delivery dockets.

**The four cases, all enforced server-side:**

| Situation | Behaviour |
|---|---|
| Prepay is on, user adds a line item | Type is **Collection**. The Delivery option is disabled, with the reason shown |
| Prepay is on, user tries to change an existing line item to Delivery | **Blocked**, with the reason shown |
| Line items already exist and the user turns Prepay **on** | **Blocked if any line item is Delivery.** The message names the offending line items |
| Prepay is turned **off** again before payment | Delivery becomes available on new and existing line items immediately |

**A blocked toggle is never resolved by silently converting the line items.** Delivery and collection are different jobs of work at different prices, and switching one to the other behind the user's back changes what has been quoted. Name the line items and let the user decide.

After payment the line items are locked outright (§7), so none of this arises.

---

## 5. Taking payment

### 5.1 Where

A **Record Cash Sale** action on the quote and on the job. Visible only when Prepay is on and nothing has been recorded yet.

This is the same wording `spec-cash-sale-recording.md` already uses, deliberately — it is the same event. That spec's **Create Cash Sale** button lives on the job's Cash Sales tab and is hidden on a prepaid job (§6.4), so a user never sees both.

### 5.2 Payment is always in full

**No part payments and no deposits.** The recorded amount is the full quote or job total. The amount field is display-only and cannot be reduced.

There is no partly-paid state, no running balance and no rule about how much material a deposit releases. A quote or job is paid or it is not.

### 5.3 The payment modal

- Heading: **Record Cash Sale**
- The quote or job reference and customer
- The **line items being paid for** — product, quantity, rate, line total. Not just a total; the same reasoning as `spec-cash-sale-recording.md` §6.1, and here it is also the content about to be locked
- **Material Total**
- A **payment type** selector — the five types at `spec-cash-sale-recording.md` §8: `Cash` · `EFTPOS` · `EFT` · `Credit Card` · `M-PAISA`
- **Cancel** and **Record Cash Sale**

A payment type must be explicitly selected. Do not default to Cash.

### 5.4 Credit card surcharge

**Selecting `Credit Card` adds a 3.75% surcharge**, calculated on the Material Total.

The modal then shows three figures, and only once Credit Card is selected:

| Line | Value |
|---|---|
| Material Total | The quote or job total |
| Credit Card Surcharge (3.75%) | 3.75% of Material Total |
| **Total Charged** | The sum |

Rules:

1. The surcharge appears **only at the payment step.** It is never shown on the quote or the job, and never becomes a line item. A quote is comparable regardless of how the customer ends up paying.
2. The surcharge is **not part of the job value.** Docket settlement, the lock and everything downstream work against Material Total.
3. Rounding follows `spec-decimal-precision-acumatica-balancing.md`. Calculate the surcharge from the unrounded material total, then round once.
4. Selecting a different payment type removes the surcharge and the two extra lines immediately.
5. The receipt stores **all three values separately** — material amount, surcharge amount, total charged.
6. The surcharge is pushed to Acumatica as its own line on the payment, not folded into the material amount.

### 5.5 On confirm — one transaction

Committing together, or not at all:

1. Create the Cash Sale Receipt (§5.6)
2. Set the quote or job to **Prepaid**
3. Apply the lock (§7)
4. Fix the Prepay toggle
5. Release the next step — Approve on a quote, docket raising on a job

Then push to Acumatica (§8), outside the transaction.

A partial write here produces a locked job with no receipt, or a receipt against an unlocked job that can still be re-priced. Neither is recoverable without manual intervention.

### 5.6 The receipt

A **Cash Sale Receipt** — the same entity `spec-cash-sale-recording.md` creates, with no new type and no field marking it as prepaid.

| Field | Value |
|---|---|
| Reference | Next in the **shared `CS-` sequence**, one continuous sequence with cash sales raised against dockets |
| Quote | The quote, where payment was taken on a quote |
| Job | The job. Set on conversion where payment was taken on a quote (§6.1) |
| Material amount | Quote or job total |
| Surcharge amount | 3.75% where Credit Card, otherwise zero |
| Total charged | Material + surcharge |
| Payment type | The selected type |
| Recorded date/time | Time of confirmation |
| Recorded by | Current user |
| Dockets | Empty at creation. Populated as dockets complete (§6.3) |
| Sync status | `Not synced` initially |

**There is no field distinguishing this from a cash sale raised against dockets, and none is added.** Both are the same thing — money received against a job — and reconciliation does not care whether it arrived before or after the material. Where the system needs to know, it reads the job's prepaid flag, not the receipt.

### 5.7 Concurrency

Two users recording payment against the same quote or job: the first commits, the second is rejected with a message stating a payment already exists. Enforced server-side at the moment of confirmation, not only on load.

---

## 6. The flows

### 6.1 Quote path

1. Quote created, customer selected, **Prepay toggled on**
2. Line items added and priced as normal
3. Quote is sent to the customer → status transitions to **Pending**
4. **Approve is disabled**, with the reason shown: payment required
5. **Record Cash Sale** → §5
6. On payment: quote locks, status **Prepaid**, **Approve becomes available**
7. Approve → convert to job as normal
8. The job inherits **prepaid status, the lock and the receipt**. The receipt's Job field is set at conversion

Nothing is re-entered and nothing is re-priced at conversion.

### 6.2 Direct job path

No quote at any point.

1. Job created, **Prepay toggled on**
2. Line items added and priced
3. **Docket raising is blocked**, with the reason shown: payment required
4. **Record Cash Sale** → §5
5. On payment: job locks, status **Prepaid**, **dockets can be raised**

The receipt's Quote field stays empty.

### 6.3 Docket settlement

This is the mechanism that replaces invoicing on a prepaid job. **It is not the Cash Sale action of `spec-cash-sale-recording.md`, and shares none of its entry points.**

Every docket on a prepaid job is a collection docket (§4.4). When one reaches **Collected**:

- The docket is marked **Cash Sale** — the existing status, with its existing suppression of every invoicing action
- The docket is **linked to the job's cash sale receipt**
- **No new receipt is created**
- **Nothing is pushed to Acumatica** for the settlement itself. The payment went at §8; the material side follows whatever the existing docket-to-Acumatica integration already does
- **No user action is required.** No modal, no confirmation, no button

**A delivery docket can never exist on a prepaid job**, because a prepaid job can never hold a delivery line item (§4.4). `spec-cash-sale-recording.md` §3 therefore holds without exception: no delivery docket is ever settled as a cash sale, by this flow or any other.

### 6.4 What is not available on a prepaid job

- The **Create Cash Sale** action on the job's Cash Sales tab
- The **Cash Sale** action on any docket
- **Create Invoice**, and every other invoicing action, on the job or any of its dockets

Raising a cash sale against dockets and the prepaid flow are mutually exclusive on a given job. A prepaid job's payment is already recorded; offering a second path to record one invites a duplicate.

### 6.5 Docket quantities

**Governed by the job's line items, exactly as on any other job.** No prepaid-specific cap is built.

The lock fixes those line items at payment, so what the customer paid for is what sits on the job, and existing behaviour does the rest.

### 6.6 Under-collection

A customer who paid for 20 tonnes and collected 15 leaves a closed job. QuarryLink does not flag the shortfall, does not chase it, does not hold the job open and does not raise a refund. Any adjustment is an Acumatica transaction.

### 6.7 Wanting more after the lock

A second quote or a second job, priced, paid and locked in its own right. The paid one is never reopened to add to it.

---

## 7. The lock

Applied when payment is recorded. Applies to the quote and carries to the job.

### 7.1 What is locked

- Line item **type** — already fixed to Collection by §4.4, and unchangeable after payment like everything else
- Line item **quantity**
- Line item **rate / price**
- **Adding** a line item
- **Removing** a line item
- The **Prepay toggle** (§4.2)

### 7.2 What stays editable

Everything that does not change the priced content: project name, customer PO, site, notes, contact details, delivery dates, attachments, and any other non-pricing field.

The lock exists so the money and the document keep agreeing with each other. It is not a general freeze on the record.

### 7.3 Enforcement

Server-side, not only in the UI. A locked field must be rejected at the API regardless of how the request arrives.

---

## 8. Acumatica

The push is **identical to a cash sale raised against dockets** — `spec-cash-sale-recording.md` §9 governs in full, including:

- Record locally first, then push. A failed push never blocks the payment being recorded
- Transient vs permanent failure classification; retry transient only, with a ceiling
- Acumatica's error text stored verbatim
- `Synced` / `Not synced` / `Failed` with a manual **Retry** on failures
- Idempotency on the receipt reference; a duplicate-reference response marks the receipt `Synced`
- Precision and rounding per `spec-decimal-precision-acumatica-balancing.md`

**Additional to that spec:** the surcharge is pushed as its own line on the payment (§5.4).

**Developer discovery item:** confirm how a cash sale taken before collection is applied against the sales order in Acumatica, given Flame Tree's sales-order-to-invoice flow. The payment lands ahead of the material rather than behind it, which is the reverse of the sequence in `spec-cash-sale-recording.md` that this reuses. Establish this before building the push, not after.

---

## 9. Where these appear

### 9.1 Payments → Cash Payments

These join the existing table (`spec-payments-tab.md` §5) as ordinary cash sales.

**No new column is added, and nothing marks them as prepaid.** A cash sale is money received against a job; whether it arrived before or after the material does not change the payment, so nothing that reads this table needs to tell them apart.

Columns, keyword search, sorting, the `Failed only` toggle and the Retry action all work unchanged, with no modification to the existing table.

### 9.2 Job → Cash Sales tab

The cash sale appears on the existing tab, like any other.

On a prepaid job the **Create Cash Sale** button is hidden (§6.4), so the tab shows the one receipt and no way to add a second.

### 9.3 View Details

The existing modal, with two differences:

- Material amount, surcharge amount and total charged as three lines where a surcharge applies; the surcharge lines are hidden entirely where it does not
- **Settled Dockets (N)** in place of Included Dockets — docket number, product, quantity, type, date — **growing as dockets complete**, rather than being fixed at creation

**A receipt with no dockets listed is normal here**, not an error state. On a prepaid job the payment precedes the material, so the list is empty until the first docket completes. Do not render it as missing data.

### 9.4 PDF receipt

Follows `spec-cash-sale-recording.md` §13 conventions.

Because no dockets exist when the payment is taken, the PDF lists **the line items paid for**, not dockets. Where a surcharge applies it shows all three figures.

---

## 10. Backing out

### 10.1 A quote

**Decline is available at every stage**, paid or not:

| Stage | Decline |
|---|---|
| Before payment (Pending) | Available |
| Paid, not yet approved (Pending) | Available |
| Paid and approved (Approved) | Available |

Archiving a declined quote is **optional** — a separate housekeeping action, never automatic and never required.

### 10.2 A job

**Cancel only.** Job void does not exist in QuarryLink.

Available whether or not the job is prepaid.

### 10.3 Effect on a payment

**Decline and cancel act on the commercial document and touch nothing financial.** Before payment there is nothing to touch. After payment the receipt is untouched — it stands, stays linked and stays listed in Cash Payments.

**Dockets already settled stay marked Cash Sale.** Material left the quarry and was paid for; cancelling the job changes neither fact.

**QuarryLink has no refund function.** It does not raise credits, does not flag anything for refund and takes no view on whether one is due. Refunds are entirely an Acumatica matter.

**Decline and cancel must never be wired to void a receipt** — whether or not a payment exists. The two decisions are independent in both directions: declining a quote says the deal did not proceed, while voiding a receipt says the payment record itself is wrong. A quote can be declined with no payment ever taken, and a payment can be voided on a quote nobody has declined.

Both can still happen to the same quote. They are two deliberate actions, in either order, never inferred from one another. Auto-voiding on decline would erase a correct payment record while the customer's money sits in the bank — leaving nothing for finance to base a refund on, and unlocking a quote that must stay locked (§12.9).

---

## 11. Corrections

**Once a docket has been collected on a prepaid job, nothing about it can be reversed in QuarryLink** — not the docket, not the receipt. §11.3 sets out what that leaves, and §15 records the consequence.

One note on vocabulary: voiding a **docket** reverses a movement of material and already exists in the product; voiding a **receipt** reverses a payment record and is new, introduced by `spec-cash-sale-recording.md` §12.2. They are separate actions on separate objects and neither triggers the other.

### 11.1 Receipt void — only before material moves

Gated by the existing **`Void Transactions`** permission (`spec-cash-sale-recording.md` §12.5). No new permission.

**Available only while no docket on the job has reached Collected.**

| State | Receipt void |
|---|---|
| No dockets raised | Available |
| Dockets raised, none collected | Available. In-progress dockets remain on the job |
| Any docket Collected | **Blocked**, with the reason shown |

The block is permanent once it applies. A collected docket cannot be reversed (§11.3), so nothing can return the job to a state where receipt void becomes available again.

Once material has moved, the receipt is permanent and any adjustment is an Acumatica transaction.

Void covers genuine errors — payment recorded against the wrong job, wrong amount, recorded in error. It is not a commercial unwind (§10.3).

**On void, in one transaction:**

- A reversal record is created. The original receipt is never deleted or altered, stays listed and is badged **`VOID`** with who, when and why
- The quote or job **unlocks**
- Prepaid status is cleared and the **Prepay toggle becomes editable again**
- The reference is retired, never reused
- Acumatica handling follows `spec-cash-sale-recording.md` §12.3 — reversal pushed where the original was `Synced`, pending push cancelled otherwise

A void cannot be undone. Re-record the payment correctly.

### 11.2 Amend Payment Type

Available to Admins and Super Admins, as in `spec-cash-sale-recording.md` §12.1, with one restriction.

| Amendment | Available |
|---|---|
| Between types carrying no surcharge | **Yes.** Behaves exactly as §12.1, including the `Failed` → `Not synced` re-queue |
| **To or from `Credit Card`** | **No** |

**Why:** amending to or from Credit Card changes the surcharge, which changes the total charged. That is a change to the amount received, not a relabelling — and Amend Payment Type exists precisely because it changes no financial position.

Correct a wrong Credit Card selection by **voiding and re-recording** while §11.1 still permits it. Once anything has been collected, it is an Acumatica correction.

### 11.3 A settled docket is final

| Docket state | Cancel | Void |
|---|---|---|
| Not yet collected | Available, as on any job. Nothing financial is involved | Available, as on any job |
| **Settled** (Collected, marked Cash Sale) | **Not available** | **Not available** |

**A settled docket offers View Receipt only**, exactly as `spec-cash-sale-recording.md` §14 already specifies for any docket marked Cash Sale. This spec adds no exception to that.

So on a prepaid job, collection is the point of no return. The docket cannot be cancelled or voided, it stays linked to the receipt, and the receipt itself can no longer be voided either (§11.1). Every correction from that moment is an Acumatica transaction.

The reasoning is that on a prepaid job the money arrived first. Reversing a collected docket would leave paid-for material unaccounted for on a job that can never be invoiced, with no path in QuarryLink to put either side right. Blocking the reversal keeps the two systems agreeing.

**Before collection, both actions behave exactly as on any other job.** Nothing financial is attached yet.

### 11.4 Still not possible

- Editing the amount, the line items paid for, or the customer
- Deleting a receipt, or un-voiding one
- Voiding a receipt once any docket has been collected
- Cancelling or voiding a settled docket
- Amending a voided receipt
- Any correction by a user without the relevant permission

---

## 12. Rules and edge cases

1. **A prepaid quote cannot be approved unpaid.** Approve is disabled, server-enforced.
2. **A prepaid job cannot raise a docket unpaid.** Docket creation is blocked, server-enforced.
3. **A prepaid docket can never be invoiced** — not by hand, not by exception, not later, from any surface, in any status.
4. **A prepaid quote or job can never hold a delivery line item**, so a prepaid delivery docket cannot exist. Enforced server-side, not only in the UI.
5. **The `CS-` sequence never reuses a number**, across cash sales raised against dockets and prepaid ones alike, including after a failed confirmation or a void. Gaps are acceptable; duplicates are not.
6. **Zero-value.** A quote or job totalling $0.00 with Prepay on: block Record Cash Sale rather than recording a zero payment. There is nothing to pay, and `spec-cash-sale-recording.md` §15.2 already establishes that Acumatica may reject zero-value payments outright.
7. **Surcharge on a zero material total** cannot arise, given rule 6.
8. **Converting a paid quote to a job must not re-price anything**, including re-reading current rates. The locked values transfer verbatim.
9. **A paid quote that is declined keeps its lock.** It is not editable afterwards — the payment still refers to those numbers.
10. **Cancelling a prepaid job does not release its settled dockets.** They stay Cash Sale and stay linked.
11. **In-progress dockets on a job whose receipt has been voided** remain on the job, unsettled. With prepay now editable, the job can proceed as an invoiced job or be cancelled.
12. **Retry on a failed push** behaves exactly as `spec-cash-sale-recording.md` §9 — same idempotency, same duplicate-reference handling.
13. **No drawdown display is built.** The job does not show paid / collected / remaining. The docket list is the record of what has been taken.
14. **A settled docket can be neither cancelled nor voided.** Collection is final on a prepaid job — see §11.3.
15. **Declining a quote or cancelling a job never voids a receipt, and voiding a receipt never declines or cancels anything.**
16. **The prepay toggle is not a permission.** Anyone who can raise a quote or job can set it — no role restriction, consistent with the rest of quote and job creation.

---

## 13. Decisions taken

| # | Question | Decision |
|---|---|---|
| 1 | What makes a quote or job prepaid | A manual toggle on every quote and job, off by default. No Acumatica Customer Type field, no backfill, nothing derived from the customer |
| 2 | Does it apply to jobs as well as quotes | Yes — identical behaviour on a directly created job |
| 3 | Delivery on a prepaid job | **Not possible.** Prepaid is collection only, enforced at the line item. A prepaid quote or job holds collection line items and nothing else, so a prepaid delivery docket cannot exist |
| 4 | Receipt model | **One receipt at payment**, against the quote or job, for the full total. Dockets link to it as they complete |
| 5 | What the payment is called | A **cash sale** — the same object and the same `CS-` sequence as a cash sale raised against dockets, with no new type and no field marking it as prepaid |
| 6 | Part payments | Not supported. Full amount or nothing |
| 7 | What the lock covers | Line item quantity, rate, add and remove, plus the toggle itself. Non-pricing fields stay editable |
| 8 | Can the toggle be reversed after payment | No, in either direction |
| 9 | Credit card surcharge | **3.75% added on top at payment**, shown only at the payment step, stored as a separate value, pushed as its own Acumatica line. Never a line item on the quote |
| 10 | Amend Payment Type to or from Credit Card | **Blocked** — it changes the amount received. Void and re-record instead |
| 11 | Over-delivery | No prepaid-specific cap. The job's line items govern, as on any other job |
| 12 | Under-collection | Job closes. Nothing flagged, nothing chased, no refund raised |
| 13 | Wanting more after the lock | A second quote or job. The paid one is never reopened |
| 14 | Where they appear | Payments → Cash Payments as ordinary cash sales. No new column, no fourth sub-tab, no new table |
| 15 | Job tab | The existing Cash Sales tab, keeping its name. Create Cash Sale hidden on a prepaid job |
| 16 | Drawdown display | Not built. The docket list is enough |
| 17 | Decline on a paid quote | Available at every stage. Archive optional |
| 18 | Backing out of a job | Cancel only — job void does not exist |
| 19 | Effect on money taken | The receipt stands. Settled dockets stay Cash Sale. Refunds are entirely an Acumatica matter |
| 20 | Receipt void | Available only while no docket has been collected. Gated by the existing `Void Transactions` permission. Never triggered by decline or cancel |
| 21 | A settled docket | **Final.** Neither cancel nor void is available, matching `spec-cash-sale-recording.md` §14. Every correction after collection is an Acumatica transaction |

---

## 14. Acceptance criteria

**Collection only**

- [ ] With Prepay on, a new line item is Collection and the Delivery option is disabled, with the reason shown
- [ ] With Prepay on, an existing line item cannot be changed to Delivery
- [ ] Turning Prepay on is blocked when any line item is Delivery, and the message names those line items
- [ ] A blocked toggle never silently converts a delivery line item to collection
- [ ] Turning Prepay off before payment restores Delivery on new and existing line items
- [ ] All four are enforced server-side, not only in the UI
- [ ] No delivery docket can be raised on a prepaid job, by any route

**The toggle**

- [ ] Every quote and every job has a Prepay toggle, off by default
- [ ] No customer attribute, credit state or Acumatica value ever sets it
- [ ] It can be switched on and off freely before payment
- [ ] It is disabled in both directions once a payment exists, with the reason shown
- [ ] The disable is enforced server-side, not only in the UI

**Taking payment**

- [ ] Record Cash Sale appears only when Prepay is on and nothing is yet paid
- [ ] The modal lists the line items being paid for, not just a total
- [ ] The amount is display-only and cannot be reduced
- [ ] No part payment or deposit can be recorded
- [ ] All five payment types appear
- [ ] A payment type must be explicitly selected; nothing defaults to Cash
- [ ] Cancel records nothing and applies no lock

**Surcharge**

- [ ] Selecting Credit Card adds a 3.75% surcharge on the material total
- [ ] Material Total, Credit Card Surcharge and Total Charged all display, only when Credit Card is selected
- [ ] Selecting any other type removes the surcharge and its lines immediately
- [ ] The surcharge never appears on the quote or the job
- [ ] The surcharge is never a line item
- [ ] The receipt stores material, surcharge and total charged separately
- [ ] The surcharge is calculated from the unrounded material total and rounded once, per the precision spec
- [ ] The surcharge is pushed to Acumatica as its own line

**On confirm**

- [ ] Receipt creation, prepaid status, lock, toggle fix and step release commit as one transaction
- [ ] A failure leaves no lock, no receipt and no status change
- [ ] The receipt takes the next number on the shared `CS-` sequence
- [ ] Two concurrent payment attempts on the same quote or job cannot both succeed

**Quote path**

- [ ] Approve is disabled on an unpaid prepaid quote, with the reason shown
- [ ] Approve is enforced server-side, not only hidden in the UI
- [ ] Payment releases Approve
- [ ] Conversion carries prepaid status, the lock and the receipt to the job
- [ ] Conversion sets the receipt's Job field
- [ ] Conversion re-prices nothing, including not re-reading current rates

**Job path**

- [ ] Docket raising is blocked on an unpaid prepaid job, with the reason shown
- [ ] The block is enforced server-side
- [ ] Payment releases docket raising
- [ ] The receipt's Quote field stays empty

**The lock**

- [ ] Line item quantity, rate, add and remove are all blocked after payment
- [ ] Project name, PO, site, notes, contacts, dates and attachments stay editable
- [ ] Locked fields are rejected at the API regardless of how the request arrives
- [ ] A declined paid quote stays locked

**Docket settlement**

- [ ] A docket reaching Collected on a prepaid job is marked Cash Sale automatically
- [ ] It is linked to the job's cash sale receipt
- [ ] No second receipt is created
- [ ] No user action, modal or confirmation is involved
- [ ] Every settled docket is a collection docket
- [ ] No invoicing action is available on any prepaid docket, in any status, from any surface
- [ ] Create Cash Sale is hidden on a prepaid job
- [ ] The Cash Sale action is hidden on every docket of a prepaid job
- [ ] Create Invoice is hidden on a prepaid job

**Regression — `spec-cash-sale-recording.md` is unchanged**

- [ ] The Cash Sale action on a docket still refuses delivery dockets, in any status, from any surface
- [ ] Delivery line items behave exactly as before on any non-prepaid quote or job
- [ ] Recording a cash sale against dockets on a non-prepaid job behaves exactly as before
- [ ] The existing invoice flow on non-prepaid jobs is unaffected
- [ ] The Cash Payments table is unmodified — no column added, and sort, search and retry all behave as before

**Acumatica**

- [ ] The payment pushes on confirm and a failure never blocks recording it
- [ ] Transient failures retry with backoff to a ceiling; permanent rejections stop immediately
- [ ] Error text is stored verbatim and shown against the receipt
- [ ] Sync status renders as `Synced` / `Not synced` / `Failed`
- [ ] Retry re-attempts and does not duplicate the payment
- [ ] A duplicate-reference response marks the receipt `Synced`
- [ ] Failed pushes are findable via the existing `Failed only` toggle

**Where they appear**

- [ ] These list in Payments → Cash Payments as ordinary cash sales
- [ ] Nothing in the table marks a receipt as prepaid
- [ ] No fourth sub-tab and no new table is built
- [ ] The receipt appears on the job's Cash Sales tab, which keeps its name
- [ ] View Details shows the three amounts where a surcharge applies, and Settled Dockets growing as dockets complete
- [ ] A receipt with no dockets yet renders normally, not as missing data
- [ ] Surcharge lines are hidden entirely where there is no surcharge
- [ ] The PDF lists the line items paid for, not dockets
- [ ] No drawdown figure is shown anywhere

**Backing out**

- [ ] Decline is available on a prepaid quote before payment, after payment and after approval
- [ ] Archiving a declined quote is optional and never automatic
- [ ] A prepaid job can be cancelled; no void action exists on a job
- [ ] Declining or cancelling leaves the receipt untouched and still listed
- [ ] Settled dockets stay Cash Sale after a cancel
- [ ] **Decline and cancel never trigger a receipt void**, whether or not a payment exists
- [ ] Voiding a receipt never declines a quote or cancels a job
- [ ] A quote can be declined with no payment ever taken, and nothing financial occurs
- [ ] No refund, credit note or refund flag is raised anywhere

**Corrections**

- [ ] Receipt void requires the existing `Void Transactions` permission; no new permission is added
- [ ] Receipt void is available with no dockets raised, and with dockets raised but none ever collected
- [ ] Receipt void is blocked once any docket has been Collected, with the reason shown
- [ ] Receipt void creates a reversal, badges the original `VOID`, and deletes nothing
- [ ] Receipt void unlocks the quote or job and makes the toggle editable again
- [ ] Receipt void commits transactionally across reversal, receipt, lock, status and toggle
- [ ] A voided reference is never reused
- [ ] In-progress dockets survive a receipt void and stay on the job

**Docket cancel and void on a prepaid job**

- [ ] Cancel and void both behave as on any other job before the docket is collected
- [ ] Cancel is **not** available on a settled docket, with the reason shown
- [ ] Void is **not** available on a settled docket, with the reason shown
- [ ] A settled docket offers View Receipt only
- [ ] Both blocks are enforced server-side, not only in the UI
- [ ] No route in the product unlinks a settled docket from its receipt
- [ ] Amend Payment Type works between non-surcharge types, including the `Failed` re-queue
- [ ] Amend Payment Type to or from Credit Card is blocked, with the reason shown
- [ ] A voided receipt cannot be amended or un-voided

**Edge cases**

- [ ] Record Cash Sale is blocked on a $0.00 quote or job
- [ ] A prepaid docket offers View Receipt only

---

## 15. Risks

| Risk | Note |
|---|---|
| **After the first collection, a prepaid job has no correction path at all** | The docket cannot be cancelled or voided, the receipt cannot be voided, and the payment type cannot be amended to or from Credit Card. Every mistake from that point — wrong quantity, wrong product, wrong payment type, payment against the wrong job — is an Acumatica transaction. **This is the most operationally significant thing in the spec.** It is the right answer financially, because the money arrived before the material and QuarryLink has no way to unwind either side cleanly. But whoever is at the counter will experience it as the system refusing to fix an obvious mistake, and will not be expecting it, because a non-prepaid job is far more forgiving. Isimeli needs to know that on a prepaid job everything has to be right before the first docket is completed. |
| **Two mutually exclusive settlement paths on one job type** | Prepaid and non-prepaid jobs now behave fundamentally differently at docket completion. Every action menu, every docket surface and the driver app all need to respect the prepaid flag. A single surface that misses it produces either a double payment or an invoice against paid material. The regression criteria in §14 exist for this. |

---

## 16. Out of scope

- Part payments, deposits and payment plans
- A drawdown or remaining-balance display
- Refunds, credit notes and any refund flag — entirely an Acumatica matter
- Reopening or re-pricing a paid quote or job
- Editing a receipt's amount, line items or customer
- Un-voiding, and voiding a receipt once anything has been collected
- Cancelling or voiding a settled docket
- Any route that unlinks a settled docket from its receipt
- Amending payment type to or from Credit Card
- A surcharge on any payment type other than Credit Card
- A configurable surcharge rate — 3.75% is fixed in code
- Applying the surcharge to cash sales raised against dockets — that stays an open item on `spec-cash-sale-recording.md`
- Any change to the Cash Sale action raised against dockets, including its collection-only restriction
- A fourth Payments sub-tab, a prepaid cash sales report or any other new reporting surface
- Email alerts of any kind
- Automatically archiving a declined quote
- Prepaying for delivery, in any form
- Converting delivery line items to collection so a quote can be prepaid
- A cash sale spanning multiple jobs, or carrying credit from one job to the next
- Emailing the receipt to the customer
