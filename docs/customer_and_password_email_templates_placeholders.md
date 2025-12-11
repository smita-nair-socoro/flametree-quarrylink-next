# New customer & password reset email template replacements

Templates in `public/email-templates/`:
- `new_customer_created.html`
- `password_reset.html`

Replace every `{placeholder}` before sending.

## Common placeholders
- `logoUrl`: URL for the logo image in the navbar.
- `logoImageClass`: Class to control logo image visibility. Use `hidden-logo` if no logo URL is provided; leave empty otherwise.
- `logoInitials`: Two-letter business initials (e.g., "OQ" for "One Quarry"). Displayed when no logo URL is provided.
- `logoInitialClass`: Class to control logo initials visibility. Use `hidden-logo` if a logo URL is provided; leave empty otherwise.
- `BusinessName`: Tenant/company name (navbar title and footer copyright).
- `userName`: Recipient name (used in `password_reset.html`).
- `accountManagerName`: Recipient name (used in `new_customer_created.html`).
- `TenantEmail`, `TenantPhone`, `TenantAddress`, `TenantWebsite`: Footer contact details for non-QuarryLink tenants.

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
