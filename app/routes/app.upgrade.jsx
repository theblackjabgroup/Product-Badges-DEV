import { redirect } from '@remix-run/node';
import { authenticate, MONTHLY_PLAN, ANNUAL_PLAN } from "../shopify.server";

export async function loader({ request }) {
  const { billing, session } = await authenticate.admin(request);
  let { shop } = session;
  let myShop = shop.replace(".myshopify.com", "");
  console.log(process.env.APP_NAME, myShop);

  const plan_item = new URLSearchParams(request.url.split('?')[1]).get('plan_item');

  const billingResult = await billing.require({
    plans: [plan_item === 'monthly' ? MONTHLY_PLAN : ANNUAL_PLAN],
    onFailure: async () => billing.request({
      plan: plan_item === 'monthly' ? MONTHLY_PLAN : ANNUAL_PLAN,
      isTest: true,
      returnUrl: `https://admin.shopify.com/store/poc-v2/apps/${process.env.APP_NAME}/app`,
    }),
  });
  if (billingResult && billingResult.success) {
    return redirect(`https://admin.shopify.com/store/poc-v2/apps/${process.env.APP_NAME}/app`);
  }
  return null;
}