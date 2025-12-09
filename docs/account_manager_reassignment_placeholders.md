# Account manager reassignment email template replacements

Templates in `public/email-templates/`:
- `account_manager_bulk_reassignment.html`
- `account_manager_ownership_change.html`

Replace every `{placeholder}` before sending.

## Common placeholders
- `logoBlock`: HTML for the logo in the navbar.
- `BusinessName`: Tenant/company name (navbar title and footer copyright).
- `accountManagerName`: Recipient account manager.
- `customerName`: Customer involved in the reassignment (single-customer template).
- `customerProfileUrl`: Link to the customer profile (single-customer template button).
- `BorderColorClass`: Use `border-other` for non-QuarryLink brands; leave empty for QuarryLink (affects the customer info block).
- `buttonColorClass`: Use `btn-orther` for non-QuarryLink brands; leave empty for QuarryLink.
- `TenantEmail`, `TenantPhone`, `TenantAddressLine1`, `TenantAddressLine2`, `TenantWebsite`: Footer contact details for non-QuarryLink tenants.

## Template-specific placeholders
- `account_manager_bulk_reassignment.html`:
  - `previousAccountManagerName`: The account manager who was removed.
  - `customerListHtml`: HTML list of reassigned customers (already includes links).
- `account_manager_ownership_change.html`:
  - `customerName`: Customer reassigned to the new account manager (used in subject/body and info block).
  - `customerProfileUrl`: Link for the “View Customer Profile” button.

## Branding/class rules (both templates)
- `navbarColorClass`: Use `navbar-other` for non-QuarryLink brands; leave empty for QuarryLink.
- `quarrylinkFooterClass` and `otherFooterClass`:
  - QuarryLink brand: set `otherFooterClass` to `hidden-footer`; leave `quarrylinkFooterClass` unchanged to show the QuarryLink footer.
  - Other brands: set `quarrylinkFooterClass` to `hidden-footer`; leave `otherFooterClass` unchanged to show the tenant footer.
