# Peekapaya Hydrogen migration plan

Last updated: 7 September 2026

This file is the durable handoff for continuing the Peekapaya Liquid-to-Hydrogen migration in a new Codex session. `MIGRATION_CHECKLIST.md` records individual completion status; this file records the execution order, source-of-truth rules, architecture, validation process, and current stopping point.

## Objective

Build a React storefront with Shopify Hydrogen that visually and functionally matches the existing Peekapaya Liquid storefront. Shopify remains responsible for products, collections, variants, prices, inventory, customers, orders, discounts, payments, shipping, taxes, and checkout. Hydrogen owns the storefront presentation and calls Shopify APIs for commerce data.

## Safety boundary

- The Liquid theme is at the repository root and is the visual and behavioral source of truth.
- The new application is isolated in `hydrogen-storefront/`.
- Do not edit or delete the Liquid theme while migrating.
- The parent `.shopifyignore` excludes the Hydrogen application from theme pushes.
- Do not commit `.env`, tokens, store domains, customer credentials, or Shopify secrets.
- Do not switch the production domain until a connected Oxygen preview has passed workflow testing.
- No migration commit has been created yet; the parent repository currently sees `.shopifyignore` and `hydrogen-storefront/` as new files.

## Source-of-truth order

When a screenshot, memory, and code disagree, use this order:

1. Active template JSON in `templates/` and section-group JSON in `sections/`.
2. Liquid, CSS, JavaScript, and snippets used by those templates.
3. `config/settings_data.json` plus `config/settings_schema.json` defaults.
4. Original local assets in `assets/` and Shopify CDN assets referenced by the templates.
5. The public storefront only when it is accessible and represents the same active theme.

The public site `https://peekapaya.com/` currently redirects to its password page, so local theme files are the dependable reference until access is available.

## Hydrogen application structure

- `app/assets/`: original images, SVG icons, fonts, design tokens, and shared storefront CSS.
- `app/components/`: reusable navigation, cards, drawers, cart, search, and commerce UI.
- `app/constants/`: stable navigation and configuration values.
- `app/fixtures/`: temporary content used while Mock Shop is connected.
- `app/graphql/`: Customer Account API operations.
- `app/lib/`: Storefront API fragments, Hydrogen context, sessions, and shared helpers.
- `app/pages/`: page-level presentation shared by routes.
- `app/routes/`: loaders, actions, metadata, and route composition.
- `app/services/`: page-specific Storefront API data loading and normalization.
- `app/types/`: shared domain types.

Keep route files focused on data loading and mutations. Put reusable markup in `components` or `pages`. Prefer short functions, explicit names, semantic HTML, keyboard behavior, visible focus states, responsive images, and shared design tokens.

## Accelerated execution strategy

- Migrate complete customer workflows in batches: discovery, product selection, cart/checkout, content/account, then final visual polish.
- Include related data queries, responsive behavior, accessibility, and component states in the same batch.
- Run Shopify validation, lint, typecheck, build, and route checks once after each coherent batch instead of after every small CSS adjustment.
- Record visual differences during user testing and fix them together in a dedicated responsive polish pass. Work that requires real products, menus, credentials, or app APIs stays pending until Shopify is connected.

## Current implementation state

The official TypeScript Hydrogen scaffold is installed with Hydrogen 2026.4 and React Router 7. The app runs against Shopify Mock Shop until the real Headless storefront is linked.

Completed foundations include:

- Girls and Boys audience routes with `/` redirecting to `/pages/girls`.
- Exact Peekapaya logo, favicon, header icons, audience hero assets, and shipping banners.
- Theme color tokens and the final Satoshi font override from the Liquid theme.
- Responsive header grid, mobile icon slots, audience navigation, sticky shadow, active states, and basic collection mega menus.
- Girls and Boys landing-page order, hero sizing/crop, shipping strip, section spacing, product grids, collection grids, and Shop All placement.
- Storefront routes for products, collections, cart, search, blogs, policies, discounts, and customer accounts.
- Base skip link, focus styling, drawer behavior, cart analytics, and Shopify checkout handoff from the scaffold.

The detailed checked and unchecked items are in `MIGRATION_CHECKLIST.md`.

## Migration phases

### Phase 1: Header and global navigation

