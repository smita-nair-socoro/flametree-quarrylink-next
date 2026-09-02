# Feature Spec — Acumatica Credit Check Before Quote and Job Creation

| | |
|---|---|
| **Client** | Flame Tree |
| **Prepared** | 1 September 2026 |
| **Status** | Ready for build — two discovery items for the developer (§7.2, §9.3) |
| **Audience** | Developer (Cursor) |
| **Commercial** | **Outside original scope.** Glen has confirmed he expects this costed separately as a Flame Tree business requirement |

---

## 1. Summary

Before a quote can be created or approved — and before a direct-order job can be created — QuarryLink **interrogates Acumatica for the customer's live credit position** and blocks the work if the customer fails.

Today this is a manual process: checking with several people in the organisation whether a customer is over their limit and whether they pay on time. This replaces that with a check at the moment the decision is made.

**When a customer fails, QuarryLink shows the salesperson the numbers** — available credit, what is overdue, and what the customer would need to pay to be able to proceed. The customer is usually standing at the counter or on the phone, so the useful outcome is not "no" but "no, and here is exactly what would fix it".

---

## 2. Where the check fires

Three trigger points. All apply the same rules (§3).

| Trigger | When |
|---|---|
| **Quote creation** | After the customer is selected, before the quote is created. Glen's description: *"I hit create quote… it goes to Acumatica… and allows the guy to create the quote."* |
| **Quote approval / send** | Again at approval, because a customer's position moves between drafting a quote and sending it |
| **Job creation — direct orders** | For customers who skip the quote entirely — *"I want 5,000 cubes of this, here's my PO, I don't want a quote"* |

### 2.1 Why direct orders are included

A quote-only check would leave the largest customers — the ones who go straight to a job with a PO — outside credit control altogether. That is the first hole anyone would find. The check fires at job creation for those, with the job value taking the place of the quote value in §3.

---

## 3. What is checked

**Every customer is checked.** There is no exemption by customer type. A customer with no credit limit and nothing overdue passes trivially, which is the correct outcome rather than a special case.

### 3.1 Fail conditions

**Any one of these fails the check:**

| # | Condition |
|---|---|
| 1 | **Acumatica has the customer on credit hold.** Honour the flag directly — do not recalculate or second-guess it |
| 2 | **Current balance exceeds the credit limit** |
| 3 | **Any invoice is overdue beyond that customer's terms** — even one, regardless of available headroom |
| 4 | **This quote or job would take them past their credit limit** — value tested against available credit |

Conditions 2 and 4 are different failures: *already over* versus *would go over*. Both block, and the message must say which, because the remedy differs.

### 3.2 Terms come from Acumatica, per customer

Payment terms are read **per customer from Acumatica**, not hard-coded. The brief says 30 days and that is the common case, but a customer on 60-day terms must be judged against 60.

If Acumatica has no terms set for a customer, that is a data problem to surface, not a default to invent — see §9.

### 3.3 Which value is tested

The **quote or job total the customer would owe**, tax included — the figure that would become an invoice. Testing a net figure against a gross credit limit understates exposure.

---

## 4. What is displayed

The check result is shown before the user proceeds, whether it passes or fails. **The numbers appear on a pass too** — a salesperson who can see the customer has $2,000 of headroom left will quote differently from one who cannot.

| Figure | Notes |
|---|---|
| Credit limit | As set in Acumatica |
| Current balance | What they currently owe |
| **Available credit** | Limit minus balance |
| This quote / job value | The figure being tested |
| Overdue amount | Total of invoices past their terms |
| Oldest overdue | Days past terms on the oldest one |

### 4.1 The amounts that unblock them

This is the part that makes the feature worth building. Show **what the customer would have to pay**, calculated per failure reason:

| Failure | Show |
|---|---|
| Invoices overdue | **The overdue total** — *"Pay $X to bring the account back within terms."* |
| Over credit limit | **Balance minus limit** — *"Pay $X to bring the account back within the limit."* |
| This quote would exceed available credit | **Quote value minus available credit** — *"Pay $X, or reduce this quote by $X, to proceed."* |
| On credit hold | No amount. The hold is a decision made in Acumatica and only clears there |

Where more than one condition fails, show each with its own amount. Do not sum them into a single figure — they are different remedies and adding them together produces a number that is wrong for every one of them.

---

## 5. Blocked state

**Hard block. No override, by any role.**

- The user cannot create the quote, approve it, or create the job.
- The reason is stated plainly, naming which condition failed.
- The figures from §4 are shown alongside, so the conversation with the customer can happen immediately.
- There is no "proceed anyway", no permission that unlocks it, and no manager override to build.

