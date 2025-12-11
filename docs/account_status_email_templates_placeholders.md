# Account activation/deactivation email template replacements

Templates in `public/email-templates/`:
- `account_activation.html`
- `account_deactivated.html`

Replace every `{placeholder}` before sending.

## Common placeholders
- `logoUrl`: URL for the logo image in the navbar.
- `logoImageClass`: Class to control logo image visibility. Use `hidden-logo` if no logo URL is provided; leave empty otherwise.
- `logoInitials`: Two-letter business initials (e.g., "OQ" for "One Quarry"). Displayed when no logo URL is provided.
- `logoInitialClass`: Class to control logo initials visibility. Use `hidden-logo` if a logo URL is provided; leave empty otherwise.
- `BusinessName`: Tenant/company name (navbar title and footer copyright).
- `userName`: Recipient name.
- `superAdminName`: Admin who created/deactivated the account.
- `tenantName`: Tenant name referenced in the body copy.
- `TenantEmail`, `TenantPhone`, `TenantAddress`, `TenantWebsite`: Footer contact details for non-QuarryLink tenants.

## Template-specific placeholders
- `account_activation.html`:
  - `activationUrl`: Link to set password and activate.
  - `buttonColorClass`: Use `btn-orther` for non-QuarryLink brands; leave empty for QuarryLink.
- `account_deactivated.html`:
  - `superAdminEmail`: Contact email for the admin who deactivated the account.
  - `BorderColorClass`: Use `border-other` for non-QuarryLink brands; leave empty for QuarryLink (affects the contact info block).

## Branding/class rules (both templates)
- `navbarColorClass`: Use `navbar-other` for non-QuarryLink brands; leave empty for QuarryLink.
- `quarrylinkFooterClass` and `otherFooterClass`:
  - QuarryLink brand: set `otherFooterClass` to `hidden-footer`; leave `quarrylinkFooterClass` unchanged to show the QuarryLink footer.
  - Other brands: set `quarrylinkFooterClass` to `hidden-footer`; leave `otherFooterClass` unchanged to show the tenant footer.