1. Finish submenu underlay, open/close animation, pointer behavior, Escape handling, and accurate `aria-expanded` state.
2. Add desktop overflow handling if the connected `main-menu` contains more links than fit between the logo and action icons.
3. Match the search drawer, predictive results, empty state, loading state, and responsive dimensions.
4. Connect Shopify and verify the exact `main-menu` hierarchy, collection links, audience active states, and collection imagery.

Completion gate: mouse, keyboard, touch, responsive layout, active state, and focus behavior match the theme without clipped navigation.

### Phase 2: Product cards

1. Query the second product image and compare-at price.
2. Add second-image hover, configured subtle zoom, desktop arrows, and mobile swipe behavior.
3. Add sale and sold-out badges plus sale/compare-at price formatting.
4. Add mobile quick add, variant selection, availability states, and the shared quantity design.
5. Add missing-image, long-title, long-price, loading, and sold-out states.
6. Integrate wishlist controls only after the selected Shopify app confirms a supported headless API.

Completion gate: every card state matches both landing and collection templates at mobile, tablet, and desktop widths.

### Phase 3: Collection and listing pages

1. Rebuild the girls, boys, Korean, default, and all-collections templates.
2. Query and apply `custom.audience` values for girl, boy, and both products.
3. Match banners, headings, descriptions, cards, filter controls, sort controls, density controls, pagination, and empty results.
4. Preserve filters and sorting in the URL.

Completion gate: collection counts, product order, filters, sorting, pagination, and audience visibility agree with Shopify.

### Phase 4: Product detail page

1. Rebuild the responsive gallery, thumbnails, carousel, zoom dialog, and mobile swipe behavior.
2. Match title, price states, vendor, SKU, badges, reviews, description, and inventory messaging.
3. Match variant swatches, sizes, unavailable states, quantity, add-to-cart, accelerated checkout eligibility, and sticky mobile purchase controls.
4. Migrate pickup, gift card, custom properties, installment messaging, accordions, recommendations, and recently viewed products where configured.

Completion gate: all product and variant states add the correct merchandise and properties to the Shopify cart.

### Phase 5: Cart and checkout handoff

1. Match the cart drawer surface, animation, overlay, focus trap, empty state, line items, child items, quantity controls, discounts, note, subtotal, and recommendations.
2. Verify cart persistence, analytics, discount codes, inventory errors, and checkout URL behavior.
3. Keep payment and checkout on Shopify-hosted checkout for the current Shopify plan.

Completion gate: a customer can build, edit, recover, discount, and check out a cart without losing line details.

### Phase 6: Content, search, customer account, and footer

1. Rebuild About Us, FAQ, and Contact from their Peekapaya Liquid sections.
2. Finish search results and predictive search.
3. Style blogs, articles, policies, gift card, 404, and all-collections pages.
4. Style customer authorization, account, profile, addresses, orders, and order details.
5. Match footer columns, newsletter, policies, copyright, social icons, and WhatsApp.

Completion gate: all theme routes have a Hydrogen equivalent with useful loading, empty, success, and error states.

### Phase 7: Shopify connection and integrations

1. Create or select the Shopify Headless sales channel storefront.
2. From `hydrogen-storefront`, run `npx shopify hydrogen link` and `npx shopify hydrogen env pull`.
3. Publish required products and collections to the Headless sales channel.
4. Verify `main-menu`, footer menu, `custom.audience`, real prices, variants, inventory, discounts, carts, checkout, and customer account callback URLs.
5. Confirm headless support and credentials separately for Wishlist by Square, Growave, Shopify Inbox, newsletter delivery, contact delivery, analytics/consent, and WhatsApp.

Completion gate: all Shopify-managed data and supported third-party integrations work in an Oxygen preview.

### Phase 8: Release review

1. Complete keyboard, screen-reader, focus, reduced-motion, color contrast, responsive, SEO, structured-data, analytics, and performance reviews.
2. Test common customer workflows on an Oxygen preview.
3. Compare key pages with the Liquid theme at agreed viewport sizes.
4. Create the standalone repository only after the local migration is accepted.
5. Switch the domain only after explicit approval and a rollback path are ready.

## Required validation for every implementation slice

Run from `hydrogen-storefront/`:

```bash
npm run lint
npm run typecheck
npm run build
```

For Hydrogen components or Storefront API changes, follow `AGENTS.md`: search Shopify documentation with the installed Shopify AI Toolkit before implementation, then validate the changed Hydrogen component or query with the toolkit. Retry validation at most three times for the same artifact.