**Confirmed with Glen.** This was raised specifically because most credit control carries a manager exception, and the answer is still no override.

A customer who genuinely should be allowed through is unblocked by changing their position or their limit **in Acumatica** — which is where credit control lives.

---

## 6. Data from Acumatica

QuarryLink reads, per customer:

- Credit limit
- Current balance
- Credit hold flag
- Payment terms
- Open invoices with their due dates — see §6.1

**Read-only.** This feature never writes to Acumatica, never changes a limit, and never clears a hold.

### 6.1 How overdue is determined

**Derived from open invoices and their due dates.** Not from an aging bucket or a summary figure.

- Read the customer's open invoices with their due dates.
- An invoice is overdue when its due date has passed.
- **Overdue total** = the sum of those invoices — this is the figure shown in §4 and used as the remedy amount in §4.1.
- **Oldest overdue** = days elapsed since the earliest passed due date.

Due dates come from Acumatica and already reflect that customer's terms (§3.2), so terms do not need to be applied a second time in QuarryLink.

### 6.2 Customers are matched by customer ID

QuarryLink and Acumatica are linked by **customer ID**, not by name. Never match on business name — the transcript shows exactly why: Flame Tree have Chinese Railway trading as three separate divisions across three quarries, all displaying the same name.

**A customer with no Acumatica customer ID cannot be checked.** Block, and surface it as a configuration problem naming the customer rather than a credit failure — see §9.2.

---

## 7. Timing and unavailability

### 7.1 The check is real-time and blocking

It runs against Acumatica at the moment of the action, with a visible loading state. No cached position, no overnight snapshot — a credit check on yesterday's data is not a credit check.

### 7.2 A defined timeout

⚠️ **Discovery item — the developer must set this** against observed Acumatica response times, not pick a number.

It must be **long enough to survive normal Acumatica latency** — which for Flame Tree is measured in tens of seconds, not milliseconds — **and short enough that a user isn't left staring at a spinner** with no idea whether to wait.

What matters is that there is one, that it is explicit, and that hitting it produces §7.3 rather than an indefinite wait.

### 7.3 If Acumatica cannot be reached

**Block, with a clear reason.**

- The message must distinguish "we could not check" from "the customer failed". Telling a salesperson their good customer has failed a credit check because an API timed out is worse than telling them nothing.
- Suggested wording: *"Credit check unavailable — Acumatica could not be reached. The quote cannot be created until the check completes."*
- Offer a **retry** action rather than making the user restart the quote.

**Confirmed with Glen.** This is the right answer for credit control and a known operational risk given the integration's observed reliability — see §12.

---

## 8. Recording the result

Every check — pass or fail — is recorded against the quote or job:

- Outcome, and which conditions failed
- The figures returned at the time
- Timestamp
- The user who triggered it

**Why:** the check runs twice on the quote path (§2), and someone asking later why a quote was blocked on Tuesday needs the position as it stood on Tuesday, not as it stands now. It also gives a record of how often the check blocks, which is the evidence for whether the rules are set correctly.

---

## 9. Rules and edge cases

1. **No customer selected.** The check cannot run and the quote cannot be created. The customer field is a prerequisite, not an optional field completed later.
2. **Customer has no Acumatica customer ID, or the ID does not resolve.** Block. Do not pass by default — an unmatched customer is an unknown credit position, not a good one. Present it as *"This customer is not linked to Acumatica"*, naming the customer, so it reads as the configuration problem it is rather than a credit failure.
3. **No credit limit set in Acumatica.** ⚠️ **Discovery item — the developer must confirm** whether an unset limit means unlimited or zero in Acumatica's model, and follow that. Do not guess: the two interpretations are opposite, and picking wrong either admits every customer or blocks every customer.
4. **No payment terms set.** Surface it as a configuration problem naming the customer. Do not silently default to 30 days.
5. **Quote value changes after a pass.** A quote that passed at $5,000 and is edited to $50,000 must be re-checked at approval (§2) — which the second trigger point already handles.
6. **Zero-value quotes** pass condition 4 trivially but are still subject to conditions 1–3.
7. **Repeated checks are not throttled.** If a user retries after a timeout, the check runs again. Do not suppress a credit check to save an API call.
8. **The check never blocks anything retrospectively.** Existing quotes and jobs are unaffected; this gates creation and approval only.

---

## 10. Acceptance criteria

**Trigger points**

- [ ] The check runs on quote creation, after the customer is selected
- [ ] The check runs again on quote approval / send
- [ ] The check runs on job creation for direct orders that have no quote
- [ ] All three apply identical rules

**Fail conditions**

