# Feature Spec — Job List: Quarry and PO Columns with Filters

| | |
|---|---|
| **Client** | Flame Tree |
| **Prepared** | 31 August 2026 |
| **Status** | Ready for build |
| **Audience** | Developer (Cursor) |

---

## 1. Summary

Four related additions to the **Jobs** table:

1. A **Quarry / Supplier** column, so staff can tell apart jobs for the same customer running out of different quarries.
2. A filter for that column.
3. A **PO** column showing the customer's purchase order number.
4. A filter for that column.

**The complication worth reading before you build:** Flame Tree have said a job will always have one quarry and one PO. **The platform does not guarantee that.** A job holds multiple line items, and each line item carries its own PO and its own supplying quarry. So both columns must handle multiple values per job from day one — see §4.

---

## 2. What already exists

The Jobs table today has:

- Columns: **Job Number**, **Customer**, **Project Name**, **Status**, **Uninvoiced Dockets**, **Account Manager**, and a row actions menu.
- Filter chips above the table: **+ Status**, **+ Customer**, **+ Account Manager**.
- A **Search jobs…** free-text box.
- A **Show/Hide Columns** dropdown.
- Sortable columns (Job Number, Customer, Project Name, Uninvoiced Dockets).
- Server-side pagination with a rows-per-page selector.

**Everything new below follows these existing patterns.** New filters are chips of the same kind; new columns join Show/Hide Columns like any other. Nothing about the current table's behaviour changes.

### 2.1 Internal transfer jobs are not in this table

The Jobs page carries **two tabs**: **Jobs** and **Internal Transfers**. Everything in this spec describes the **Jobs** tab only.

Internal transfer jobs have no customer, no PO and no line-item quarry — every column here would be empty or meaningless for them. They live on their own tab with their own columns, specified in `spec-internal-transfer-dockets.md` §3.4.

**This is a filter on the data, not a branch in the logic.** The Jobs tab excludes internal transfer jobs at the query, so the aggregation in §4 never encounters one. Do not write a job-type conditional inside the column logic — there is nothing for it to handle.

---

## 3. Where the data comes from

Both values live on the **job line item**, not the job.

| Column | Source |
|---|---|
| Quarry / Supplier | The supplying quarry on each line item — the same value shown in the `Quarry / Supplier` column on the job's Line Items table (e.g. *Sabeto*) |
| PO | The customer PO number on each line item |

Each column shows the **distinct** values across all line items on that job.

**Column headers:**

- **`Quarry / Supplier`** — matching the existing column label on the job's Line Items table. Do not shorten it to "Quarry"; staff already read this term on the line items and the two views should agree.
- **`PO`** for the purchase order column.

---

## 4. Multi-value display — applies to both columns

This is the core of the build. Both columns behave identically.

### 4.1 The display rule

Show the **first distinct value**, then a count badge of how many *other* distinct values exist.

| Distinct values on the job | Cell shows |
|---|---|
| 0 | `—` |
| 1 | `PO1234` |
| 2 | `PO1234 +1` |
| 3 | `PO1234 +2` |
| 5 | `PO1234 +4` |

**The number is the count of additional values, not the total.** Two POs reads `+1`.

Same for quarry/supplier: `Sabeto`, `Sabeto +1`, `Sabeto +2`.

### 4.2 Which value leads

**Line item order** — the value from the first line item on the job, in the order line items appear inside the job. Staff cross-referencing against the job itself see the same order.

### 4.3 Distinct values only

If three line items all carry `PO1234`, the cell reads `PO1234` with **no badge**. The count is of distinct values, not line items.

Matching is on the stored value. `PO1234` and `po1234` should be treated as the same value for counting and display purposes; case-insensitive comparison, but display the value as stored on the first line item.

**This matters for PO only.** PO is free text, so casing varies with whoever typed it. **Quarry / Supplier is a controlled list** selected from a dropdown, so the same value is always the same string — no casing variance is possible and no case-insensitive handling is needed there.

### 4.4 The hover

Hovering the cell reveals the **full list of distinct values**, one per line, in the same line item order.

- The tooltip lists **all** values including the one already displayed, so staff read one complete list rather than mentally appending.
- Trigger on the whole cell, not just the badge — the badge is a small target.
- Must also be reachable by keyboard focus, not hover alone.
- No tooltip when there is only one value or none.

### 4.5 Truncation

