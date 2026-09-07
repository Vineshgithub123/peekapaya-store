# Peekapaya migration checklist

This is a living implementation checklist for moving the Liquid theme into Hydrogen without changing the existing theme during development.

## Foundation complete

- [x] Scaffold the official TypeScript Hydrogen storefront in `hydrogen-storefront`
- [x] Keep the Hydrogen application out of Shopify theme uploads
- [x] Add local environment-variable examples without storing credentials
- [x] Add the configured Peekapaya colors and the theme's final Satoshi font override
- [x] Add a keyboard-accessible skip link and base cart/search drawer behavior
- [x] Preserve the current `/` to `/pages/girls` redirect
- [x] Add reusable girls and boys audience landing pages
- [x] Retain Hydrogen routes for products, collections, cart, search, discounts, policies, blog content, and customer accounts
- [x] Verify lint, TypeScript, and the Oxygen production build

## Visual migration in progress

### Header

- [x] Use the original Peekapaya logo and theme icon assets
- [x] Use Girls/Boys fixture navigation while Mock Shop is connected
- [x] Match the exact desktop header width, column grid, horizontal padding, vertical padding, and logo alignment
- [x] Match the exact mobile logo centering and configured search/account/cart icon slots
- [x] Match menu font size, line height, link padding, gaps, active state, and hover state
- [ ] Add the desktop menu's automatic overflow handling
- [x] Rebuild nested desktop mega menus with featured collection imagery
- [x] Match the mobile horizontal navigation bar item sizing, scrolling, and active audience state
- [x] Match the sticky position, configured shadow, and keyboard focus behavior
- [x] Match the submenu surface, open/close animation, expanded state, and Escape behavior
- [x] Match the search drawer modal, input controls, predictive result groups, loading/no-result states, and responsive sizing
- [ ] Load the configured or default empty-state product recommendations after Shopify is connected
- [ ] Confirm the final `main-menu` hierarchy from the connected Shopify store

### Girls and boys landing pages

- [x] Import the original desktop/mobile hero and shipping-banner assets
- [x] Reproduce the section order and configured collection handles
- [x] Add responsive four-column/two-column product and collection grids
- [x] Match hero width, responsive height, crop, full link area, and mobile image breakpoint
- [x] Preserve the configured hero content state; its text, description, and button blocks are disabled
- [x] Match shipping-banner whitespace, 200px desktop height, 80px mobile height, and crop
- [x] Match the landing-section heading size, line height, alignment, gap, and responsive padding
- [x] Match the Shop All button position, size, and visual states
- [ ] Load and verify the real collection images and product order after Shopify is connected

### Product cards

- [x] Add the base portrait ratio, 12px media radius, title, divider, and price hierarchy
- [x] Match the portrait media ratio, four/two-column widths, 30px column gaps, and configured row gaps
- [x] Add the second-image hover and configured subtle zoom
- [x] Add the product-card image carousel, desktop arrows, and mobile swipe behavior
- [x] Add sale/sold-out badges and compare-at/sale price formatting
- [x] Add desktop/mobile quick-add, direct single-variant add, and the configured multi-variant dialog
- [x] Add size/color/other option selection, unavailable states, Shopify quantity rules, and the shared quantity-selector design
- [ ] Add Wishlist by Square/Growave card controls after selecting the supported headless integration
- [x] Match loading, unavailable-image, sold-out, long-title, and long-price states

### Collection and listing pages

- [x] Match girls, boys, Korean, default collection, catalog, and all-collections route structures
- [x] Implement the `custom.audience` girl/boy/both rules in queries and active navigation
- [x] Match collection heading, description, Shopify-managed banners, collection cards, and product grid
- [x] Match filters, active filter chips, sorting, grid density controls, pagination, and empty results
- [x] Preserve filter/sort state in URLs and add the responsive filter-and-sort drawer
- [ ] Compare exact collection banner crops and spacing against live Shopify content at mobile and desktop widths

### Product detail page

- [x] Match the configured two-column media grid, mobile carousel/dots, zoom dialog, and mobile swipe behavior
- [x] Match title, vendor, price, sale state, tax note, and description
- [x] Confirm the active product template disables reviews and contains no SKU or product-badge block; keep Growave review/wishlist data behind its headless integration boundary
- [x] Match variant swatches, size buttons, unavailable states, Shopify quantity rules, and add-to-cart behavior
- [x] Match sticky product information and sticky mobile add-to-cart
- [x] Add Shopify gift-card recipient properties and accelerated checkout; confirm the active template disables pickup/installments and contains no inventory or generic custom-property block
- [x] Add the configured eight-item related-product section with four desktop and two mobile products visible
- [x] Render the configured Shopify disclosure metaobjects as accessible accordions; confirm no recently-viewed section is configured
- [x] Exclude gift-card recipient and Shop Pay live verification from the required migration workflow scope

