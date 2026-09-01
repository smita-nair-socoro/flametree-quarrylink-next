# Feature Spec — Attachments Against a Job

| | |
|---|---|
| **Client** | Flame Tree |
| **Prepared** | 31 August 2026 |
| **Status** | Ready for build |
| **Audience** | Developer (Cursor) |

---

## 1. Summary

Allow files and documents to be attached directly to a **Job**.

**This is a port, not a new pattern.** Attachments already exist on the Customer record. The job version reuses the same UI, the same modal, the same table and the same empty state. The differences are a **3-file cap**, a **10 MB per-file limit**, a **job-specific category list**, and an **Uploaded By** column.

The attachment is stored **against the job only** — it does not propagate to dockets, invoices, the customer record, or anywhere else.

---

## 2. What already exists — reuse it

Customer attachments are live and are the reference implementation. **Reuse the components, storage, and upload handling rather than writing a parallel implementation.**

### 2.1 The existing Attachments section (Customer record)

- Section heading **Attachments** with an **Add Attachment** button, right-aligned on the heading row.
- A table with columns **File Name**, **Category**, **Date Uploaded** — each sortable.
- **Total Records** count and a **Rows per page** selector beneath the table.
- Empty state: a bordered panel with the illustration and the text **"No items are available"**.
- Row actions via a `⋯` menu.

### 2.2 The existing Add Attachment modal

- Title **Add Attachment**, with an upload icon, subtitle *"Upload a file and assign a category below."*
- **Category\*** — dropdown, placeholder *Select category…*
- **File Name\*** — free text, placeholder *Enter file name*
- **File Upload\*** — click-to-upload dropzone, with accepted formats listed beneath: *PDF, Word, Excel (xlsx), JPEG, JPG, PNG, .eml*
- Footer: **Cancel** and **Add Attachment**.

**All of the above carries over to jobs unchanged**, except where §4 says otherwise.

---

## 3. Placement

An **Attachments** section on the **Job detail page**, presented exactly as it is on the Customer record — same heading, same button placement, same table, same empty state.

Position it consistently with the Customer record's layout (below the main detail fields, above any audit information block).

---

## 4. What differs from customer attachments

### 4.1 An Uploaded By column

The customer attachments table shows **File Name**, **Category**, **Date Uploaded**. The job table adds a fourth: **Uploaded By**.

| Column | |
|---|---|
| File Name | |
| Category | |
| Date Uploaded | |
| **Uploaded By** | **New** — the user who added the file |

Sortable like the others.

**Why:** with a 3-file cap, no versioning and any job editor able to delete, a permit or safety document can disappear with nothing recording who put it there. `Uploaded By` is one stored field and one column, and it makes the person accountable for a compliance document visible on the row.

**Deliberately not added:** versioning, and any audit trail of deletions or edits. There is no edit path at all (§4.7). A deleted attachment leaves no record — accepted.

### 4.2 Category list

Jobs get their own list — **confirmed**. Seven options, in this display order:

| # | Category |
|---|---|
| 1 | Purchase Order |
| 2 | Quote / Contract |
| 3 | Site Map / Access |
| 4 | Permit / Approval |
| 5 | Safety Documentation |
| 6 | Correspondence |
| 7 | Other |

Single select, required, same dropdown control as the customer modal. The list is fixed in this release — see §9.

### 4.3 Three files per job — hard cap

- A job may hold a **maximum of 3 attachments**.
- At 3, the **Add Attachment button is disabled** and shows a count: **`3 of 3`**.
- Below 3, the button is enabled and shows the count in the same place — `1 of 3`, `2 of 3` — so the ceiling is visible before anyone hits it.
- **Deleting an attachment frees a slot**, and the button re-enables immediately.
- The cap is enforced **server-side as well as in the UI**. A disabled button is not a limit.

### 4.4 File size — 10 MB per file