Long values truncate with an ellipsis to keep column widths stable. **The count badge must never be truncated** — it is the signal that there is more to see. Truncated values are shown in full in the tooltip.

---

## 5. The Quarry / Supplier column

- Header: `Quarry / Supplier`.
- Position: **immediately after Customer.**
- Visible by default.
- Available in Show/Hide Columns.
- Sortable, on the leading value (§4.2), ascending/descending.
- Display rules exactly as §4.

## 6. The PO column

- Header: `PO`.
- Position: **immediately after Project Name.**
- Visible by default.
- Available in Show/Hide Columns.
- Sortable, on the leading value (§4.2), ascending/descending.
- Display rules exactly as §4.

Resulting column order:

| # | Column |
|---|---|
| 1 | Job Number |
| 2 | Customer |
| 3 | **Quarry / Supplier** *(new)* |
| 4 | Project Name |
| 5 | **PO** *(new)* |
| 6 | Status |
| 7 | Uninvoiced Dockets |
| 8 | Account Manager |
| 9 | Row actions |

---

## 7. Filters

Both new filters are **chips above the table**, matching the existing `+ Status` / `+ Customer` / `+ Account Manager` pattern in appearance and behaviour.

### 7.1 Quarry / Supplier filter

- Chip label: `Quarry / Supplier`.
- Multi-select list of quarries/suppliers.
- The list is short and stable, so a plain list is fine — no search field needed.

### 7.2 PO filter

- Chip label: `PO`.
- Multi-select dropdown of PO numbers.
- **Must include a type-to-narrow search field at the top of the dropdown.** PO numbers accumulate indefinitely; a plain list stops being usable within a couple of years.
- The dropdown offers distinct PO numbers across all jobs, not only the current page.

**Populating this dropdown is its own performance problem, separate from applying the filter.** Enumerating distinct POs across every job in a multi-year database is a real query cost paid before anyone has filtered anything. Three requirements:

1. **Do not load the list on page load.** Populate it when the dropdown is opened, not before.
2. **The search field queries the server, it does not filter a preloaded list.** Typing sends a contains-match and returns a capped set of results — 50 is ample. This means the full distinct set is *never* enumerated, which is the only version of this that still works in five years.
3. **Index the PO column** so both the type-ahead and the filter query are served by an index rather than a scan.

Point 2 is the one that matters. A search field over a fully preloaded list only helps once the expensive part has already happened.

### 7.3 Matching semantics — important

**A job matches if *any* of its line items match.** A job with line items carrying `PO1234` and `PO5678` appears when filtering on either. Every PO on a job is filterable, not just the one displayed in the cell.

Same for quarry/supplier: a job supplied from two quarries appears under both.

Within one filter, multiple selections are **OR**. Across different filters, **AND** — consistent with how the existing filters combine.

### 7.4 Filtering does not change the display

A job matched on its second PO still displays its **first** PO in the cell, per §4.2. The cell always shows the job's leading value; it does not reorder to show whatever matched. Consistent rows beat clever ones — and the `+N` badge plus hover tell the reader why the row is there.

---

## 8. Global search

The existing **Search jobs…** box must also match against **PO number** and **quarry / supplier**, in addition to whatever it searches today.

Same any-line-item semantics as §7.3. Partial matches, consistent with the box's current behaviour — staff paste a PO out of an email and expect the job to surface.

---

## 9. Rules and edge cases

1. **No line items on the job.** Both cells show `—`. The job still appears in unfiltered lists.
2. **Line items with the value blank.** Blank values are excluded from the distinct list and from the count. A job with three line items where only one has a PO shows that PO with **no badge**.
3. **All values blank.** Cell shows `—`, same as having none.
4. **Sorting rows with `—`.** Empty values sort **last in both directions** — ascending and descending. They are never pinned to the top. The point of sorting these columns is to find populated rows, and that holds whichever way the arrow points.
5. **Tiebreak when leading values are equal.** Two jobs both leading with `Sabeto` are ordered by **Job Number descending** — the table's existing default order. Job Number is unique, so this fully determines row order with no third level needed.

   **Never leave the tiebreak to database return order.** It looks stable in testing and shuffles in production as rows are updated, which reads to users as rows jumping around while they page through results.
