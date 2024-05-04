import { redirect } from "@remix-run/node";
import { authenticate, MONTHLY_PLAN, ANNUAL_PLAN } from "../shopify.server";

export const loader = async ({ request }) => {
  const { billing } = await authenticate.admin(request);
  const plan_item = new URLSearchParams(request.url.split('?')[1]).get('plan_item');

  try {
    const billingCheck = await billing.require({
      plans: [plan_item === 'monthly' ? MONTHLY_PLAN : ANNUAL_PLAN],
      onFailure: async () => billing.request({ plan: plan_item === 'monthly' ? MONTHLY_PLAN : ANNUAL_PLAN }),
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