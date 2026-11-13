import db from "./db.server";

/**
 * Accept a verified webhook once, reply 200 right away, and run `work` after.
 *
 * - Duplicates: Shopify may deliver the same event more than once (retries,
 *   or one admin save producing several deliveries). X-Shopify-Event-Id is the
 *   same across those, so we record it and skip any id we've already seen.
 *   CLI test triggers may not send an Event-Id, so we fall back to the
 *   webhook id.
 * - Speed: Shopify waits at most 5 seconds for a response, and slow or failed
 *   replies lead to retries and eventually a removed subscription. So we only
 *   do the cheap insert before replying; the real work runs afterwards.
 *
 * Fire-and-forget works here because `shopify app dev` runs one long-lived
 * Node process. On serverless hosts, or in production, hand the work to a
 * queue instead.
 */
export async function handleOnce({ eventId, webhookId, topic, shop }, work) {
  const id = eventId ?? webhookId;

  try {
    await db.webhookEvent.create({ data: { eventId: id, topic, shop } });
  } catch (error) {
    // P2002 = unique constraint violation: we've already accepted this event.
    if (error.code === "P2002") {
      console.log(`Skipping duplicate ${topic} event ${id}`);
      return new Response(null, { status: 200 });
    }
    throw error;
  }

  Promise.resolve()
    .then(work)
    .catch((error) => console.error(`${topic} event ${id} failed:`, error));

  return new Response(null, { status: 200 });
}
