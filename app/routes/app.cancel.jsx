import { redirect } from '@remix-run/node'; 
import { authenticate, MONTHLY_PLAN } from "../shopify.server";

export async function loader({ request }) {
    const { billing } = await authenticate.admin(request);
    const billingCheck = await billing.require({
      plans: [MONTHLY_PLAN],
      onFailure: async () => billing.request({ plan: MONTHLY_PLAN }),
    });
  
    const subscription = billingCheck.appSubscriptions[0];
    const cancelledSubscription = await billing.cancel({
      subscriptionId: subscription.id,
      isTest: true,
      prorate: true,
     });

     return redirect("/app/payments")
  
}

