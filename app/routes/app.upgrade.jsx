import { authenticate, MONTHLY_PLAN, ANNUAL_PLAN } from "../shopify.server";

export async function loader({ request }) {
  const { billing, session } = await authenticate.admin(request);
  let { shop } = session;

  let myShop = shop.replace(".myshopify.com", "");
  let url = new URL(request.url);
  let plan_item = url.searchParams.get('plan_item') || 'monthly';
  
  let selectedPlan = plan_item === 'monthly' ? MONTHLY_PLAN : ANNUAL_PLAN;

  // Check current billing plans
  const { hasActivePayment, appSubscriptions } = await billing.check({
    plans: [MONTHLY_PLAN, ANNUAL_PLAN],
    isTest: true,
  });

  console.log('hasActivePayment:', hasActivePayment);
  console.log('appSubscriptions:', appSubscriptions);

  if (hasActivePayment && appSubscriptions && appSubscriptions.length > 0) {
    const currentPlan = appSubscriptions[0].name;

    // Check if the current plan is different from the selected plan
    if ((plan_item === 'monthly' && currentPlan !== 'Monthly Subscription') ||
        (plan_item !== 'monthly' && currentPlan !== 'Annual Subscription')) {
      // Initiate the plan change
      await billing.request({
        plan: selectedPlan,
        isTest: true,
        returnUrl: `https://admin.shopify.com/store/${myShop}/apps/${process.env.APP_NAME}/app/payments?upgrade_initiated=true`,
        
      });
    } else {
      // Return to the payments page without initiating a new billing request
      return {
        redirect: `https://admin.shopify.com/store/${myShop}/apps/${process.env.APP_NAME}/app/payments`,
      };
    }
  } else {
    // If no active subscription is found, request the selected plan
    await billing.request({
      plan: selectedPlan,
      isTest: true,
      returnUrl: `https://admin.shopify.com/store/${myShop}/apps/${process.env.APP_NAME}/app/payments?upgrade_initiated=true`,
    });
  }

  return null;
}