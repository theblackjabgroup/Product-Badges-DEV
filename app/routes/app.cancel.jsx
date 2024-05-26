import { redirect } from '@remix-run/node';
import { ANNUAL_PLAN, authenticate, MONTHLY_PLAN } from "../shopify.server";
export async function loader({ request }) {
    const { billing } = await authenticate.admin(request);
    let url = new URL(request.url);
    let plan_item = url.searchParams.get('plan_item') || 'monthly';
    
    let plan = plan_item === 'monthly' ? MONTHLY_PLAN : ANNUAL_PLAN;
    const billingCheck = await billing.require({
      plans: [MONTHLY_PLAN, ANNUAL_PLAN],
      onFailure: async () => billing.request({ plan: plan}),
    });
const subscription = billingCheck.appSubscriptions[0];
const cancelledSubscription = await billing.cancel({
    subscriptionId: subscription.id,
    isTest: true,
    prorate: true,
});
   return redirect("/app/payments")
}