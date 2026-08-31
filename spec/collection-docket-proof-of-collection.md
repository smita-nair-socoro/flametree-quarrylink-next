# Feature Spec — Collection Docket: Proof of Collection (Photos & Signature)

| | |
|---|---|
| **Requested by** | Flame Tree (first tenant to ask; feature is being built for all tenants) |
| **Prepared** | 31 August 2026 |
| **Status** | Ready for build — all open questions closed (§11) |
| **Audience** | Developer (Cursor) |

---

## 1. Summary

Collection dockets currently have no way to capture proof that the goods were collected. Delivery dockets do — photos and a customer signature. This feature brings the same capability to collection dockets.

**In one line:** clicking *Mark as Collected* opens a modal that lets the operator attach up to two photos and capture a signature with the signer's name, before the docket is marked collected.

**Everything captured is optional.** The operator can complete a collection with no photos and no signature. The point is to make the proof *possible* and easy, not mandatory.

---

## 2. Why this differs from the base platform

This is a **base platform change**, not a tenant customisation. It is included here because it originated as a Flame Tree request.

- Build for **all tenants**, **on by default**.
- No feature flag, no per-tenant toggle.
- No data migration needed — existing collection dockets simply have no photos or signature against them.

---

## 3. What already exists (reuse this)

The delivery docket flow already solves this problem. **The strong preference is to reuse the existing delivery components, storage, and PDF rendering rather than build parallel implementations.**

Existing delivery behaviour, for reference:

- *Mark as Delivered* opens a sign-off modal.
- The modal carries two photo slots — **Unloaded Photo** (required) and **Receipt Photo** (optional) — each a tap/click-to-upload box.
- It also carries a waiting-time banner and a *Delivered Products Confirmed* checkbox.
- **Signature capture is inside this same modal.** It is gated behind the *Receiver on Site?* checkbox:
  - **Unticked** — the delivery is flagged as an **Unattended Delivery** and no name or signature is collected.
  - **Ticked** — two fields are revealed: **Receiver Name** (free text, required) and **Receiver Signature** (signature pad with a `Clear` link, required).

**This is the component to reuse.** The collection modal needs the same name + signature pair, with two differences: different labels, and no checkbox gating them.

The collection modal is a **deliberately leaner** version of this. See §5 for what is intentionally excluded.

---

## 4. Entry point and trigger

**Where:** the main QuarryLink app only.

**Not the driver app.** Unlike delivery dockets, which can be actioned in both the driver app and QuarryLink, collection dockets are only accessible in the main QuarryLink app.

**Who:** Super Admins, Admins and Users — the same roles that can access collection dockets today. No new permission is introduced.

**Trigger:** the existing **Mark as Collected** action on a collection docket.

**Change to current behaviour:** *Mark as Collected* is currently a single click that immediately marks the docket collected. It now opens the modal described below. The docket is only marked collected when the operator confirms in the modal.

---

## 5. The modal

### 5.1 Layout

Follow the visual pattern of the existing *Mark as Delivered* modal so the two feel like one system.

```
┌────────────────────────────────────────────┐
│  Mark as Collected                      ✕  │
│                                            │
│  [icon]  CD-26-000XX                       │
│          AP20 • 10 m³                      │
│                                            │
│  Proof of Collection                       │
│                                            │
│  Photo 1                                   │
│  ┌────────────────────────────────────┐    │
│  │        ⬆ Tap to upload photo       │    │
│  └────────────────────────────────────┘    │
│                                            │
│  Photo 2                                   │
│  ┌────────────────────────────────────┐    │
│  │        ⬆ Tap to upload photo       │    │
│  └────────────────────────────────────┘    │
│                                            │
│  Collector Name                            │
│  ┌────────────────────────────────────┐    │
│  │  Enter collector name              │    │
│  └────────────────────────────────────┘    │
│                                            │
│  Collector Signature           Clear       │
│  ┌────────────────────────────────────┐    │
│  │                                    │    │
│  │        (sign here)                 │    │
│  │                                    │    │
│  └────────────────────────────────────┘    │
│                                            │
│  ────────────────────────────────────────  │
│  [   Cancel   ]  [  Mark as Collected  ]   │
└────────────────────────────────────────────┘
```

### 5.2 Sections and fields

**Docket summary (header)**
Docket number, product code, quantity — mirroring the delivery modal header. Read-only. Confirms the operator is signing off the right docket.