For local route checks, start `npm run dev`, confirm affected routes return 200, inspect both mobile and desktop layouts, and stop only the temporary server started for that check. Mock Shop warnings are expected before linking the real storefront. Current upstream warnings about `envFile`, React Router v8 future flags, and the Hydrogen bundle analyzer do not fail the build.

## Current resume point

Workflow validation against the real Shopify store is now the highest priority. Pause FAQ, Contact, remaining content-page styling, footer polish, and final visual work until the real storefront connection is complete. The required acceptance path is live product/collection discovery, variant and inventory behavior, cart mutations and persistence, discounts, customer authentication and account data, and handoff to Shopify-hosted checkout. Razorpay remains configured and executed inside Shopify checkout; Hydrogen uses Shopify's returned checkout URL and does not implement a separate Razorpay client integration. Gift-card recipient and Shop Pay verification are outside the required workflow scope.

The app is now linked to the real `Peekapaya-store` Hydrogen storefront and Production credentials are present locally. Customer Account callback/logout origins were registered through Hydrogen's secure development tunnel. Live Storefront API checks found 26 products, 9 collections, 130 variants, and 7 unavailable variants. Product/collection/search routes load real data, unavailable choices are disabled, and live cart add, persistence, quantity update, removal, empty restoration, and checkout URL generation pass. Shopify capped an excessive cart quantity and returned `MERCHANDISE_NOT_ENOUGH_STOCK`, confirming inventory enforcement. Exact quantity fields remain unavailable without `unauthenticated_read_product_inventory`, but the current design does not display inventory counts. Interactive checkout/Razorpay, valid-discount, and authenticated customer workflow verification remain pending.

Phase 1, item 3 is complete for the local storefront. Search now uses the Liquid theme's centered 66vw desktop modal, full-screen mobile surface, sticky input controls, visible query suggestions, four/two-column product results, horizontal resource cards, loading/no-result states, encoded view-all URLs, focus trapping, Escape closing, and responsive scrolling. The Shopify validator, lint, typecheck, production build, and local `/pages/girls`, `/pages/boys`, and `/search?q=snowboard` route checks pass. A connected visual browser was unavailable during the final check, so compare the modal manually at desktop and mobile widths during workflow testing.

Phase 2, items 1 through 3 are complete. Audience, collection, and catalog queries now load availability, up to five product images, selected price, and compare-at price. Product cards show the second image on pointer/focus hover with the configured 1.015 subtle zoom, retain the portrait crop, expose accessible sale/sold-out states, and format sale and regular prices. The card carousel has accessible desktop controls for products with more than two images, mobile swipe navigation, accidental-link protection during swipes, and polite image-position announcements. Storefront API code generation, Shopify validation, lint, typecheck, the Oxygen production build, and local Girls, Boys, and all-products route checks pass for these changes.

Phase 2, item 4 and the configured core of Phase 4 are complete locally. Product cards now offer direct quick add for simple products and an accessible option dialog for multi-variant products. Size, color, and other values prevent unavailable combinations; quantity controls normalize Shopify minimum, maximum, and increment rules before submitting. The product page matches the configured two-column desktop media grid, square crop, zoom, mobile carousel and swipe behavior, sticky details, sticky mobile purchase controls, title/price/tax/description hierarchy, and eight related products. Product-page and quick-add submissions use Hydrogen CartForm, open the existing cart drawer, and supply optimistic variant data. Separate Mock Shop POST checks confirmed successful product-page and product-card quick-add mutations, quantity one, and persisted cart lines. Shopify tooling and code generation validate the API fields. A connected visual browser was unavailable, so exact desktop/mobile spacing and interactive visual comparison remain part of the user's workflow pass.

The local Phase 6 customer-account interface is complete. Shopify's Customer Account API continues to own secure login and authorization. Hydrogen now provides the account overview, profile editing, saved-address create/update/delete/default controls, searchable and paginated order history, URL-safe order links, order details, logout, validation and API error feedback, responsive layouts, and accessible form/status semantics. Protected routes use Hydrogen's authentication-status handler when Customer Account API credentials exist. While Mock Shop is active, `/account` returns a styled temporary-unavailable page and direct profile, order, address, login, and authorization URLs return there instead of exposing Shopify's missing-configuration 400 response. Shopify validation, lint, typecheck, the Oxygen production build, and local account-route checks pass. Store-connected verification remains pending because authenticated customer data and callback URLs are unavailable in Mock Shop. Complete that after linking the Headless storefront and configure the branding of Shopify's hosted login there.