- Maximum **10 MB per file**. No total-per-job limit beyond the 3 × 10 MB the cap implies.
- Validate **before upload begins**, not after. Show the error against the File Upload field, naming the limit and the file's actual size — e.g. *"This file is 14.2 MB. The maximum is 10 MB."*
- Enforced server-side as well.

### 4.5 Accepted file types

Same list as customer attachments, unchanged:

**PDF · Word · Excel (xlsx) · JPEG · JPG · PNG · .eml**

- Listed beneath the dropzone, as they are today.
- Rejected types produce a clear error naming what is accepted.
- Validate on the file itself, not the extension alone.

**What "validate the file itself" means, by type:**

| Type | Check |
|---|---|
| PDF, Word, Excel, JPEG, JPG, PNG | Magic bytes / file signature, as the customer attachment pipeline already does |
| **`.eml`** | **Not a signature check — `.eml` is plain text with no magic bytes.** Parse it as an RFC 5322 message and require it to have a valid header block: at least one recognised header (`From`, `To`, `Subject`, `Date` or `Message-ID`), followed by a blank line separating headers from the body. If it doesn't parse as a mail message, reject it |

This is called out because "validate the file itself" is unambiguous for the binary formats and meaningless for `.eml` — without a rule, it will be implemented inconsistently or skipped.

### 4.6 Malware and content scanning

**Every uploaded file passes through the same malware and content scanning already applied to document uploads elsewhere in the product.** No new pipeline, no different rules, no exceptions for job attachments.

A file that fails scanning is rejected, no attachment record is created, the slot is not consumed, and the user is told the file was rejected.

### 4.7 Row actions — download and delete only

The `⋯` menu on each row offers:

- **Download**
- **Delete**

**No editing** of file name or category after upload. A miscategorised file is deleted and re-uploaded — with a 3-file cap and a free slot on delete, that is a cheap correction.

Delete asks for confirmation before removing, and the removal is permanent.

### 4.8 Permissions

**Anyone who can edit the job can add and delete attachments** — no new permission, no separate role check, no uploader-only restriction on deletion.

---

## 5. Scope of the attachment

**The attachment is saved against the job and nowhere else.**

- Not copied or linked to the customer record.
- Not attached to dockets raised against the job.
- Not attached to invoices generated from the job.
- Not included in any job-related email or PDF.
- No column or indicator on the Jobs list table.

**Jobs cannot be deleted** in QuarryLink — they can only be cancelled, and a cancelled job retains its record. So there is no cascade to build. A cancelled job keeps its attachments, and they remain viewable and downloadable.

---

## 6. Rules and edge cases

1. **File Name is a display name, not the filename.** It is required and free text, as on the customer modal. Pre-fill it with the uploaded file's name (extension stripped) so the common case is one click, and let the user overwrite it.
2. **Duplicate file names are allowed.** Two attachments on a job may share a name. Do not block or auto-rename.
3. **Job status does not restrict attachments.** Files can be added to and deleted from a job in any status, including Completed, Paused and Cancelled. Site paperwork often arrives after the work does.
4. **Cancel discards.** Closing the modal by Cancel or `✕` uploads nothing.
5. **Failed upload leaves no row.** If the upload fails, no attachment record is created, the slot is not consumed, and the modal stays open with an error so the user can retry.
6. **Date Uploaded** records when the file was attached, displayed in the same format and timezone handling the customer attachments table uses.
7. **Concurrent uploads — check the cap before writing the file.** If two users attach to the same job at once and the pair would take it past 3, the second is rejected with a clear message.

   **The order matters:** the cap check and slot claim must happen **before** the file is written to storage, not after. Checking afterwards means both files land, one is then rejected, and its blob is orphaned in storage with nothing pointing at it. Claim the slot first, write second, and release the slot if the write fails.

   This is the same approach used elsewhere in the product — reject the second upload rather than queue or merge it.
8. **Storage** follows the same location, retention and access controls as customer attachments. Files must not be publicly addressable — downloads go through the same authenticated path.