**Section: `Proof of Collection`**

| Field | Label | Required | Notes |
|---|---|---|---|
| Photo 1 | `Photo 1` | No | Upload/capture box, same component as the delivery photo slots |
| Photo 2 | `Photo 2` | No | Identical to Photo 1 |

Both slots sit under the single section heading **Proof of Collection**. They are interchangeable — Photo 2 can be used without Photo 1.

**Collector name and signature**

Reuse the receiver name + signature component from the delivery modal, with the changes below. Field order matches delivery: name first, then signature.

| Field | Label | Required | Notes |
|---|---|---|---|
| Collector name | `Collector Name` | Conditional | Free text. Placeholder: *Enter collector name*. **Required only if a signature has been drawn** — see §6 |
| Collector signature | `Collector Signature` | No | Signature pad with a `Clear` link in the top-right of the field label row, as delivery has |

**No gating checkbox.** On delivery, these two fields are hidden until *Receiver on Site?* is ticked, because a delivery can legitimately happen with nobody there. **A collection cannot** — someone is always on site to collect. So on the collection modal both fields are **visible and active from the moment the modal opens**, with no checkbox above them, and no unattended equivalent.

The difference from delivery is that here they are **optional**. On delivery, ticking the checkbox makes both fields mandatory; on collection they are always shown and never mandatory.

**Actions**

| Button | Behaviour |
|---|---|
| `Cancel` / `✕` | Closes the modal. Nothing is saved. The docket is **not** marked collected |
| `Mark as Collected` | Saves any captured photos and signature against the docket, then marks it collected |

### 5.3 Deliberately excluded

These exist on the delivery modal and are **not** wanted on collection:

- ❌ Waiting Time at Site banner
- ❌ *Delivered Products Confirmed* checkbox
- ❌ *Receiver on Site?* checkbox and the Unattended Delivery flag — the name and signature fields are shown unconditionally instead

---

## 6. Rules and validation

1. **Photos and signature are all optional.** `Mark as Collected` is enabled on open and stays enabled. An operator can complete a collection having captured nothing.
2. **Collector Name is required *only* if a signature has been drawn.** A signature with no name is not proof of anything. Show a validation message against the name field — e.g. *"Enter the collector's name."* — and block submission until it is filled. This is the same validation delivery applies, just triggered by the signature rather than by a checkbox.
3. **A name with no signature is allowed** and saves as-is. (Flagged — §11 Q4.)
4. **Cancel discards.** No draft state, no partial save. Closing the modal by any means leaves the docket exactly as it was.
5. **Capture is locked once the docket is marked collected.** Photos and the signature cannot be added, replaced or removed afterwards — by any role, including Super Admin. The modal is the only capture point.
6. **Soft confirmation when nothing is captured.** If the operator clicks `Mark as Collected` with no photos, no signature and no name, show a confirmation step — *"No proof of collection captured. Continue?"* — with the choice to go back and add it or proceed anyway. Proceeding is always allowed; this is a prompt, not a block. It must **not** appear when anything at all has been captured.
7. **The docket is marked collected only on successful save.** If the upload or save fails, the docket stays in its pre-collection state and the modal shows the error with the captured content intact, so the operator can retry without re-signing.

---

## 7. Photo handling

Mirror the delivery photo implementation exactly — accepted file types, maximum file size, client-side compression, EXIF orientation handling and storage location. **Do not introduce different constraints for collection.**

- Both file upload and device camera capture, as delivery does.
- Usual context is a desktop or tablet in the office or weighbridge, not a phone in a truck cab.
- Offline capture is **not** required — the main QuarryLink app is used online.

---

## 8. Data captured

Against the collection docket, for each item saved:

**Per photo:** the image, its slot (1 or 2), the user who uploaded it, and the timestamp.

**For the signature:** the signature image, the collector's name as typed, the user who captured it, and the timestamp.

Follow whatever pattern delivery dockets already use for this — the same tables/columns extended to collection dockets is preferable to a new parallel structure.

---

## 9. Where it surfaces

**9.1 Collection docket PDF**

**Match the delivery docket PDF logic exactly.** Once a docket is marked collected, the printable PDF includes the photos and signature, in the same way the delivery PDF does once marked delivered.

The delivery PDF's *Sign Off* block, for reference:

