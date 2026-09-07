# Peekapaya Hydrogen Storefront

This directory contains the React/Hydrogen replacement for the existing Shopify Liquid theme. It is isolated from the theme and listed in the parent `.shopifyignore`, so theme pushes do not upload this application.

Shopify remains the system of record for products, collections, inventory, customers, orders, payments, shipping, taxes, and discounts. Layout, styling, and custom pages live in this application.

## Requirements

- Node.js 22 or 24
- A Shopify store with the Headless sales channel when connecting real data

## Local development

```bash
npm install
npm run dev
```

The app currently uses Shopify's Mock Shop data unless local Shopify environment variables are supplied. Copy `.env.example` to `.env` only when a local override is needed; never commit secrets.

## Checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Project structure

- `app/assets`: fonts, images, icons, design tokens, and shared styles
- `app/components`: reusable UI and commerce components
- `app/constants`: navigation and other stable application values
- `app/fixtures`: temporary content used before live Shopify data is connected
- `app/graphql`: Customer Account API operations
- `app/lib`: Hydrogen context, sessions, fragments, and shared helpers
- `app/pages`: page-level presentation components
- `app/routes`: React Router loaders, actions, metadata, and route composition
- `app/types`: shared domain types

Keep route files focused on data loading and actions. Put reusable markup in components or pages, keep names tied to their purpose, and use the design tokens instead of repeating colors.

## Connect Shopify later

After the migrated pages and styles have been reviewed locally:

```bash
npx shopify hydrogen link
npx shopify hydrogen env pull
npm run dev
```

Link the app to a Hydrogen storefront created in Shopify Admin. Linking and pulling variables changes this app's connection; it does not replace or delete the Liquid theme. Publish to an Oxygen preview only after the live-data workflows have been tested.

Customer login uses Shopify's secure hosted Customer Account authorization flow. After linking the storefront, register the local, Oxygen preview, and production authorization callback URLs in Shopify, then test profile, address, order-history, and logout workflows with a customer account. Login-page branding is configured in Shopify rather than in the Hydrogen route.

See [MIGRATION_PLAN.md](./MIGRATION_PLAN.md) for the durable handoff and execution order. Use [MIGRATION_CHECKLIST.md](./MIGRATION_CHECKLIST.md) for detailed completion status.
