import { authenticate } from "../shopify.server";
import { handleOnce } from "../webhooks.server";

// Needs read_orders plus protected customer data access (Level 1, set in the
// Partner Dashboard). Without Level 2 fields, name/email/phone/address arrive
// redacted.
export const action = async ({ request }) => {
  const webhook = await authenticate.webhook(request);
  const { shop, topic, payload, eventId, webhookId } = webhook;

  console.log(
    `Received ${topic} webhook for ${shop} (event ${eventId}, webhook ${webhookId})`,
  );

  return handleOnce(webhook, async () => {
    const items = payload.line_items?.map(
      (item) => `${item.quantity} x ${item.title}`,
    );
    console.log(
      `Order ${payload.name}: ${payload.total_price} ${payload.currency}`,
      items,
    );
  });
};
