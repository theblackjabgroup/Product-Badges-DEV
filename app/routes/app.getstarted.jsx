
import { BlockStack, Button, Card, Grid, InlineStack, MediaCard, Page, Text } from '@shopify/polaris';
import step_one from '../assets/step_one.png'
import step_two from '../assets/step_two.png'
import step_three from '../assets/step_three.png'
import next_bill_due_date from '../assets/image.png'
import upgrade_yearly from '../assets/upgrade-yearly.png'
import support from '../assets/1.png'
import mixpanel from 'mixpanel-browser';
import { useNavigate } from '@remix-run/react';

// edit your token here
const TOKEN = 'YOUR_TOKEN'

// edit you user id here
const UserID = 'SHARAD_JADHAV'


// initialize mixpanel
mixpanel.init(TOKEN, { debug: true, track_pageview: true, ignore_dnt: true, ip:true });

// Set User Id
mixpanel.identify(UserID)


export default function Index() {

    // For Navigation
    const navigate = useNavigate()


  // Trigger the Mixpanel Track Event
  const triggerMixPanel = (UniqueIdentifier, key, value) => {
    mixpanel.track(UniqueIdentifier, {
      [key]:value
    })
    console.log(UniqueIdentifier)
    // Uncomment this function and paas one more parameter 'url' to navigate
    // navigate(url)

  }


  return (
    <Page>
      <BlockStack gap="400">
        <Text variant="headingXl" as="h4">
          Welcome to Our Product Badges and Labels
        </Text>

        <MediaCard size='small' title={<span style={{ fontSize: "1rem", fontWeight: 'bold' }}>Step 1: Integrate our app into your Shopify theme.</span>} description={<div style={{ margin: '1rem auto' }}>Click on the "Enabled app embed" button below to open the Theme Editor page, toggle on our app to activate it, and click "Save".</div>} primaryAction={{ content: "Enable App Embed", variant: "primary", url: `https://admin.shopify.com/admin/themes/current/editor?context=apps&template=index`, target: "_blank", onAction:() => triggerMixPanel('enableAppEmbed', 'Enable App Embed', 'Enable App Embed Clicked') }}>
          <img alt="" width="90%" height="100%" style={{ objectFit: 'cover', objectPosition: 'center', }} src={step_one} />
        </MediaCard>

        <MediaCard size='small' title={<span style={{ fontSize: "1rem", fontWeight: 'bold' }}>Step 2: Create your label.</span>} description={<div style={{ margin: '1rem auto' }}>Click on the "Labels" tab, then "Create" to start the process, and customize the label to suit your specific needs. If you wish to create more campaigns, select their respective tabs.</div>} primaryAction={{ content: "Create Label", variant: "primary", url:"/app/create-label", onAction:() => triggerMixPanel('navigationToCreateLabelPage', 'Create Label', 'Create Label Clicked') }}>
          <img alt="" width="90%" height="100%" style={{ objectFit: 'cover', objectPosition: 'center', }} src={step_two} />
        </MediaCard>

        <MediaCard size='small' title={<span style={{ fontSize: "1rem", fontWeight: 'bold' }}>Step 3: Publish your label.</span>} description={<div style={{ margin: '1rem auto' }}>After customizing, make sure to save and activate the label so that it can appear on your store. If your label doesn't show up on your theme, please contact us to resolve the issue.</div>} primaryAction={{ content: "Manage Label", variant: "primary", url:"/app/labels" ,onAction:() => triggerMixPanel('navigationToLabelsPage', 'Labels Page', 'Manage Labels Clicked')  }}>
          <img alt="" width="90%" height="100%" style={{ objectFit: 'cover', objectPosition: 'center', }} src={step_three} />
        </MediaCard>
        <Grid>
          <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
            <Card>
              <InlineStack align='space-between' blockAlign='start'>
                <BlockStack gap={300} inlineAlign='start' align='space-between'>
                  <Text variant='headingLg'>
                    Next bill due on
                  </Text>
                  <p style={{ color: '#5C5F62' }} variant='bodyLg'>
                    02/02/2024
                  </p>
                  <p style={{ color: '#5C5F62' }}>
                    Amount - $44
                  </p>
                  <Button onClick={() => triggerMixPanel('PayNow', 'PayNow', 'Pay Now Clicked')} variant='primary'>
                    Pay Now
                  </Button>
                </BlockStack>
                <img width={100} src={next_bill_due_date} alt="" />
              </InlineStack>
            </Card>
          </Grid.Cell>
          <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
            <Card>
              <InlineStack align='space-between' blockAlign='start'>
                <BlockStack gap={300} inlineAlign='start' align='space-between'>
                  <Text variant='headingLg'>
                    Support
                  </Text>
                  <p style={{ color: '#5C5F62' }} variant='bodyLg'>
                    Connect with Black Jab Group
                  </p>
                  <p style={{ color: '#5C5F62' }}>
                    theblackjabgroup@gmail.com
                  </p>
                  <a target='_blank' variant={'primary'} href={`https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=theblackjabgroup@gmail.com&su=BADGE%20LABEL%20SUPPORT`} rel="noreferrer">
                    <Button onClick={() => triggerMixPanel('Contact', 'Contact', 'Contact Button Clicked')} variant='primary'>
                      Contact
                    </Button>
                  </a>
                </BlockStack>
                <img width={125} src={support} alt="" />
              </InlineStack>
            </Card>
          </Grid.Cell>
        </Grid>
        <Card>
          <InlineStack align='space-between' blockAlign='start'>
            <BlockStack gap={600} inlineAlign='start'>
              <Text variant='headingLg'>
                Upgrade to Yearly Plan
              </Text>
              <p variant='bodyLg'>
                And get upto 30% off
              </p>
              <Button onClick={() => triggerMixPanel('Upgrade', 'Upgrade', 'Upgrade Button Clicked')} variant='primary'>
                Upgrade
              </Button>
            </BlockStack>
            <img width={125} src={upgrade_yearly} alt="" />
          </InlineStack>
        </Card>
      </BlockStack>
    </Page>
  );
}