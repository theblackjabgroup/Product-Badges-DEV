import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  const { topic, shop, session, admin } = await authenticate.webhook(request);

  if (!admin) {
    // The admin context isn't returned if the webhook fired after a shop was uninstalled.
    throw new Response();
  }

  switch (topic) {
    case "APP_UNINSTALLED":
      if (session) {
        await db.session.deleteMany({ where: { shop } });
      }

      break;
    case "CUSTOMERS_DATA_REQUEST":
      console.log("customer data requested");
      return new Response(null, { status: 200 });
      

    case "CUSTOMERS_REDACT":
      console.log("customer erasure requested")
      return new Response(null, { status: 200 });

    case "SHOP_REDACT":
      console.log("shop erasure requested")
      if (session) {
        await db.session.deleteMany({ where: { shop } });
      }
      return new Response(null, { status: 200 });
    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }

  throw new Response();
};