6. **Pagination and filtering are server-side.** Both new filters and the search additions must work across the full result set, not just the loaded page. Counts and pagination update accordingly.
7. **Existing saved views, filters or URLs must not break.** Adding columns and filter options must not invalidate any persisted table state.
8. **Column preferences persist** as they do for existing columns — if a user hides the PO column, it stays hidden for them.
9. **Performance — three separate costs, not one.** Check each:
   - **Column aggregation** — distinct values across line items for every row in the page. Must not be a per-row query in a loop.
   - **Filter application** — matching jobs by any line item value once a filter is selected.
   - **PO dropdown population** — enumerating distinct POs across the whole database, paid before any filter is applied. See §7.2; this is the one most likely to be missed because it happens before the user does anything.

   The approach is left to the developer, but all three should be sanity-checked against a database with a large job history before this is called done.

---

## 10. Acceptance criteria

**Columns**

- [ ] `Quarry / Supplier` column appears immediately after Customer, visible by default
- [ ] `PO` column appears immediately after Project Name, visible by default
- [ ] Both columns appear in Show/Hide Columns and can be toggled
- [ ] Headers read exactly `Quarry / Supplier` and `PO`, matching the Line Items table
- [ ] Both columns are sortable ascending and descending on the leading value
- [ ] Empty values sort last in **both** ascending and descending order
- [ ] Rows with equal leading values are ordered by Job Number descending, never by database return order
- [ ] A user's show/hide preference for the new columns persists across sessions

**Multi-value display**

- [ ] A job with one distinct value shows it with no badge
- [ ] A job with two distinct values shows `Value +1`
- [ ] A job with three distinct values shows `Value +2`
- [ ] Repeated identical values across line items count once and produce no badge
- [ ] The leading value is the first line item's, in line item order
- [ ] Hovering the cell lists all distinct values, one per line, in line item order
- [ ] The tooltip is reachable by keyboard focus
- [ ] No tooltip appears when there is one value or none
- [ ] Long values truncate with an ellipsis; the count badge never truncates
- [ ] Empty cells render `—`

**Filters**

- [ ] A `Quarry / Supplier` filter chip appears alongside the existing chips and multi-selects
- [ ] A PO filter chip appears alongside the existing chips and multi-selects
- [ ] The PO dropdown has a working type-to-narrow search field
- [ ] The PO list is populated on dropdown open, not on page load
- [ ] The search field queries the server and returns a capped result set, rather than filtering a preloaded list
- [ ] The full distinct PO set is never enumerated in one go
- [ ] The PO column is indexed
- [ ] The PO dropdown lists distinct POs across all jobs, not just the current page
- [ ] Filtering on any PO belonging to a job returns that job, including POs not shown in the cell
- [ ] Filtering on any quarry / supplier on a job returns that job
- [ ] Multiple selections within one filter behave as OR
- [ ] New filters combine with existing filters as AND
- [ ] A row matched on a secondary value still displays its leading value

**Search**

- [ ] Searching a full or partial PO number in Search jobs… returns the job
- [ ] Searching a quarry / supplier name in Search jobs… returns the job
- [ ] Existing search behaviour is unchanged

**Tabs**

- [ ] The Jobs page carries Jobs and Internal Transfers tabs
- [ ] The Jobs tab excludes internal transfer jobs at the query
- [ ] No job-type conditional exists inside the column aggregation logic

**Regressions**

- [ ] Existing columns, filters, sorting and pagination are unaffected
- [ ] Jobs with no line items render correctly and remain listable
- [ ] Table performance with a large job history is not materially degraded

---

## 11. Decisions taken

| # | Question | Decision |
|---|---|---|
| 1 | Where does the quarry live? | On the job line item, same as PO |
| 2 | Quarry display treatment | Identical `+N` and hover pattern as PO |
| 3 | PO filter type | Multi-select dropdown, with a search field inside it |
| 4 | Column placement | Visible by default, in context — Quarry / Supplier after Customer, PO after Project Name |
| 5 | Column headers | `Quarry / Supplier` and `PO`, matching the Line Items table |
| 6 | Which value leads the cell | Line item order |
| 7 | Global search | Matches both PO and quarry / supplier |
| 8 | Multiple identical values | Counted once — distinct values only |

---

## 12. Out of scope

- Surfacing quarry / supplier or PO anywhere other than the Jobs table
- Editing quarry / supplier or PO from the Jobs table
- Restricting a job to a single quarry / supplier or a single PO
- Any change to how line items store these values
- Grouping or subtotalling the Jobs table by quarry
- Export — the Jobs table has no export, so there is nothing to extend
