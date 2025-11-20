# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Major Changes

#### Refactored Gateway Section to Payment Method Section
- **Renamed "Gateway" to "Payment Method"** throughout the application
- Updated navigation menu, breadcrumbs, and page titles to use consistent "Payment methods" naming
- Migrated from modal-based editing to dedicated full-screen detail page (`PaymentMethodDetail.vue`)

#### New Payment Method Detail Page
- Created `PaymentMethodDetail.vue` - comprehensive full-screen page for creating/editing payment methods
- Implemented three main sections:
  - **Payment Method**: Title, Icon, Description, Sort Order, Enabled status
  - **Payment Fee Settings**: Fee amount, Min/Max order amounts, Refund fee, Customer types, Tax settings
  - **Gateway Settings**: Gateway title, Language, Payment Action, Countries, Technical gateway details
- Dynamic page title that includes payment method name (e.g., "Edit payment method - Bankový prevod")
- Title truncation with ellipsis for long names
- Role-based access control: Gateway settings readable by all, editable only by admin/dev
- Gateway settings accordion collapsed by default

#### Icon Upload Component
- Created `IconUpload.vue` component with enhanced functionality:
  - Displays current uploaded icon with preview
  - Shows file name next to the icon
  - Action buttons: Edit, Upload new, Delete
  - Supports SVG file uploads with validation
  - Handles both file paths and data URLs

#### Country Filtering and Badges
- Added country filter dropdown in payment methods list (admin/dev only, global view)
- Country filter shows flags and country names
- Added country flag badges next to "Enabled" status in payment method cards
- Badges display flag emoji + country code abbreviation (e.g., 🇮🇹 ITA, 🇸🇰 SVK)
- Filtering logic filters payment methods by selected country

#### Payment Methods Seed Data
- Created comprehensive seed data (`paymentMethods.seed.js`) for:
  - **Italy**: Carte di credito/Apple Pay/Google Pay, Satispay, Klarna, PayPal, Pagamento alla consegna
  - **Slovakia**: Online platba kartou, Dobierka, Platba v lekárni, Sporopay, VÚB ePlatby, Benefit Plus, Bankový prevod
  - **Czechia**: V lékarně, Kartou online, Dobírka, Pluxee, Benefit Plus, Edenred variants
  - **Romania**: Plata in farmacie, Plata la livrare, Edenred variants, Plata con cardul
  - **Poland**: Szybki przelew online P24, Blik/Karty/Apple Pay/Google Pay, Płatność przy odbiorze
- Each payment method includes: title, description, icon, fee settings, gateway configuration
- Assigned appropriate icons to all payment methods

#### Currency Utility
- Created `currencies.js` utility for country-to-currency mapping
- Supports: EUR (IT, SK, AT, DE), CZK (CZ), RON (RO), PLN (PL), GBP (GB), HUF (HU), USD (US)

### Features

#### Payment Fee Settings
- Enable/disable payment fee per method
- Fee amount with currency (auto-set based on country)
- Min Order Amount and Max Order Amount fields
- Refund fee checkbox
- Apply payment fee for specific customer types (logged in, not logged in, wholesale)
- Tax settings: Calculate tax, Fee already contains tax
- Fields shown directly when fee is enabled (no nested accordions)

#### Gateway Settings
- Gateway Title field (defaults to payment method title, can be overridden)
- Gateway language selection
- Payment Action (Authorize & Capture, Authorize only)
- Payment From Applicable Countries (using `v-combobox` with `small-chips`)
- Technical gateway details (MID, Gateway URL, etc.)
- Single accordion structure (not nested)
- Read-only for regular users, editable for admin/dev

#### Form Improvements
- Replaced `v-autocomplete` with `v-combobox` for multi-select country fields
- Added `small-chips` prop to all combobox/select components for 24px chip height
- Removed `min-height` constraints from form fields to allow natural component heights
- Consistent padding and spacing using design tokens

### UI/UX Improvements

#### Navigation and Routing
- Removed standalone "Payment fee" page from left menu
- Updated routes: `/payments/methods` (create), `/payments/methods/:code` (edit)
- Cancel button always returns to payment methods overview
- Tenant switching while editing redirects to overview with confirmation

#### Visual Consistency
- Standardized padding and background colors across pages
- White background for section cards with subtle shadows
- Consistent accordion styling (different styles for payment fee vs gateway settings)
- Breadcrumbs and page titles derive from same source (centralized labels)

#### Page Header Component
- Made title prop optional
- Title automatically derives from last breadcrumb item
- Added truncation styling for long titles

### Technical Changes

#### Store Updates
- Added `STORAGE_VERSION` constant for schema migration
- Incremented `SEED_VERSION` to 2.2 to force reload after icon path changes
- Version check in `hydrate()` clears localStorage if version mismatch
- Added `paymentMethodDetail` to dirty state tracking

#### Component Updates
- `ModalCard.vue`: Updated background color, added box shadow, increased padding
- `GatewayCard.vue`: Added country flag badge display
- `GatewaysList.vue`: Added country filtering, updated icon path resolution
- `PageHeader.vue`: Centralized title logic from breadcrumbs

#### Styling
- Removed `min-height: 56px` rules from `form-fields.scss`
- Updated chip heights to 24px using `small-chips` prop
- Added truncation styles for breadcrumbs and page titles

### Assets

#### New Icons Added
- `banktransfer.svg` / `banktransfer-disabled.svg`
- `benefitplus.svg` / `benefitplus-disabled.svg`
- `cardonline.svg` / `cardonline-disabled.svg`
- `cashondelivery.svg` / `cashondelivery-disabled.svg`
- `edenred.svg` / `edenred-disabled.svg`
- `klarna-disabled.svg`
- `muzapay.svg` / `muzapay-disabled.svg`
- `paypal-disabled.svg`
- `pluxee.svg` / `pluxee-disabled.svg`
- `przelewy-disabled.svg`
- `satispay.svg` / `satispay-disabled.svg`
- `sporopay-disabled.svg`
- `vub.svg` / `vub-disabled.svg`
- `zeropayment.svg` / `zeropayment-disabled.svg`

#### Icons Removed
- `stripe.svg` (replaced)
- `ZeroSubtotalCheckout.svg` (renamed to `zeropayment.svg`)

### Bug Fixes
- Fixed icon path resolution for payment methods
- Fixed localStorage caching preventing new seed data from loading
- Fixed cancel button navigation blocking
- Fixed form field height issues with chips
- Fixed tenant switching not redirecting during edit

### Files Changed
- **New Files**: 
  - `src/components/common/IconUpload.vue`
  - `src/mock/paymentMethods.seed.js`
  - `src/utils/currencies.js`
  - `src/views/payments/PaymentMethodDetail.vue`
  - `CHANGELOG.md`
- **Modified Files**:
  - `src/App.vue`
  - `src/components/common/ModalCard.vue`
  - `src/components/common/PageHeader.vue`
  - `src/components/payments/GatewayCard.vue`
  - `src/mock/payments.mock.js`
  - `src/router/index.js`
  - `src/store/paymentsStore.js`
  - `src/styles/form-fields.scss`
  - `src/views/payments/GatewayDetail.vue`
  - `src/views/payments/GatewaysList.vue`
  - `src/views/payments/PaymentFee.vue`
  - `src/views/payments/PaymentRestrictions.vue`

