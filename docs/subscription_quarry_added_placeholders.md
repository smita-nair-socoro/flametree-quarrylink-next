# Subscription quarry email template replacements

Templates:

- `public/email-templates/subscription_quarry_added.html`
- `public/email-templates/subscription_quarry_removed.html`

Replace every curly-brace placeholder with real values before sending.

## Common text/URL placeholders

- `logoUrl`: URL for the logo image in the navbar.
- `logoImageClass`: Class to control logo image visibility. Use `hidden-logo` if no logo URL is provided; leave empty otherwise.
- `logoInitials`: Two-letter business initials (e.g., "OQ" for "One Quarry"). Displayed when no logo URL is provided.
- `logoInitialClass`: Class to control logo initials visibility. Use `hidden-logo` if a logo URL is provided; leave empty otherwise.
- `BusinessName`: Company name shown in navbar and footer copyright.
- `tenantPrimaryContactName`: Tenant Primary Contact Name (from cognito/strip).
- `userName`: User who added/removed the quarry.
- `quarryName`: Name of the quarry added/removed.
- `newTotal`: New monthly subscription total (template adds `$`; the "added" template also appends `ex-GST`).
- `subscriptionUrl`: Link for the "View Subscription Details" button (quarry management page).
- `TenantEmail`, `TenantPhone`, `TenantAddress`, `TenantWebsite`: Footer contact details for non-QuarryLink tenants.

## Template-specific placeholders

- `subscription_quarry_removed.html`:
  - `nextBillingDate`: Date string for when the change appears on the invoice.

## Style/class placeholders (branding rules)

- `navbarColorClass`: Use `navbar-other` for non-QuarryLink brands; leave empty for QuarryLink.
- `BorderColorClass`: Use `border-other` for non-QuarryLink brands; leave empty for QuarryLink.
- `buttonColorClass`: Use `btn-orther` for non-QuarryLink brands; leave empty for QuarryLink.
- `quarrylinkFooterClass` and `otherFooterClass`:
  - QuarryLink brand: set `otherFooterClass` to `hidden-footer`; leave `quarrylinkFooterClass` unchanged to show the QuarryLink footer.
  - Other brands: set `quarrylinkFooterClass` to `hidden-footer`; leave `otherFooterClass` unchanged to show the tenant footer.
