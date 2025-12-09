# New customer & password reset email template replacements

Templates in `public/email-templates/`:
- `new_customer_created.html`
- `password_reset.html`

Replace every `{placeholder}` before sending.

## Common placeholders
- `logoBlock`: HTML for the logo in the navbar.
- `BusinessName`: Tenant/company name (navbar title and footer copyright).
- `userName`: Recipient name (used in `password_reset.html`).
- `accountManagerName`: Recipient name (used in `new_customer_created.html`).
- `TenantEmail`, `TenantPhone`, `TenantAddressLine1`, `TenantAddressLine2`, `TenantWebsite`: Footer contact details for non-QuarryLink tenants.

## Template-specific placeholders
- `new_customer_created.html`:
  - `customerName`: Name of the newly assigned customer.
  - `customerProfileUrl`: Link to view the customer profile.
  - `BorderColorClass`: Use `border-other` for non-QuarryLink brands; leave empty for QuarryLink (affects customer info block).
- `password_reset.html`:
  - `resetPasswordUrl`: Link to reset password.

## Branding/class rules (both templates)
- `navbarColorClass`: Use `navbar-other` for non-QuarryLink brands; leave empty for QuarryLink.
- `buttonColorClass`: Use `btn-orther` for non-QuarryLink brands; leave empty for QuarryLink.
- `quarrylinkFooterClass` and `otherFooterClass`:
  - QuarryLink brand: set `otherFooterClass` to `hidden-footer`; leave `quarrylinkFooterClass` unchanged to show the QuarryLink footer.
  - Other brands: set `quarrylinkFooterClass` to `hidden-footer`; leave `otherFooterClass` unchanged to show the tenant footer.