---

## 7. Acceptance criteria

**Section and table**

- [ ] An Attachments section appears on the Job detail page, matching the Customer record's presentation
- [ ] The table has File Name, Category, Date Uploaded and Uploaded By columns, each sortable
- [ ] Uploaded By records and displays the user who added the file
- [ ] Total Records and Rows per page appear beneath the table
- [ ] With no attachments, the empty state shows the illustration and *"No items are available"*

**Adding**

- [ ] Add Attachment opens the same modal used on the Customer record
- [ ] The Category dropdown lists exactly the seven categories at §4.2, in that order, and is required
- [ ] File Name is required, pre-filled from the uploaded file's name, and editable
- [ ] The dropzone lists PDF, Word, Excel (xlsx), JPEG, JPG, PNG, .eml
- [ ] An accepted file under 10 MB uploads and appears in the table
- [ ] A file over 10 MB is rejected before upload with an error naming the limit and the file's size
- [ ] An unsupported file type is rejected with an error naming what is accepted
- [ ] Binary formats are validated by file signature, not extension
- [ ] A `.eml` is validated by parsing it as an RFC 5322 message with a valid header block
- [ ] A file renamed to `.eml` that is not a mail message is rejected
- [ ] Every upload passes through the existing malware and content scanning
- [ ] A file failing the scan is rejected, creates no record, and does not consume a slot
- [ ] Cancel and ✕ close the modal without uploading

**The cap**

- [ ] With 0–2 attachments the button is enabled and shows the current count out of 3
- [ ] With 3 attachments the button is disabled and shows `3 of 3`
- [ ] Deleting an attachment re-enables the button immediately
- [ ] A request to store a 4th attachment is rejected server-side even if the UI is bypassed
- [ ] Two simultaneous uploads cannot push a job to 4 attachments
- [ ] The cap is checked and the slot claimed before the file is written to storage
- [ ] A rejected concurrent upload leaves no orphaned file in storage
- [ ] A failed write releases the claimed slot

**Row actions**

- [ ] Each row offers Download and Delete, and nothing else
- [ ] Download returns the original file through an authenticated path
- [ ] Delete confirms before removing
- [ ] Any user who can edit the job can add and delete attachments

**Scope**

- [ ] Attachments appear only on the job — not on the customer, dockets, invoices or the Jobs list
- [ ] Attachments can be added to and removed from jobs in any status
- [ ] A cancelled job keeps its attachments, and they remain viewable and downloadable

**Regressions**

- [ ] Customer attachments are unaffected

---

## 8. Decisions taken

| # | Question | Decision |
|---|---|---|
| 1 | Behaviour at the 3-file cap | Disable the button, show `3 of 3` |
| 2 | Row actions | Download and delete only — no post-upload editing |
| 3 | Per-file size limit | 10 MB |
| 4 | Who can delete | Anyone who can edit the job |
| 5 | File types | Same list as customer attachments |
| 6 | Where the attachment lives | The job only |
| 7 | Uploader tracking | An **Uploaded By** column. No versioning, no delete audit trail |
| 8 | Malware scanning | The existing document-upload scanning, unchanged |
| 9 | `.eml` validation | Parsed as an RFC 5322 message — see §4.5 |
| 10 | Concurrency | Cap checked and slot claimed before the file is written |
| 11 | Job deletion | Not applicable — jobs are cancelled, never deleted |
| 12 | Category list | The seven at §4.2 |

---

## 9. Out of scope

- Attachments anywhere other than the Job detail page
- More than 3 files per job, or a configurable cap
- A category admin screen — the list is fixed in code
- Editing an attachment's name or category after upload
- An audit trail of deletions
- Versioning, or replacing a file in place
- Previewing files in-app — download only
- Bulk upload, drag-and-drop of multiple files, or zip handling
- Attaching files to dockets, invoices or line items
- Any change to customer attachments
