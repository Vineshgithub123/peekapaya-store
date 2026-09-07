# Peekapaya Hydrogen migration handoff

Last updated: 2026-09-07

This file is the primary handoff for continuing the migration in a new Codex session or under another Codex login. It contains no credentials. Keep it updated after every completed migration slice.

## Copy this into the new Codex session

> Continue the Peekapaya Liquid-to-Hydrogen migration in `C:\My Proj\Netset-shop`. First read `hydrogen-storefront/CONTINUATION_HANDOFF.md`, `hydrogen-storefront/AGENTS.md`, `hydrogen-storefront/MIGRATION_PLAN.md`, and `hydrogen-storefront/MIGRATION_CHECKLIST.md`. Treat the Liquid theme at the repository root as read-only source material. Resume from **Exact next work** in the handoff, use the Shopify AI Toolkit before and after Hydrogen/API changes, update the handoff, plan, and checklist, and run lint, typecheck, build, and affected route/workflow checks before completing a slice.

## Goal and product decisions

Migrate the existing Peekapaya Shopify Liquid storefront into a well-structured React storefront using Shopify Hydrogen and deploy it to Oxygen after local acceptance.

Shopify remains the commerce back end. The merchant must continue managing these areas in Shopify Admin:

- Products, descriptions, images, prices, variants, and inventory
- Collections and publication to the Headless sales channel
- Orders, customers, payments, shipping, taxes, and discounts

The React/Hydrogen application owns page markup, layout, styles, interaction design, accessibility, and supported headless app integrations. Checkout remains Shopify-hosted.

The user will perform the final visual and workflow testing. Do not create the standalone repository, deploy, switch the domain, or modify the live store unless the user explicitly asks at that stage.

## Repository layout and source of truth

- Repository root: `C:\My Proj\Netset-shop`
- Existing Liquid theme: repository root
- Migrated application: `C:\My Proj\Netset-shop\hydrogen-storefront`
- The migrated application is now an independent Git repository on `main` with remote `https://github.com/Vineshgithub123/peekapaya-store.git`.
- Initial repository commit `e1b8385` is present on `origin/main`; 136 required source, configuration, documentation, and asset files are tracked.
- Migration plan: `hydrogen-storefront/MIGRATION_PLAN.md`
- Detailed checklist: `hydrogen-storefront/MIGRATION_CHECKLIST.md`
- Hydrogen instructions: `hydrogen-storefront/AGENTS.md`

Do not edit the Liquid theme. Use it to reproduce the active storefront in Hydrogen. When references disagree, follow this order:

1. Active template JSON and section-group JSON
2. Liquid snippets, sections, CSS, and JavaScript used by those templates
3. `config/settings_data.json` and schema defaults
4. Original local assets and referenced Shopify CDN assets
5. The public site only when it represents the same active theme

`https://peekapaya.com/` has redirected to a password page during this migration, so the local theme is the dependable visual reference.

## Code quality requirements from the user

- Keep the React application properly structured with meaningful folder, file, function, component, and type names.
- Continue using `assets`, `components`, `constants`, `pages`, `routes`, `services`, `types`, and related focused folders.
- Keep route modules focused on loaders, actions, metadata, and composition.
- Prefer small reusable components and minimal, readable code.
- Preserve the Liquid storefront's visual design instead of substituting generic Hydrogen styles.
- Use semantic HTML, keyboard support, visible focus states, labels, status announcements, responsive images, and reduced-motion behavior.
- Keep color and spacing values in shared assets/tokens where practical.

## Current environment

- Hydrogen 2026.4 with React Router 7 and TypeScript is installed.
- The app is linked to the real `Peekapaya-store` Hydrogen storefront and its Production environment variables have been pulled into the ignored local `.env`.
- Shopify CLI authentication is complete for the Peekapaya shop at `0euczz-c8.myshopify.com`.
- Storefront API and Customer Account API credentials are present. Never print or commit `.env`.
- Shopify did not provide `PUBLIC_CHECKOUT_DOMAIN`; the live cart still returns the correct `peekapaya.com` checkout URL.
- Customer Account development callbacks require `npm run dev -- --customer-account-push`, which creates a temporary secure `tryhydrogen.dev` tunnel and registers it with Shopify.
- Exact `quantityAvailable` and product inventory counts are denied because the storefront lacks `unauthenticated_read_product_inventory`. Current UI and cart enforcement use `availableForSale`, which is working.
- A stale Mock Shop server on port 3010 caused the profile fallback and `demostore.hydrogen.mock.shop/checkout-unavailable` page. That server was stopped. `validateShopifyEnvironment` now prevents the app from silently starting with Mock Shop or without the required Storefront and Customer Account variables.
- The parent Liquid-theme repository excludes `hydrogen-storefront/` through its local `.gitignore`; `.gitignore` and `.shopifyignore` remain untracked in the parent and should be committed there when appropriate.
- Shopify CLI may emit non-failing warnings for deprecated `envFile`, React Router v8 future flags, and the Hydrogen bundle analyzer.