Phase 3 collection and listing controls are complete locally. Dynamic collections now cover girls, boys, Korean, and default templates through Shopify-managed collection data; the catalog and all-collections index have dedicated layouts. Collection pages load Search & Discovery filter definitions, sorting, 24-product pagination, active chips, clear-all behavior, comfortable/compact density choices, responsive filter-and-sort dialog controls, loading feedback, missing-image fallbacks, long-content handling, and empty results. Filter, price, sort, density, and pagination state stays in the URL. Collection and product `custom.audience` metafields normalize girl/girls, boy/boys, and both/unisex, limit audience-specific products and recommendations, and drive the corresponding header state when resource loader data is available. Mock Shop does not apply every price/filter expression, so exact counts, banner content, audience assignments, and pagination ordering still require the connected storefront.

Phase 5 cart and checkout handoff is complete locally. The right-side drawer now matches the Liquid layout with a responsive full-height surface, overlay, focus trap, item count, loading and empty states, scrollable line items, and a fixed summary region. The full cart page uses the configured two-column desktop and single-column mobile layout. Cart lines preserve variants and public properties, support child lines, enforce Shopify quantity rules, show mutation errors, and expose accessible update and removal controls. The summary supports discount and gift-card responses, order notes, subtotal and estimated total, tax/shipping messaging, and the Shopify checkout URL. Six Shopify-managed product recommendations use the shared product card and quick-add components. Product-page and card quick-add forms both include analytics product data.

Mock Shop workflow checks passed for product add, session persistence, quantity 1-to-2 update, saved note, invalid-discount feedback, checkout-link generation, removal, and the restored empty state. Shopify validation, GraphQL code generation, lint, TypeScript, and the Oxygen production build pass. A valid discount, inventory rejection, and the final hosted-checkout navigation must still be verified after the real store is linked.

The configured Phase 4 product-detail states are complete locally. The active Liquid product template disables its review block and installment messaging, disables pickup availability, and contains no SKU, inventory, generic custom-property, or recently-viewed block, so Hydrogen does not add those unconfigured elements. Gift-card products now expose accessible recipient email, optional name/message, and scheduled-delivery fields using Shopify's exact private/public cart attributes. Recipient delivery uses the regular cart flow so those attributes reach checkout; Shop Pay remains available for eligible regular products and self-delivered gift cards. The configured `shopify.disclosure` metaobject references render as accessible disclosure accordions. Mock Shop checks confirm Shop Pay rendering through the primary-domain fallback and public/private cart-property display behavior. Gift-card submission, populated disclosure content, and accelerated-checkout eligibility still need verification against the connected store. Growave reviews and wishlist remain an external headless integration.

The Phase 6 About Us page is complete locally as a dedicated `/pages/about-us` route. It reproduces the active template's 42rem content width, 56px/64px section padding, centered eyebrow/title/introduction, two blue cards, four configured promise entries, closing message, and single-column mobile breakpoint. The active template has no hero image, so none is rendered. Content is kept in a small constants module and the route does not depend on a Shopify Page record, consistent with the decision to manage non-commerce page content in code. Continue with FAQ from `peekapaya-faq-page.liquid`, then Contact.

Keep the search page itself in Phase 6: its complete result-page cards, pagination, and recommended products for an empty query are still pending. Search modal empty-state recommendations should use the configured collection, or all products when the setting is blank, after the real Shopify storefront is connected. Desktop navigation overflow should also be tested after the real Shopify `main-menu` is connected because Mock Shop intentionally uses only the Girls/Boys fixture navigation.

## Prompt for a new Codex session

Use this prompt from the repository root:

> Continue the Peekapaya Liquid-to-Hydrogen migration. Read `hydrogen-storefront/CONTINUATION_HANDOFF.md`, `hydrogen-storefront/AGENTS.md`, `hydrogen-storefront/MIGRATION_PLAN.md`, and `hydrogen-storefront/MIGRATION_CHECKLIST.md` first. Treat the Liquid theme at the repository root as the source of truth and do not modify it. Resume from the handoff's Exact next work, use Shopify AI Toolkit for Hydrogen/API work, update the handoff, checklist, and resume point, and run lint, typecheck, build, and affected route checks before finishing the slice.
