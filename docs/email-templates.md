# Email Templates

Each section includes the HTML title, links to both formats, and the TXT content for review.

## account_activation.html

Title: Activate Your QuarryLink Account

HTML: [account_activation.html](../public/email-templates/account_activation.html)

TXT: [account_activation.txt](../public/txt-email-templates/account_activation.txt)

TXT Content:

```txt
Hi {userName},

Welcome to QuarryLink!

An account has been created for you by {superAdminName} at {tenantName}.

To activate your account and log in, use the link below to set your password:

Activate Account & Set Password: {activationUrl}

Once you've set your password, you'll have access to QuarryLink.

If you have any questions or need help getting started, please reach out to your account administrator or contact our support team.

We're excited to have you on board!

You're receiving this email because an account was created for you on QuarryLink.
```

## account_deactivated.html

Title: Your QuarryLink account has been deactivated

HTML: [account_deactivated.html](../public/email-templates/account_deactivated.html)

TXT: [account_deactivated.txt](../public/txt-email-templates/account_deactivated.txt)

TXT Content:

```txt
Hi {userName},

Your QuarryLink account has been deactivated by {superAdminName} at {tenantName}.

You no longer have access to log in to QuarryLink.

If you believe this was done in error or have any questions about your account status, please contact your account administrator:

{superAdminName}
{superAdminEmail}

You're receiving this because your QuarryLink account has been deactivated.
```

## account_manager_bulk_reassignment.html

Title: Customers reassigned to you in QuarryLink

HTML: [account_manager_bulk_reassignment.html](../public/email-templates/account_manager_bulk_reassignment.html)

TXT: [account_manager_bulk_reassignment.txt](../public/txt-email-templates/account_manager_bulk_reassignment.txt)

TXT Content:

```txt
Hi {accountManagerName},

{previousAccountManagerName} has been removed from QuarryLink, and their customers have been reassigned to you.

You are now the Account Manager for the following customers:

{customerListHtml}

Each customer link will take you to their profile where you can review their account history, active quotes, and account details.

You're receiving this because customers have been reassigned to you in QuarryLink.
```

## account_manager_ownership_change.html

Title: Customer reassigned to you: {customerName}

HTML: [account_manager_ownership_change.html](../public/email-templates/account_manager_ownership_change.html)

TXT: [account_manager_ownership_change.txt](../public/txt-email-templates/account_manager_ownership_change.txt)

TXT Content:

```txt
Hi {accountManagerName},

{customerName} has been reassigned to you as their Account Manager in QuarryLink.

Customer: {customerName}

View Customer Profile: {customerProfileUrl}

This customer has existing history in the system, so you may want to review their account to get up to speed.

You're receiving this because you've been assigned as the Account Manager for this customer in QuarryLink.
```

## new_customer_created.html

Title: New customer assigned to you: {customerName}

HTML: [new_customer_created.html](../public/email-templates/new_customer_created.html)

TXT: [new_customer_created.txt](../public/txt-email-templates/new_customer_created.txt)

TXT Content:

```txt
Hi {accountManagerName},

You've been assigned as the Account Manager for a new customer in QuarryLink.

Customer: {customerName}

View Customer Profile: {customerProfileUrl}

If you have any questions about this customer or need to update their details, you can access everything through their profile.

You're receiving this because you've been assigned as the Account Manager for this customer in QuarryLink.
```

## password_reset.html

Title: Password Reset Request - QuarryLink Account

HTML: [password_reset.html](../public/email-templates/password_reset.html)

TXT: [password_reset.txt](../public/txt-email-templates/password_reset.txt)

TXT Content:

```txt
Hi {userName},

We received a request to reset your password for QuarryLink.

Reset Password: {resetPasswordUrl}

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.

For security reasons, this link will expire in 24 hours.

If you continue to have trouble accessing your account, please contact your account administrator or our support team.

You're receiving this because a password reset was requested for your QuarryLink account.
```

## quote-approved-acc-mgr-email-template.html

Title: Quote #{quoteNumber} approved by customer

HTML: [quote-approved-acc-mgr-email-template.html](../public/email-templates/quote-approved-acc-mgr-email-template.html)

TXT: [quote-approved-acc-mgr-email-template.txt](../public/txt-email-templates/quote-approved-acc-mgr-email-template.txt)

TXT Content:

```txt
Hi {accountManagerName},

Good news! A quote has been approved and is ready for next steps.

Quote Number: {quoteNumber}
Customer: {customerName}
Project: {projectName}
Quote Type: {quoteType}
Total Value: ${totalValue} ex GST
Approved By: {customerContactFirstName}
Approval Date: {approvalDate}

The customer has been notified that you'll be in contact to arrange next steps and confirm delivery details.

View Quote Details: {quoteUrl}

You're receiving this because you are the Account Manager for this quote in QuarryLink.
```

## quote-approved-customer-email-template.html

Title: Quote #{quoteNumber} approved

HTML: [quote-approved-customer-email-template.html](../public/email-templates/quote-approved-customer-email-template.html)

TXT: [quote-approved-customer-email-template.txt](../public/txt-email-templates/quote-approved-customer-email-template.txt)

TXT Content:

```txt
Hi {customerContactFirstName},

Your quote has been approved.

Quote Number: {quoteNumber}
Project: {projectName}
Quote Type: {quoteType}
Total Value: ${totalValue} ex GST
Expiry Date: {expiryDate}

Your Account Manager will be in contact shortly to arrange next steps.

If you have any questions in the meantime, please contact:

{accountManagerName}
{accountManagerEmail}

You're receiving this because your quote from {BusinessName} has been approved via QuarryLink.
```

## quote-declined-acc-mgr-email-template.html

Title: Quote #{quoteNumber} declined by customer

HTML: [quote-declined-acc-mgr-email-template.html](../public/email-templates/quote-declined-acc-mgr-email-template.html)

TXT: [quote-declined-acc-mgr-email-template.txt](../public/txt-email-templates/quote-declined-acc-mgr-email-template.txt)

TXT Content:

```txt
Hi {accountManagerName},

A quote has been declined by the customer.

Quote Number: {quoteNumber}
Customer: {customerName}
Project: {projectName}
Quote Type: {quoteType}
Total Value: ${totalValue} ex GST
Declined By: {customerContactFirstName}
Decline Date: {declineDate}
Decline Reason: Customer declined this quote due to {declineReason}. Note: {declineNote}

You may want to reach out to discuss alternative options or revisions to the quote.

View Quote Details: {quoteUrl}

You're receiving this because you are the Account Manager for this quote in QuarryLink.
```

## quote-declined-customer-email-template.html

Title: Quote #{quoteNumber} declined

HTML: [quote-declined-customer-email-template.html](../public/email-templates/quote-declined-customer-email-template.html)

TXT: [quote-declined-customer-email-template.txt](../public/txt-email-templates/quote-declined-customer-email-template.txt)

TXT Content:

```txt
Hi {customerContactFirstName},

Thank you for reviewing your quote. We've recorded your decision to decline this quote.

Quote Number: {quoteNumber}
Project: {projectName}
Quote Type: {quoteType}
Total Value: ${totalValue} ex GST

If you'd like to discuss alternative options, revisions to this quote, or have any questions, please contact your Account Manager:

{accountManagerName}
{accountManagerEmail}

We're here to help find a solution that works for your project.

You're receiving this because you declined a quote from {BusinessName} via QuarryLink.
```

## quote_expired.html

Title: Quote #{quoteNumber} has expired

HTML: [quote_expired.html](../public/email-templates/quote_expired.html)

TXT: [quote_expired.txt](../public/txt-email-templates/quote_expired.txt)

TXT Content:

```txt
Hi {customerContactFirstName},

Your quote has expired and is no longer valid.

Quote Number: {quoteNumber}
Project: {projectName}
Quote Type: {quoteType}
Previous Total Value: ${totalValue} ex GST
Expired On: {expiryDate}

The rates and terms in this quote are no longer guaranteed.

If you would still like to proceed with this project, please contact your Account Manager to request a new quote with current pricing:

{accountManagerName}
{accountManagerEmail}

We're happy to provide a revised quote that meets your project needs.

You're receiving this because your quote from {tenantBussinessName} via QuarryLink has expired.
```

## quote_expiry_extension.html

Title: Quote #{quoteNumber} expiry extended

HTML: [quote_expiry_extension.html](../public/email-templates/quote_expiry_extension.html)

TXT: [quote_expiry_extension.txt](../public/txt-email-templates/quote_expiry_extension.txt)

TXT Content:

