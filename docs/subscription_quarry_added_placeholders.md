# Subscription quarry email template replacements

Templates:

- `public/email-templates/subscription_quarry_added.html`
- `public/email-templates/subscription_quarry_removed.html`

Replace every curly-brace placeholder with real values before sending.

## Common text/URL placeholders

- `BusinessName`: Company name shown in navbar and footer copyright.
- `tenantPrimaryContactName`: Tenant Primary Contact Name (from cognito/strip).
- `userName`: User who added/removed the quarry.
- `quarryName`: Name of the quarry added/removed.
- `newTotal`: New monthly subscription total (template adds `$`; the “added” template also appends `ex-GST`).
- `subscriptionUrl`: Link for the “View Subscription Details” button (quarry management page).
- `TenantEmail`, `TenantPhone`, `TenantAddressLine1`, `TenantAddressLine2`, `TenantWebsite`: Footer contact details for non-QuarryLink tenants.

- `logoBlock`: HTML markup for the logo. For example:

  - logoBlock = `<img src="${data.tenantLogoUrl}" alt="${data.businessName} Logo" class="navbar-logo" />`;

  or

  - logoBlock = `<div class="navbar-initials">${initials}</div>`;

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