- Section heading **Sign Off** with a green tick, and **"Delivered at 09:30 AM"** right-aligned on the same row.
- **Receiver Name** and **Receiver On Site** as a two-column label/value row beneath it.
- Then a three-across row of image tiles: **Unloaded Photo**, **Receipt Photo**, **Receiver Signature**.
- **Missing images render as a bordered placeholder tile reading *"No photo provided"*** — the tile is not hidden. Keep this behaviour.

The collection equivalent:

| Delivery PDF | Collection PDF |
|---|---|
| Heading: `Delivery Docket` | `Collection Docket` |
| `Delivered at [time]` | `Collected at [time]` |
| `Receiver Name` | `Collector Name` |
| `Receiver On Site` | *(omit — no equivalent field)* |
| `Unloaded Photo` | `Photo 1` |
| `Receipt Photo` | `Photo 2` |
| `Receiver Signature` | `Collector Signature` |

Everything else — the Sign Off heading, tick, timestamp placement, three-across tile row and the *No photo provided* placeholder — stays as delivery has it. The empty signature tile follows the same placeholder treatment as the photos.

**9.2 Collection docket record in QuarryLink**
Photos and signature are viewable against the docket in the office, as attachments/proof, matching how delivery proof is displayed today. Photos open full size on click.

**9.3 Not in scope**
Emailing proof of collection to the customer is **not** part of this build. If the collection docket PDF is already emailed to the customer, the proof will flow through with it — no separate email work.

---

## 10. Acceptance criteria

- [ ] *Mark as Collected* opens the modal instead of immediately marking the docket collected
- [ ] The modal is reachable in the main QuarryLink app by Super Admins, Admins and Users
- [ ] The modal is **not** reachable from the driver app
- [ ] Modal header shows the correct docket number, product and quantity
- [ ] Two upload slots appear under a **Proof of Collection** heading, labelled Photo 1 and Photo 2
- [ ] A free-text **Collector Name** field and a **Collector Signature** pad appear beneath the photos, in that order
- [ ] Both are visible and usable the moment the modal opens — no checkbox to reveal them
- [ ] The signature pad has a working `Clear` action
- [ ] Docket can be marked collected with nothing captured
- [ ] Docket can be marked collected with one photo, two photos, or signature only
- [ ] Drawing a signature without entering a collector name blocks submission with a clear message
- [ ] Cancel and ✕ both discard everything and leave the docket uncollected
- [ ] On save, the docket is marked collected and all captured items are stored against it
- [ ] A failed save leaves the docket uncollected and preserves what the operator captured
- [ ] Captured proof cannot be added to, replaced or removed after the docket is collected
- [ ] Marking collected with nothing captured shows the *"No proof of collection captured. Continue?"* confirmation
- [ ] That confirmation does not appear when any photo, name or signature is present
- [ ] Proceeding past the confirmation marks the docket collected as normal
- [ ] The collection docket PDF renders a Sign Off block matching delivery: heading, tick, *Collected at [time]*, Collector Name, and a three-across row of Photo 1 / Photo 2 / Collector Signature
- [ ] Empty tiles on the PDF render the *No photo provided* placeholder rather than being hidden
- [ ] Photos and signature are viewable against the docket record in the office
- [ ] The waiting-time banner, products-confirmed checkbox and unattended flag do **not** appear
- [ ] Existing collection dockets with no proof continue to display and print correctly
- [ ] The feature is live for all tenants with no configuration required

---

## 11. Decisions taken

All questions raised during drafting are closed. Recorded here so the developer doesn't re-litigate them.

| # | Question | Decision |
|---|---|---|
| 1 | Where is delivery signature capture implemented? | In the *Mark as Delivered* modal, revealed by the *Receiver on Site?* checkbox. **Reuse that component** |
| 2 | Does the collection docket PDF take a photo and signature block? | Mirror delivery exactly — once marked collected, the PDF includes them. See §9.1 |
| 3 | Soft confirmation when nothing is captured? | **Yes.** See §6 rule 6 |
| 4 | Name without a signature? | Allowed and saved. The constraint runs one way only: **a signature requires a name** |
| 5 | Photo count | **Two, permanently.** Not a phase-1 limit |

---

## 12. Out of scope

- Making any of the fields mandatory, per-tenant or otherwise
- Per-tenant configuration of this feature
- More than two photo slots
- Any change to the delivery docket flow
- Proof of collection in the driver app
- A separate proof-of-collection email to the customer
- Retrospective capture against already-collected dockets
- Backfilling proof against historical dockets