### Cart and checkout handoff

- [x] Verify product-page and quick-add CartForm inputs, quantity normalization, successful cart mutation, and persisted cart line
- [x] Match cart drawer dimensions, overlay, header, animation, empty state, and focus behavior
- [x] Match line items, child items, variant text, quantity controls, remove action, prices, and discounts
- [x] Match note, subtotal, tax/shipping messaging, checkout button, and cart recommendations
- [x] Verify discount responses, cart persistence, add-to-cart analytics data, and Shopify-hosted checkout URL locally
- [ ] Verify a valid store discount, inventory rejection, and completed checkout handoff after connecting Shopify

### Content, search, and customer pages

- [x] Rebuild About Us from `peekapaya-about-us.liquid`
- [ ] Rebuild FAQ from `peekapaya-faq-page.liquid`
- [ ] Rebuild Contact from `peekapaya-contact-page.liquid` and connect message delivery
- [ ] Match search input, predictive search, results groups, product cards, pagination, and empty state
- [ ] Match blog index, article, policies, gift card, all-collections, and 404 pages
- [x] Preserve Shopify Customer Account API login, authorization callback, logout, and protected-route handling
- [x] Build responsive, accessible account overview, profile, saved-address, order-list, and order-detail interfaces
- [x] Handle local validation, API mutation errors, loading, success, empty, invalid-order, and missing-order states
- [ ] Verify authenticated account workflows against the connected store and apply Shopify-hosted login branding
- [ ] Verify customer-account callback URLs on local, preview, and production domains

### Footer and global interface

- [ ] Match footer layout, Ask about/Connect columns, exact spacing, colors, and mobile stacking
- [ ] Build and connect newsletter signup with success/error states
- [ ] Match policy links, copyright, powered-by setting, and social icons
- [ ] Migrate the floating WhatsApp control with the real number and responsive behavior
- [ ] Match global buttons, inputs, drawers, dialogs, focus rings, typography scale, and content width
- [ ] Complete keyboard, screen-reader, responsive, reduced-motion, performance, and SEO review

## Live Shopify connection pending

- [ ] Create or select the Headless sales channel storefront in Shopify Admin
- [ ] Run `npx shopify hydrogen link` and `npx shopify hydrogen env pull`
- [ ] Confirm products and collections are published to the Headless sales channel
- [ ] Replace fixture content with the required Shopify fields and metafields
- [ ] Verify product prices, variants, inventory, discounts, cart, and Shopify-hosted checkout
- [ ] Configure and verify Customer Account API callback URLs
- [ ] Deploy an Oxygen preview and complete workflow testing before switching domains

### Required real-store workflow acceptance

- [ ] Confirm real products, collections, images, prices, variants, availability, and inventory are returned by the Storefront API
- [ ] Confirm collection navigation, audience filtering, search, product selection, and unavailable-variant handling with live data
- [ ] Confirm add, update, remove, persistence, discount, and inventory-error behavior in the live Shopify cart
- [ ] Confirm the cart checkout URL opens Shopify-hosted checkout with shipping, taxes, discounts, and Razorpay from the existing Shopify configuration
- [ ] Confirm customer login, authorization callback, profile, addresses, orders, order details, and logout with the Customer Account API

## External integrations pending

Theme app embeds and Liquid app blocks do not automatically execute in Hydrogen. Each service needs a headless API, supported script, or a small custom integration.

- [ ] Wishlist by Square: confirm headless API and customer identity mapping
- [ ] Growave: confirm headless reviews/loyalty/wishlist support and required credentials
- [ ] Shopify Inbox: confirm its current custom-storefront installation method
- [ ] Contact form: choose the delivery endpoint and abuse protection
- [ ] Newsletter: connect the selected Shopify or email provider endpoint
- [ ] Analytics and consent: configure Shopify analytics and the required privacy banner behavior
- [ ] WhatsApp: replace the placeholder number and migrate the link

## Content and asset gaps

- [x] Import the logo, favicon, hero, shipping, and mobile assets referenced by the migrated landing pages
- [ ] Confirm navigation and footer menus to read from Shopify
- [ ] Confirm the `custom.audience` metafield values and behavior for girl, boy, and both products
