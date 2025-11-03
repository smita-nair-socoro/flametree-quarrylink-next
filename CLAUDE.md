# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm run dev          # Start dev server with Turbopack on http://localhost:3000
npm run build        # Build static export to out/ directory
npm start            # Start production server (after build)
npm run lint         # Run ESLint - treat warnings as blockers
```

### Testing Build Locally
```bash
npm run build && npx serve out
```

## Architecture Overview

### Static Export Configuration
This is a Next.js 15 app configured for **static export** (`output: 'export'` in next.config.ts). The build outputs to the `out/` directory with trailing slashes enabled and image optimization disabled.

### Runtime Configuration
Runtime config is loaded from `public/config.json` at application startup via the `ConfigProvider`. This includes:
- AWS Cognito/Amplify configuration
- API base URL
- Google Maps API key
- Sentry DSN

The config is loaded client-side and stored in the `runtimeConfigStore` (Zustand). **Never hardcode these values** - always use the `useConfig()` hook.

### Route Structure
- `app/(public)/` - Unauthenticated pages (login, callback)
- `app/(protected)/` - Authenticated pages with shared layout
  - `customer-operations/` - Customers, client portal, quotations, jobs
  - `inventory/` - Products, quarries/suppliers, stockpile, weigh-bridge, production
  - `logistics/` - Delivery, drivers, driver app, sign-in
  - `dashboard/` - Main dashboard, drone analytics
  - `system/` - User roles, accounting, camera

### Authentication Flow
1. `ConfigProvider` loads `public/config.json`
2. `AmplifyAuthProvider` configures AWS Amplify with Cognito
3. `AuthProvider` (custom hook) manages auth state
4. `APIClient.HttpClient` attaches tokens to all API requests
5. 403 responses trigger automatic logout via `handleLogout()`

All API calls automatically include:
- `Authorization: Bearer {access_token}`
- `access-token` header
- `id-token` header
- `tenant-id` header

### State Management (Zustand)
Global state lives in `app/stores/`:
- `customer-store.ts`
- `product-store.ts`
- `quotation-store.ts`
- `quarry-supplier-store.ts`
- `supplier-store.ts`
- `line-item-quotation.ts`
- `runtimeConfigStore.ts`

**Pattern**: Each store exports the main store hook plus optimized selector hooks:
```typescript
export const useCustomerStore = create<CustomerStore>()(...);
export const useSelectedCustomer = () => useCustomerStore(state => state.selectedCustomer);
export const useCustomers = () => useCustomerStore(state => state.customers);
```

### API Client Pattern
`lib/api/APIClient.ts` provides a typed HTTP client with automatic:
- Token injection from Amplify auth
- Tenant ID injection
- Error handling with automatic logout on 403
- Request/response logging
- RFC-3986 compliant query string encoding

Add new endpoints to the `APIClient` object:
```typescript
export const APIClient = {
  products: {
    list: () => appClient.Get<ProductDetails[]>('/api/v1/products/all'),
  },
  // Add new resources here
};
```

### Data Fetching (TanStack Query)
Use `@tanstack/react-query` for server state. See `lib/api/quaries.ts` and `lib/api/keys.ts` for query definitions and query key factories.

### Case Conversion
Backend uses `snake_case`, frontend uses `camelCase`. Use utilities in `lib/utils/case-conversion.ts`:
- `convertKeysToCamelCase()` for API responses
- `convertKeysToSnakeCase()` for API requests

### Form Architecture

**Location**: Forms live in `app/(protected)/{domain}/{entity}/(components)/forms/`

**Pattern**:
1. Schema: `schemas/{entity}-form-schema.ts` (Zod)
2. Form Component: `{entity}-form.tsx` (React Hook Form + shadcn/ui)
3. Action Buttons: `{entity}-action-buttons.tsx`
4. Table Integration: Used via `FormDialog` component

**Standard Form Setup**:
```typescript
const form = useForm<z.infer<typeof Schema>>({
  resolver: zodResolver(Schema),
  mode: 'onChange',
  defaultValues: isEditing ? selectedEntity : defaults,
});
```

### Action Hooks Pattern
Located in `hooks/use-{entity}-actions.tsx`. These hooks return:
- `actions` - Functions to trigger UI actions (view, archive, etc.)
- `confirmDialogs` - Rendered confirmation dialogs
- `viewDialog` - Rendered view/edit dialog

Used in table action columns and elsewhere. See `use-customer-actions.tsx` as reference.

### UI Components
- Base components in `components/ui/` (shadcn/ui)
- Composite components in `components/`
- Feature components in route `(components)/` folders
- Always use Tailwind CSS inline classes
- Use `cn()` from `lib/utils` for conditional classes

### Custom UI Components
Key custom components:
- `FormDialog` - Modal wrapper for forms with header actions
- `EnhancedConfirmDialog` - Rich confirmation dialogs with icons
- `DataTableClient` - Client-side table with sorting/filtering
- `AddressAutoComplete` - Google Places address input
- `InputMask` - ABN, Currency, Phone inputs
- `FormTable` - Editable tables within forms

### Type Definitions
Domain types in `lib/types/`:
- `{entity}.d.ts` - Main entity types
- `{entity}-enums.ts` - Enum definitions
- `address.d.ts`, `category.d.ts`, `job.d.ts`, etc.

TypeScript is **mandatory**. Always provide explicit types for props, function returns, and API responses.

## Development Workflow

### Branch Strategy
- Main branch: `develop` (use this for PRs, not `main`)
- Feature branches: `feature/QLINK-XXX-Description`
- Current branch naming enforced by GitHub Actions

### Commit Messages
Use imperative mood with ticket reference:
```
QLINK-XXX Add customer archive functionality
Fix overflow in quotation table
Update product form validation
```

Avoid generic messages like "changed a lot".

### Pull Request Requirements
1. Narrative describing user impact
2. Link to JLINK ticket
3. Screenshots/recordings for UI changes
4. Test plan noting lint/build results
5. Manual test scenarios
6. Keep branch current with `develop`

### Pre-Push Checklist
1. Run `npm run lint` - warnings are blockers
2. Test affected routes in dev server
3. If adding API calls, test with sample data from `lib/tests/`
4. For forms, test create/edit/validation flows

### Code Style
- TypeScript for all source files
- Function components with explicit prop types
- 2-space indentation (enforced by `.editorconfig`)
- No trailing whitespace, final newline required
- PascalCase for components/files that render UI
- camelCase for utilities and hooks (`useThing.ts`)
- ESLint + Prettier via `eslint.config.mjs`

## Key Implementation Patterns

### Adding a New Entity (e.g., "Widget")

1. **Types**: Create `lib/types/widget.d.ts` and `widget-enums.ts`
2. **Store**: Create `app/stores/widget-store.ts` with selector hooks
3. **API**: Add endpoints to `lib/api/APIClient.ts`
4. **Queries**: Add query keys to `lib/api/keys.ts` and queries to `lib/api/quaries.ts`
5. **Form Schema**: Create `schemas/widget-form-schema.ts`
6. **Form**: Create `widget-form.tsx` using React Hook Form
7. **Table**: Create columns and table actions in `(data-tables)/widget/`
8. **Actions Hook**: Create `hooks/use-widget-actions.tsx`
9. **Page**: Create page at `app/(protected)/{section}/widgets/page.tsx`

### Adding a New Table Action

1. Add action to the actions hook (`use-{entity}-actions.tsx`)
2. Add dialog config if needed
3. Update table actions component to use the action
4. Add confirmation dialog with `EnhancedConfirmDialog`

### Adding a New API Endpoint

1. Add method to `APIClient` object in `lib/api/APIClient.ts`
2. Add query key factory to `lib/api/keys.ts`
3. Add TanStack Query hook to `lib/api/quaries.ts`
4. Use in component with `useQuery` or `useMutation`

### Working with Forms

1. Forms use React Hook Form + Zod schemas
2. Address fields use `AddressAutoComplete` component
3. Phone fields use `PhoneInput` component
4. Currency fields use `CurrencyInput` (stores in cents)
5. ABN fields use `ABNInput` with validation
6. Forms in dialogs use `FormDialog` component
7. Form submission should handle loading states

## Testing Strategy

Currently minimal automated testing. When adding features:
- Document manual QA steps in PR
- Use mock data from `lib/tests/*.json` for API response simulation
- Test forms: create, edit, validation errors
- Test tables: sorting, filtering, pagination, actions
- Test dialogs: open, close, confirm, cancel
- Run lint before committing
- Test in dev server before pushing

## Important Notes

- This is a **static export** - no Server Components features that require runtime server
- Always await `getUser()` and `getTenantId()` before API calls
- Backend uses `snake_case`, frontend uses `camelCase` - always convert
- Currency values stored in cents, display in dollars
- All dates use `date-fns` for formatting
- Google Maps requires API key from runtime config
- Authentication tokens expire - 403 triggers automatic logout
- Test data in `lib/tests/` follows actual API response structure
