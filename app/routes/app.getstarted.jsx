
import { BlockStack, Button, CalloutCard, Card, Grid, InlineStack, MediaCard, Page, Text } from '@shopify/polaris';
import step_one from '../assets/step_one.png'
import step_two from '../assets/step_two.png'
import step_three from '../assets/step_three.png'
import next_bill_due_date from '../assets/image.png'
import upgrade_yearly from '../assets/upgrade-yearly.png'
import support from '../assets/1.png'

export default function Index() {
  return (
    <Page>
      <BlockStack gap="400">
        <Text variant="headingXl" as="h4">
          Welcome to Our Product Badges and Labels
        </Text>
        <MediaCard size='small' title="Step 1: Integrate our app into your Shopify theme." description='Click on the "Enabled app embed" button below to open the Theme Editor page, toggle on our app to activate it, and click "Save".' primaryAction={{ content: "Enable App Embed", variant: "primary", url: `https://admin.shopify.com/admin/themes/current/editor?context=apps&template=index`, target: "_blank" }}>
          <img alt="" width="100%" height="100%" style={{ objectFit: 'cover', objectPosition: 'center', }} src={step_one} />
        </MediaCard>
        <MediaCard size='small' title="Step 2: Create your label." description='Click on the "Labels" tab, then "Create" to start the process, and customize the label to suit your specific needs. If you wish to create more campaigns, select their respective tabs.' primaryAction={{ content: "Create Label", variant: "primary", onAction: () => { }, }}>
          <img alt="" width="100%" heighuseNavigatet="100%" style={{ objectFit: 'cover', objectPosition: 'center', }} src={step_two} />
        </MediaCard>
        <MediaCard size='small' title="Step 3: Publish your label." description="After customizing, make sure to save and activate the label so that it can appear on your store. If your label doesn't show up on your theme, please contact us to resolve the issue." primaryAction={{ content: "Manage Label", variant: "primary", onAction: () => { }, }}>
          <img alt="" width="90%" height="90%" style={{ objectFit: 'cover', objectPosition: 'center', }} src={step_three} />
        </MediaCard>
        <Grid>
          <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
            <Card>
              <InlineStack align='space-between' blockAlign='center'>
                <BlockStack gap={200} inlineAlign='start'>
                  <Text variant='headingLg'>
                    Next bill due on
                  </Text>
                  <p variant='bodyLg'>
                    02/02/2024
                  </p>
                  <Button variant='primary'>
                    Pay Now
                  </Button>
                </BlockStack>
                <img width={100} src={next_bill_due_date} alt="" />
              </InlineStack>
            </Card>
          </Grid.Cell>
          <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
          <Card>
              <InlineStack align='space-between' blockAlign='center'>
                <BlockStack gap={200} inlineAlign='start'>
                  <Text variant='headingLg'>
                    Support
                  </Text>
                  <p variant='bodyLg'>
                   Connect with Black Jab Group
                  </p>
                  <p>
                  theblackjabgroup@gmail.com
                  </p>
                  <Button variant='primary'>
                    Contact
                  </Button>
                </BlockStack>
                <img width={125} src={support} alt="" />
              </InlineStack>
            </Card>
          </Grid.Cell>
        </Grid>
            <Card>
              <InlineStack align='space-between' blockAlign='center'>
                <BlockStack gap={200} inlineAlign='start'>
                  <Text variant='headingLg'>
                  Upgrade to Yearly Plan
                  </Text>
                  <p variant='bodyLg'>
                  And get upto 30% off
                  </p>
                  <Button variant='primary'>
                    Upgrade
                  </Button>
                </BlockStack>
                <img width={100} src={upgrade_yearly} alt="" />
              </InlineStack>
            </Card>
      </BlockStack>
    </Page>
  );
}
