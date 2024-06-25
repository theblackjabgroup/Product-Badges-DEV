import { redirect } from "@remix-run/node";
import { authenticate, MONTHLY_PLAN, ANNUAL_PLAN } from "../shopify.server";

export const loader = async ({ request }) => {
  const { billing } = await authenticate.admin(request);
  let url = new URL(request.url);
  let plan_item = url.searchParams.get('plan_item') || 'monthly';

  let plan = plan_item === 'monthly' ? MONTHLY_PLAN : ANNUAL_PLAN;
  try {
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

    console.log('Subscription cancelled successfully:', cancelledSubscription);
  } catch (error) {
    console.error('Error cancelling subscription:', error);
  }

  // Redirect logic or return necessary data if needed
  return redirect(`/app/payments`); // Redirecting to payments page after cancellation
};