## Shopify tooling requirement

`hydrogen-storefront/AGENTS.md` requires the Shopify AI Toolkit for all Hydrogen and Shopify API work.

For every Hydrogen/API slice:

1. Search Shopify documentation before editing.
2. Implement the change.
3. Validate each changed Hydrogen component or query with the toolkit.
4. If validation fails, fix and retry with the same artifact ID and an incremented revision, up to three attempts.
5. Run project code generation and checks.

The installed Hydrogen skill was located at:

`C:\Users\vines\.codex\plugins\cache\openai-curated\shopify\11c74d6b\skills\shopify-hydrogen\SKILL.md`

The versioned cache path may change. Find the current `shopify-hydrogen/SKILL.md` if this path no longer exists.

## Completed locally

### Foundation and application structure

- Official TypeScript Hydrogen scaffold
- Girls/Boys audience routes, with `/` redirecting to `/pages/girls`
- Peekapaya logo, favicon, Satoshi fonts, design tokens, hero assets, and shipping banners
- Storefront routes for products, collections, cart, search, content, policies, discounts, gift cards, and accounts
- Shared skip link, focus styling, responsive behavior, and drawer foundation

### Header and predictive search

- Responsive desktop/mobile header based on the Liquid dimensions and spacing
- Girls/Boys active audience state
- Nested desktop menus with collection imagery
- Mobile horizontal audience navigation
- Keyboard, Escape, and focus behavior
- Responsive predictive-search modal, grouped results, loading/empty states, and encoded view-all links

Real Shopify menu hierarchy and desktop overflow still need connected-store testing.

### Landing pages, product cards, collections, and catalog

- Girls and Boys landing sections, original responsive imagery, shipping strip, collection/product grids, and Shop All placement
- Product cards with portrait images, hover image, subtle zoom, carousel controls, swipe handling, sale/sold-out states, compare pricing, missing-image handling, and long-content handling
- Accessible quick add for simple products and an option dialog for multi-variant products
- Size, color, other option selection, unavailable combinations, and Shopify quantity-rule normalization
- Girls, Boys, Korean, default collection, catalog, and all-collections layouts
- Shopify filters, active chips, price controls, sorting, density control, mobile filter dialog, URL persistence, pagination, and empty states
- `custom.audience` handling for girl/girls, boy/boys, and both/unisex

Exact data order, filtering, banners, counts, and audience values need connected-store verification.

### Product detail page core

- Responsive two-column media grid
- Mobile carousel, dots, swipe, and zoom dialog
- Title, vendor, price/sale state, tax note, description, variant selection, unavailable state, quantity rules, and add to cart
- Sticky desktop product information and mobile purchase controls
- Shopify Shop Pay accelerated checkout for eligible products, with a primary-domain fallback before real environment variables are present
- Accessible gift-card recipient email, optional name/message, and scheduled-delivery controls that preserve Shopify cart-line attributes
- Shopify `shopify.disclosure` metaobject content rendered as accessible disclosure accordions
- Eight related products with responsive display

The active `templates/product.json` configuration disables reviews, installments, and pickup availability, and contains no SKU, inventory, generic custom-property, or recently-viewed block. Those elements were intentionally not added. Growave review and wishlist content requires its supported headless API and credentials. Gift-card submission, disclosure content, and Shop Pay eligibility need connected-store verification because Mock Shop has no matching gift-card/disclosure fixture.

### Customer accounts

- Shopify Customer Account API authorization, callback, logout, and protected-route structure
- Account overview, profile editing, address creation/update/delete/default handling
- Searchable, paginated orders and order details
- Accessible success, error, empty, loading, validation, invalid-order, and missing-order states
- When Customer Account API configuration is absent, `/account` displays a styled temporary-unavailable page; direct account child/login/authorization routes redirect there instead of returning the previous 400 page

The UI and API operations are implemented. Authentication becomes operational after the real storefront supplies `PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID`, `PUBLIC_CUSTOMER_ACCOUNT_API_URL`, and approved callback URLs.

### Cart and checkout handoff

- Right-side responsive cart drawer with overlay, focus trap, item count, loading, empty, scrollable-items, and fixed-summary states
- Full cart page with two-column desktop and single-column mobile layouts
- Variant details, public line properties, child lines, prices, availability, quantity rules, update/remove controls, and mutation feedback
- Discount code and gift-card response handling
- Persistent order note
- Subtotal, estimated total, tax/shipping note, and Shopify-hosted checkout link
- Six Shopify-managed cart recommendations using shared cards and quick add
- Product-page and card quick-add analytics payloads

Mock Shop checks passed for add, session persistence, quantity 1-to-2 update, saved note, invalid-discount feedback, checkout URL creation, removal, and the restored empty state.