```txt
Hi {customerContactFirstName},

Good news! We've extended the expiry date on your quote to give you more time to review.

New expiry date: {newExpiryDate}

Quote Number: {quoteNumber}
Project: {projectName}
Quote Type: {quoteType}
Total Value: ${totalValue} ex GST
Previous Expiry: {previousExpiryDate}
New Expiry: {newExpiryDate}

Review & Approve Quote: {quoteUrl}

Please respond before the new expiry date to secure these rates and terms.

If you have any questions, please contact your Account Manager:

{accountManagerName}
{accountManagerEmail}

You're receiving this because the expiry date for your quote from {BusinessName} has been extended.
```

## quote_expiry_warning.html

Title: Quote #{quoteNumber} expiring soon

HTML: [quote_expiry_warning.html](../public/email-templates/quote_expiry_warning.html)

TXT: [quote_expiry_warning.txt](../public/txt-email-templates/quote_expiry_warning.txt)

TXT Content:

```txt
Hi {customerContactFirstName},

This is a reminder that your quote will expire soon.

This quote expires in 7 days on {expiryDate}

Quote Number: {quoteNumber}
Project: {projectName}
Quote Type: {quoteType}
Total Value: ${totalValue} ex GST
Expiry Date: {expiryDate}

Review & Approve Quote: {quoteUrl}

After the expiry date, this quote will no longer be valid and pricing may change.

If you need more time or have any questions, please contact your Account Manager:

{accountManagerName}
{accountManagerEmail}

You're receiving this because you have a pending quote from {BusinessName} via QuarryLink.
```

## quote_revision_sent.html

Title: Updated Quote #{quoteNumber} - {projectName}

HTML: [quote_revision_sent.html](../public/email-templates/quote_revision_sent.html)

TXT: [quote_revision_sent.txt](../public/txt-email-templates/quote_revision_sent.txt)

TXT Content:

```txt
Hi {customerContactFirstName},

Your updated quote is ready to review and approve.

Quote Number: {quoteNumber}
Project: {projectName}
Quote Type: {quoteType}
Total Value: ${totalValue} ex GST
Expiry Date: {expiryDate}

Review Updated Quote: {quoteUrl}

Please review and respond before the expiry date to secure these updated rates and terms.

If you have any questions or need further changes to this quote, please contact your Account Manager:

{accountManagerName}
{accountManagerEmail}

You're receiving this because a revised quote has been sent to you from {BusinessName} via QuarryLink.
```

## quote_sent_to_customer-email-template.html

Title: Your Quote is Ready - Quote #{quoteNumber} - {projectName}

HTML: [quote_sent_to_customer-email-template.html](../public/email-templates/quote_sent_to_customer-email-template.html)

TXT: Missing (quote_sent_to_customer-email-template.txt)

TXT Content:

```txt
(Missing TXT template)
```

## subscription_quarry_added.html

Title: Your QuarryLink subscription has been updated

HTML: [subscription_quarry_added.html](../public/email-templates/subscription_quarry_added.html)

TXT: [subscription_quarry_added.txt](../public/txt-email-templates/subscription_quarry_added.txt)

TXT Content:

```txt
Hi {tenantPrimaryContactName},

Your QuarryLink subscription has been updated.

{userName} has added a new quarry to your account, which has increased your monthly subscription by $250 ex-GST.

Quarry added: {quarryName}
Your new monthly subscription total is: ${newTotal} ex-GST

This change will be reflected in your next billing cycle. You can view your full subscription details anytime by visiting your account settings.

View Subscription Details: {subscriptionUrl}

If you have any questions about this change or your billing, please don't hesitate to reach out to our support team.

You're receiving this as the main contact for your QuarryLink account.
```

## subscription_quarry_removed.html

Title: Your QuarryLink subscription has been updated

HTML: [subscription_quarry_removed.html](../public/email-templates/subscription_quarry_removed.html)

TXT: [subscription_quarry_removed.txt](../public/txt-email-templates/subscription_quarry_removed.txt)

TXT Content:

```txt
Hi {tenantPrimaryContactName},

Your QuarryLink subscription has been updated.

{userName} has removed a quarry from your account, which has decreased your monthly subscription by $250.

Quarry removed: {quarryName}
Your new monthly subscription total is: ${newTotal}

This change will be reflected in your next billing cycle on {nextBillingDate}. You can view your full subscription details anytime by visiting your account settings.

View Subscription Details: {subscriptionUrl}

If you have any questions about this change or your billing, please don't hesitate to reach out to our support team.

You're receiving this as the main contact for your QuarryLink account.
```

