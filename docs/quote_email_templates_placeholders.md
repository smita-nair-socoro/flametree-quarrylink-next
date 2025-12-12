# Quote email template replacements

Templates in `public/email-templates/`:
- `quote_sent_to_customer.html`
- `quote_revision_sent.html`
- `quote_expiry_warning.html`
- `quote_expiry_extension.html`
- `quote_expired.html`
- `quote_declined_customer.html`
- `quote_declined_tenant.html`
- `quote_approved_customer.html`
- `quote_approved_tenant.html`

Replace every `{placeholder}` before sending.

## Branding/class rules (all templates)
- `navbarColorClass`: use `navbar-other` for non-QuarryLink brands; leave empty for QuarryLink.
- `BorderColorClass`: use `border-other` for non-QuarryLink brands; leave empty for QuarryLink.
- `buttonColorClass`: use `btn-orther` for non-QuarryLink brands; leave empty for QuarryLink.
- `quarrylinkFooterClass` and `otherFooterClass`:
  - QuarryLink brand: set `otherFooterClass` to `hidden-footer`; leave `quarrylinkFooterClass` unchanged to show the QuarryLink footer.
  - Other brands: set `quarrylinkFooterClass` to `hidden-footer`; leave `otherFooterClass` unchanged to show the tenant footer.

## Common placeholders across templates
- `logoUrl`: URL for the logo image in the navbar.
- `logoImageClass`: Class to control logo image visibility. Use `hidden-logo` if no logo URL is provided; leave empty otherwise.
- `logoInitials`: Two-letter business initials (e.g., "OQ" for "One Quarry"). Displayed when no logo URL is provided.
- `logoInitialClass`: Class to control logo initials visibility. Use `hidden-logo` if a logo URL is provided; leave empty otherwise.
- `BusinessName`: Tenant/company name (navbar title and footer copyright).
- `quoteNumber`: Quote identifier (used in title/body).
- `projectName`: Project name tied to the quote.
- `quoteType`: Type of quote.
- `totalValue`: Quote total (number only; template adds `$` and "ex GST").
- `quoteUrl`: Link for "View Quote" (where present).
- `accountManagerName`, `accountManagerEmail`: Contact info for the sender/owner (used in contact section).
- `TenantEmail`, `TenantPhone`, `TenantAddress`, `TenantWebsite`: Footer contact details for non-QuarryLink tenants.

## Template-specific placeholders
- `quote_sent_to_customer.html`
  - `customerContactFirstName`: Customer recipient first name.
  - `quarryName`: Quarry sending the quote.
  - `expiryDate`: Quote expiry date.
- `quote_revision_sent.html`
  - `customerContactFirstName`: Customer recipient first name.
  - `quarryName`: Quarry sending the quote.
  - `expiryDate`: Current expiry date.
- `quote_expiry_warning.html`
  - `customerContactFirstName`: Customer recipient first name.
  - `quarryName`: Quarry sending the quote.
  - `expiryDate`: Quote expiry date (also used in warning line).
- `quote_expiry_extension.html`
  - `customerContactFirstName`: Customer recipient first name.
  - `quarryName`: Quarry sending the quote.
  - `previousExpiryDate`: Old expiry date.
  - `newExpiryDate`: Extended expiry date.
- `quote_expired.html`
  - `customerContactFirstName`: Customer recipient first name.
  - `quarryName`: Quarry sending the quote.
  - `expiryDate`: Date the quote expired.
- `quote_declined_customer.html`
  - `customerContactFirstName`: Customer recipient first name.
  - `quarryName`: Quarry sending the quote.
- `quote_declined_tenant.html`
  - `accountManagerName`: Tenant user recipient name (already common but acts as salutation here).
  - `customerName`: Customer business name.
  - `customerContactFirstName`: Customer contact first name who declined.
  - `declineDate`: Decline timestamp/date.
- `quote_approved_customer.html`
  - `customerContactFirstName`: Customer recipient first name.
  - `quarryName`: Quarry sending the quote.
  - `expiryDate`: Quote expiry date.
- `quote_approved_tenant.html`
  - `accountManagerName`: Tenant user recipient name (already common but acts as salutation here).
  - `customerName`: Customer business name.
  - `customerContactFirstName`: Customer contact first name who approved.
  - `approvalDate`: Approval timestamp/date.
