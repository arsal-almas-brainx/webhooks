import { authenticate } from "../shopify.server";
import db from "../db.server";

// The three mandatory privacy (compliance) webhooks. Every app must handle
// them; App Store review checks that this endpoint verifies the HMAC
// (authenticate.webhook does, and replies 401 on a bad signature).
//
// This app stores no customer data, only sessions and webhook event ids, so
// there's little to export or erase. A real app would look up and act on the
// customer or shop data it keeps.
export const action = async ({ request }) => {
  const { shop, topic, payload } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  switch (topic) {
    case "CUSTOMERS_DATA_REQUEST":
      // A customer asked the merchant for their data. Send the merchant what
      // this app holds about payload.customer (we hold nothing).
      console.log(
        `Data request for customer ${payload.customer?.id}, orders`,
        payload.orders_requested,
      );
      break;
    case "CUSTOMERS_REDACT":
      // Erase everything this app stores about payload.customer.
      console.log(`Redact customer ${payload.customer?.id}`);
      break;
    case "SHOP_REDACT":
      // Sent 48 hours after uninstall. Erase everything for this shop.
      await db.session.deleteMany({ where: { shop } });
      await db.webhookEvent.deleteMany({ where: { shop } });
      console.log(`Erased all data for ${shop}`);
      break;
    default:
      console.warn(`Unexpected compliance topic ${topic}`);
  }

  return new Response(null, { status: 200 });
};
