import { authenticate } from "../shopify.server";
import { handleOnce } from "../webhooks.server";

export const action = async ({ request }) => {
  const webhook = await authenticate.webhook(request);
  const { shop, topic, payload, eventId, webhookId } = webhook;

  console.log(
    `Received ${topic} webhook for ${shop} (event ${eventId}, webhook ${webhookId})`,
  );

  return handleOnce(webhook, async () => {
    console.log(JSON.stringify(payload, null, 2));
  });
};
