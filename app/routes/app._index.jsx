
import { BlockStack, Button, Card, Icon, InlineGrid, InlineStack, Page, Text } from '@shopify/polaris';
import step_one from '../assets/step_one.png'
import step_two from '../assets/step_two.png'
import step_three from '../assets/step_three.png'
import support from '../assets/1.png'
import mixpanel from 'mixpanel-browser';
import { usePlan } from './app.plancontext';
import { useEffect } from 'react';
import { NoteIcon } from '@shopify/polaris-icons';
import '../styles/label.css'
// edit your token here
const TOKEN = 'YOUR_TOKEN'

// edit you user id here
const UserID = 'SHARAD_JADHAV'


// initialize mixpanel
mixpanel.init(TOKEN, { debug: true, track_pageview: true, ignore_dnt: true, ip: true });

// Set User Id
mixpanel.identify(UserID)


export default function Index() {


  useEffect(() => {
    // Function to fetch and log the POS user details
    const fetchPOSUser = async () => {
      try {
        const posUser = await shopify.user();
        console.log('POS User Details:', posUser);
      } catch (error) {
        console.error('Error fetching POS user details:', error);
      }
    };

    fetchPOSUser();
  }, []);


  const { isOnPaidPlan } = usePlan()
  console.log(isOnPaidPlan)

  // Trigger the Mixpanel Track Event
  const triggerMixPanel = (UniqueIdentifier, key, value) => {
    mixpanel.track(UniqueIdentifier, {
      [key]: value
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

        <InlineGrid gap="400" columns={3}>
          <Card>
            <BlockStack align='space-between' gap={800} inlineAlign='center'>
              <img alt="" width="100%" height="100%" style={{ objectFit: 'cover', objectPosition: 'center', maxHeight: '300px' }} src={step_one} />
              <Text variant='headingMd' alignment='justify'>Step 1 : Integrate our app into your Shopify theme.</Text>
              <p style={{ textAlign: 'justify' }}>Click on the "Enabled app embed" button below to open the Theme Editor page, toggle on our app to activate it, and click "Save".</p>
              <Button variant='primary'>Enable App Embed</Button>
            </BlockStack>
          </Card>
          <Card>
            <BlockStack align='space-between' gap={800} inlineAlign='center'>
              <img alt="" width="100%" height="100%" style={{ objectFit: 'cover', objectPosition: 'center', maxHeight: '300px' }} src={step_two} />
              <Text variant='headingMd' alignment='justify'>Step 2: Create your label.</Text>
              <p style={{ textAlign: 'justify' }}>Click on the "Labels" tab, then "Create" to start the process, and customize the label to suit your specific needs. If you wish to create more campaigns, select their respective tabs.</p>
              <Button variant='primary'>Create Label</Button>
            </BlockStack>
          </Card>
          <Card>
            <BlockStack align='space-between' gap={800} inlineAlign='center'>
              <img alt="" width="100%" height="100%" style={{ objectFit: 'cover', objectPosition: 'center', maxHeight: '300px' }} src={step_three} />
              <Text variant='headingMd' alignment='justify'>Step 3: Publish your label.</Text>
              <p style={{ textAlign: 'justify' }}>After customizing, make sure to save and activate the label so that it can appear on your store. If your label doesn't show up on your theme, please contact us to resolve the issue.</p>
              <Button variant='primary'>Manage Label</Button>
            </BlockStack>
          </Card>
        </InlineGrid>
        {/* <Grid> */}
        {/* <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}> */}
        <Card padding={600}>
          <InlineStack wrap={false} gap={400}>
            <Icon
              source={NoteIcon}
              tone="base"
            />
            <InlineStack gap={'1200'} wrap={false}>
              <BlockStack align='space-between' >
                <strong>Installation Guide</strong>
                <p>Easily install Shopify Badges and Labels. Check our installation guide for more details.</p>
              </BlockStack>
              <a href="https://www.blackbytt.in/" target='_blank'><button style={{}} className='ReadInstallationGuideButton'>Read Installation Guide</button></a>
            </InlineStack>
          </InlineStack>
        </Card>
        {/* </Grid.Cell> */}
        {/* <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}> */}
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
        {/* </Grid.Cell> */}
        {/* </Grid> */}

      </BlockStack>
    </Page>
  );
}
