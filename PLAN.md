# Webhooks Lab: plan

Hands-on practice for Shopify webhooks. Kept separate from the
"Checkout Extenions" project on purpose: that app has no server, and
deploying webhooks to it could replace its live extensions and Functions.

## Decisions

- New Shopify app, scaffolded with `shopify app init` (React Router template).
  The template already has an `app/uninstalled` handler and
  `authenticate.webhook()`, which verifies the HMAC signature.
- Install on Arsal's Plus dev store. It sits alongside the checkout practice
  app; the two don't affect each other.
- New, empty GitHub repo. Arsal will share the remote URL; work on `main`.
- `shopify app init` creates a subfolder named after the app. Scaffold so the
  app ends up at the root of this folder, not one level down.

## Steps

1. Scaffold the app and connect it to the Plus dev store.
2. Subscribe to `products/update` in `shopify.app.toml`; log the payload when
   a product is edited in admin.
3. Fire a test event: `shopify app webhook trigger`.
4. Add `orders/create`. This needs protected customer data access switched on
   in the Dev Dashboard (no review needed for a practice app).
5. Handle duplicates (Event-Id) and keep the handler fast (reply 200, then
   process).
6. Add the three privacy webhooks.

Learning material so far: the 10-lesson explainer in chat and the animated
video at https://claude.ai/artifact/6maZehB8U6MW6vpVympEBK

## Progress (2026-11-13)

All six steps are done and tested.

- App: "Webhooks Lab", ShopX Commerce org (Dev Dashboard 128967601,
  Partner Dashboard 563871), installed on arsals-plus-store.
- Running locally: Cloudflare's quick tunnel times out on this network, so
  use ngrok. Start `ngrok http 3000`, then
  `shopify app dev --store arsals-plus-store.myshopify.com --tunnel-url <ngrok-url>:3000`.
  The ngrok free tier shows a warning page in the admin iframe the first
  time; click "Visit Site". Webhooks aren't affected.
- Protected customer data: Level 1, reason "App functionality", set in the
  Partner Dashboard (Webhooks Lab > API access requests). Dev stores don't
  need review.
- Duplicates and speed: `app/webhooks.server.js` stores each Event-Id in the
  `WebhookEvent` table, replies 200, then does the work.
- Privacy webhooks: `/webhooks/compliance` handles all three topics.
- After a Prisma migration, restart `shopify app dev`; the running server
  keeps the old Prisma client.