Recent cart files include:

- `app/components/CartMain.tsx`
- `app/components/CartLineItem.tsx`
- `app/components/CartSummary.tsx`
- `app/components/CartRecommendations.tsx`
- `app/components/PageLayout.tsx`
- `app/components/ProductQuickAdd.tsx`
- `app/routes/cart.tsx`
- `app/lib/fragments.ts`
- `app/assets/styles/storefront.css`

## Exact next work

Finish interactive acceptance of the real Shopify checkout and Customer Account workflows before doing more page or visual work.

Recommended implementation order:

1. In the opened Shopify checkout, confirm the product, price, shipping/tax behavior, and existing Razorpay payment method. Do not submit a paid order unless the merchant intentionally wants a test order.
2. In the opened secure Customer Account page, complete login and verify the authorization callback returns to Hydrogen.
3. Test profile, addresses, orders, order detail, and logout with a real customer account.
4. Supply a valid test discount code and verify its accepted state in the Hydrogen cart and Shopify checkout.
5. Decide whether exact inventory quantities must be displayed. If so, enable `unauthenticated_read_product_inventory` for the Hydrogen storefront and rerun codegen/API validation; availability and cart enforcement already work without it.
6. Record every live-data/API defect, fix workflow defects first, and rerun Shopify validation, lint, typecheck, build, and affected workflows.

Gift-card recipient and Shop Pay live verification are outside the required migration scope. Resume FAQ, Contact, remaining content pages, footer, and visual polish only after the commerce workflow acceptance checks pass.

After the product-detail slice, proceed in this order:

1. About Us from `peekapaya-about-us.liquid`
2. FAQ from `peekapaya-faq-page.liquid`
3. Contact UI from `peekapaya-contact-page.liquid`; keep delivery pending until an endpoint and abuse protection are selected
4. Complete the search results page, pagination, and empty-query recommendations
5. Blog, article, policy, gift-card, all-collections, and 404 styling
6. Footer, newsletter UI/states, policies, social links, copyright, and WhatsApp
7. Global responsive/accessibility/SEO/performance polish
8. Connect Shopify, verify all live data and integrations, create an Oxygen preview, and perform release review

## Work that requires the real Shopify connection

Do not mark these complete using Mock Shop alone:

- Exact `main-menu` and footer menu data
- Real product order, images, prices, inventory, collection filters, and `custom.audience` values
- A valid discount and an inventory-rejection workflow
- Completed navigation into the store's hosted checkout
- Customer login, profile, address, order, and logout workflow
- Customer Account API callback URLs and hosted login branding
- Pickup availability tied to real locations
- App integrations and credentials
- Oxygen preview and production-domain checks

When the user is ready to connect Shopify, run from `hydrogen-storefront/`:

```bash
npx shopify hydrogen link
npx shopify hydrogen env pull
```

The merchant must create/select a storefront in the Shopify Headless sales channel, publish the required products and collections to that channel, and configure Customer Account API callback URLs.

## External integration boundaries

Liquid app blocks and theme app embeds do not automatically run in Hydrogen. Confirm a headless API, supported script, or custom integration for each service:

- Wishlist by Square
- Growave reviews, loyalty, and wishlist
- Shopify Inbox
- Newsletter provider
- Contact-form delivery and abuse protection
- Consent/privacy behavior and analytics configuration
- WhatsApp number and link

## Validation commands

Run from `C:\My Proj\Netset-shop\hydrogen-storefront` after each coherent slice:

```bash
npm run codegen
npm run lint
npm run typecheck
npm run build
```

Start the local application with:

```bash
npm run dev
```

Check every affected route and mutation, then stop only the temporary server created for that check. Production build warnings listed under **Current environment** are currently upstream and non-failing.

## State at this handoff

The application is linked to `Peekapaya-store`, and all required Storefront and Customer Account variables except optional `PUBLIC_CHECKOUT_DOMAIN` were pulled successfully. A secure development tunnel registered the Customer Account callback and logout origins. Live checks returned 26 products, 9 collections, 130 variants, and 7 unavailable variants; Hydrogen disables an unavailable option correctly. Real cart add, persistence, quantity 1-to-2 update, removal, empty restoration, and checkout URL generation passed. An isolated 999,999-unit cart request was capped to 3 with Shopify's `MERCHANDISE_NOT_ENOUGH_STOCK` warning. A stale Mock Shop process that caused the unavailable account/checkout behavior was stopped, and startup validation now rejects Mock Shop configuration. Lint, TypeScript, and the Oxygen production build pass. The secure Customer Account login and Shopify checkout still require interactive acceptance. Exact quantity fields require the currently missing `unauthenticated_read_product_inventory` scope. No paid order, deployment, or domain change was performed.

Before starting new code, inspect the current filesystem instead of assuming this document is newer than the implementation. Update this file whenever the resume point changes.
