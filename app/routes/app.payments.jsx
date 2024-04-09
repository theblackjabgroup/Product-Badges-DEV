import React, { useState } from 'react';
import { Page, Card, Layout, ButtonGroup, Button, Text, List, InlineStack, CalloutCard } from '@shopify/polaris';
import { ANNUAL_PLAN, MONTHLY_PLAN, authenticate } from '../shopify.server';
import { useLoaderData } from '@remix-run/react';
import {json} from '@remix-run/node'

export async function loader({ request }) {
  const { billing } = await authenticate.admin(request);

  try {
    // Attempt to check if the shop has an active payment for any plan
    const billingCheck = await billing.require({
      plans: [MONTHLY_PLAN, ANNUAL_PLAN],
      isTest: true,
      // Instead of redirecting on failure, just catch the error
      onFailure: () => {
        throw new Error('No active plan');
      },
    });

    // If the shop has an active subscription, log and return the details
    const subscription = billingCheck.appSubscriptions[0];
    console.log(`Shop is on ${subscription.name} (id ${subscription.id})`);
    return json({ billing, plan: subscription });

  } catch (error) {
    // If the shop does not have an active plan, return an empty plan object
    if (error.message === 'No active plan') {
      console.log('Shop does not have any active plans.');
      return json({ billing, plan: { name: "Free" } });
    }
    // If there is another error, rethrow it
    throw error;
  }
}

export default function PaymentsPage() {
  const { plan } = useLoaderData(); // Load the plan data
  const [plan_item, setPlan] = useState('monthly');
  const [paidPrice, setPaidPrice] = useState(10);

  // Determine if the user is on a paid plan
  const isOnPaidPlan = plan.name !== 'Free';

  const handlePlanChange = (selected) => {
    setPlan(selected);
    setPaidPrice(selected === 'monthly' ? 10 : 100);
  };

  // Dynamic background color based on subscription status
  const paidBackgroundColor = isOnPaidPlan ? '#A1EEBD' : 'transparent';
  const freeBackgroundColor = !isOnPaidPlan ? '#A1EEBD' : 'transparent';

  return (
    <Page title="Payments Plans">
      <Card sectioned>
        <Layout>
          <Layout.Section>
            <div style={{ textAlign: 'center', marginBottom: '20px', marginLeft: '350px' }}>
              <ButtonGroup variant='segmented'>
                <Button
                  primary={plan_item === 'monthly'}
                  onClick={() => handlePlanChange('monthly')}
                >
                  Monthly
                </Button>
                <Button
                  primary={plan_item === 'yearly'}
                  onClick={() => handlePlanChange('yearly')}
                >
                  Yearly
                </Button>
              </ButtonGroup>
            </div>
          </Layout.Section>
          <Layout.Section>
            <InlineStack spacing="loose" alignment="center">
              <div style={{ padding: '20px', border: '3px solid ', borderRadius: '10px', marginLeft: '130px', borderColor: 'ActiveBorder', background: freeBackgroundColor }}>
                <Text variant='headingXl' fontWeight='bold'>Free</Text>
                <Text variant='heading2Xl' fontWeight='bold'>$0</Text>
                <hr />
                <List type="bullet">
                  <List.Item>2 Labels/Badges for 20 items/rule</List.Item>
                  <List.Item>1 Banner for all items</List.Item>
                  <List.Item>1 Sales pop-up for all items</List.Item>
                  <List.Item>50+ Designed Library Presets</List.Item>
                </List>
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <Button url='/app/upgrade' variant='primary'>Start Journey</Button>
                </div>
              </div>
              <div style={{ padding: '20px', border: '3px solid ', borderRadius: '10px', marginLeft: '60px', height: '400px', width: '300px', background: paidBackgroundColor }}>
                <Text variant='headingXl' fontWeight='bold'>Paid</Text>
                <Text variant='heading2Xl' fontWeight='bold'>${paidPrice}</Text>
                <hr />
                <List type="bullet">
                  <List.Item>Unlimited Labels/Badges for all items</List.Item>
                  <List.Item>Unlimited Banners for all items</List.Item>
                  <List.Item>Unlimited Sales pop-ups for all items</List.Item>
                  <List.Item>200+ Designed Library Presets</List.Item>
                  <List.Item>Labels/Badges for available & sold out items</List.Item>
                </List>
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <Button url='/app/upgrade' variant='primary'>Start Journey</Button>
                </div>
              </div>
            </InlineStack>
          </Layout.Section>
          <Layout.Section>
            <CalloutCard
          title="Change your plan"
          illustration="https://cdn.shopify.com/s/files/1/0583/6465/7734/files/tag.png?v=1705280535"
          primaryAction={{
            content: 'Change Plan',
            url: '/app/cancel',
          }}
        >
          { isOnPaidPlan ? (
            <p>
              You're currently on pro plan. All features are unlocked.
            </p>
          ) : (
            <p>
              You're currently on free plan. Upgrade to pro to unlock more features.
            </p>
          )}
            </CalloutCard>
          </Layout.Section>
        </Layout>
      </Card>
    </Page>
  );
}