- [ ] An Acumatica credit hold blocks, without recalculation
- [ ] A balance over the credit limit blocks
- [ ] Any invoice past that customer's terms blocks
- [ ] A quote or job value exceeding available credit blocks
- [ ] Terms are read per customer from Acumatica, not hard-coded to 30 days
- [ ] Overdue is derived from open invoices and their due dates, not from an aging figure
- [ ] Customers are matched to Acumatica by customer ID, never by business name
- [ ] A customer with no Acumatica ID blocks, with a message reading as a linking problem not a credit failure
- [ ] The value tested is the tax-inclusive total
- [ ] Every customer is checked, with no exemption by type

**Display**

- [ ] Credit limit, current balance, available credit, quote value, overdue amount and oldest overdue are shown
- [ ] Figures are shown on a pass as well as a fail
- [ ] Each failed condition shows its own remedy amount
- [ ] Multiple failures show multiple amounts, never a single summed figure
- [ ] A credit hold shows no remedy amount

**Blocking**

- [ ] A failed check prevents quote creation, quote approval and job creation
- [ ] No role can override, and no override control exists in the UI
- [ ] The reason names the specific condition that failed

**Availability**

- [ ] The check is real-time with a visible loading state
- [ ] An explicit timeout exists
- [ ] A timeout or unreachable Acumatica blocks the action
- [ ] The message clearly distinguishes "could not check" from "customer failed"
- [ ] A retry action is offered without restarting the quote

**Recording**

- [ ] Every check records outcome, failed conditions, figures, timestamp and user
- [ ] Both checks on the quote path are recorded separately

**Regressions**

- [ ] Nothing writes to Acumatica as a result of this feature
- [ ] Existing quotes and jobs are unaffected
- [ ] Quoting for customers who pass is not materially slower than the timeout allows

---

## 11. Decisions taken

| # | Question | Decision |
|---|---|---|
| 1 | Trigger points | Quote creation **and** approval, plus job creation for direct orders |
| 2 | Who is checked | Everyone with a customer record |
| 3 | Fail conditions | Credit hold, over limit, any invoice past terms, or this value exceeding available credit |
| 4 | Terms | Per customer, read from Acumatica |
| 5 | Value tested | Quote or job total, tax inclusive |
| 6 | Override | **None.** Hard block, no role, no permission |
| 7 | Acumatica unreachable | **Block**, with a message distinguishing it from a genuine fail, and a retry |
| 8 | Caching | None. Real-time only |
| 9 | Writes to Acumatica | None. Read-only |
| 10 | How overdue is determined | Derived from open invoices and their due dates, not an aging figure |
| 11 | Customer matching | By **customer ID**, never by business name |
| 12 | Override — reconfirmed | Still none. Raised a second time with Glen, answer unchanged |
| 13 | Blocking on unreachable — reconfirmed | Still block. Operational impact understood and accepted |

---

## 12. Risks

| Risk | Note |
|---|---|
| **Blocking on unreachable Acumatica will stop quoting** | **Confirmed and accepted.** The same transcript that produced this requirement describes Acumatica taking over half an hour to surface a sales order, and syncs timing out badly enough that timeouts had to be extended. Under this spec, that outage stops Flame Tree quoting entirely. It is the correct choice for credit control — go in expecting it, and be ready with the mitigation below. |
| **The mitigation, if it proves painful** | A short-lived cache — the customer's position held for a few minutes — would let quoting continue through a brief outage and stop repeat quotes for the same customer hammering the API. It weakens the control slightly and is not specced here. Raise it as a change if the block bites, rather than building it speculatively. |
| **Customers with no Acumatica ID block** | §6.2 matches on customer ID, which removes the name-matching risk entirely. What remains is customers whose ID is missing or stale — they block, correctly, but the message must read as a linking problem rather than a credit failure (§9.2). Worth auditing that every active customer carries a valid ID before release. |
| **Latency on the happy path** | Every quote now waits on an external system before it can be created. Even a successful check adds time to a routine action. Worth measuring against real Acumatica response times early. |

---

## 13. Discovery items

Two things the developer establishes during build. Neither blocks starting, both must be answered before release.

| # | Item | Where |
|---|---|---|
| 1 | **The timeout value** — set against observed Acumatica response times, not picked | §7.2 |
| 2 | **What an unset credit limit means in Acumatica** — unlimited or zero | §9.3 |

Everything else in this spec is decided.

---

## 14. Out of scope

- Writing credit limits, holds or terms to Acumatica
- Managing credit limits inside QuarryLink
- Overrides, exceptions or approval workflows for blocked customers
- Credit checks on any action other than quote creation, quote approval and direct-order job creation
- Re-checking or blocking existing quotes and jobs
- Caching or offline fallback
- Notifying anyone when a customer fails a check
- Customer-facing display of any credit information
