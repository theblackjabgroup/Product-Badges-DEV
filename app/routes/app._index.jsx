
import { Banner, Icon, BlockStack, Button, Card, InlineGrid, InlineStack, Page, Text, Thumbnail } from '@shopify/polaris';
import step_one from '../assets/step_one.png'
import step_two from '../assets/step_two.png'
import step_three from '../assets/step_three.png'
import support from '../assets/1.png'
import mixpanel from 'mixpanel-browser';
import { usePlan } from './app.plancontext';
import { useEffect } from 'react';
import installation_guide from '../assets/installation_guide.jpeg'
import '../styles/label.css'
import { useNavigate, useLoaderData } from '@remix-run/react';
import { ANNUAL_PLAN, MONTHLY_PLAN, authenticate } from '../shopify.server';
import { json } from '@remix-run/node';
import {
  AlertTriangleIcon
} from '@shopify/polaris-icons';

// edit your token here
const TOKEN = 'YOUR_TOKEN'

// edit you user id here
const UserID = 'SHARAD_JADHAV'


// initialize mixpanel
mixpanel.init(TOKEN, { debug: true, track_pageview: true, ignore_dnt: true, ip: true });

// Set User Id
mixpanel.identify(UserID)

export async function loader({ request }) {
  const { billing } = await authenticate.admin(request);

  try {

    const { hasActivePayment } = await billing.check({
      plans: [MONTHLY_PLAN, ANNUAL_PLAN],
      isTest: true,
    });

    return json({ billing, hasActivePayment });

  } catch (error) {

    console.error('Error fetching plan:', error);
    return json({ billing });
  }
}



export default function Index() {

  const { hasActivePayment } = useLoaderData();

  const { isOnPaidPlan, setIsOnPaidPlan } = usePlan();

  useEffect(() => {
    setIsOnPaidPlan(hasActivePayment);
    // Update the context state

  }, [hasActivePayment, setIsOnPaidPlan]);


  // For Navigation
  const navigate = useNavigate()

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



  console.log('Index file isOnPaidPlan: ', isOnPaidPlan);

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
    <>
      <Page>
        <div style={{margin:'1rem 0rem'}}>
          <Banner  title={<>If you have theme compatibility difficulties or other concerns, please do not hesitate to contact <span>theblackjabgroup@gmail.com.</span></>} tone='warning'/>
        </div>
        <BlockStack gap="400">
          <Text variant="headingXl" as="h4">
            Welcome to Our Product Badges and Labels
          </Text>

          <InlineGrid gap="400" columns={3}>
            <Card>
              <BlockStack align='space-between' gap={800} inlineAlign='center'>
                <img alt="" width="100%" height="100%" style={{ objectFit: 'cover', objectPosition: 'center', maxHeight: '300px' }} src={step_one} />
                <Text variant='headingMd' alignment='justify'>Step 1 : Integrate our app into your Shopify theme.</Text>
                <p style={{ textAlign: 'justify' }}>To enter the Theme Editor page, click the "Enabled app embed" button below, then activate our app and click "Save".</p>
                <div style={{ margin: '1.15rem auto' }}>
                  <Button variant='primary' target='_blank' url='https://admin.shopify.com/admin/themes/current/editor?context=apps&template=index'>Enable App Embed</Button>
                </div>
              </BlockStack>
            </Card>
            <Card>
              <InlineStack blockAlign='end'>
                <BlockStack align='space-between' gap={800} inlineAlign='center'>
                  <img alt="" width="100%" height="100%" style={{ objectFit: 'cover', objectPosition: 'center', maxHeight: '300px' }} src={step_two} />
                  <Text variant='headingMd' alignment='justify'>Step 2: Create your label.</Text>
                  <p style={{ textAlign: 'justify' }}>To begin the procedure, click the "Labels" tab, then "Create Labels," then personalize the label to meet your individual requirements.</p>
                  <div style={{ margin: '1.15rem auto' }}>
                    <Button variant='primary' onClick={() => navigate('./create-label')}>Create Label</Button>
                  </div>
                </BlockStack>
              </InlineStack>
            </Card>
            <Card>
              <BlockStack align='space-between' gap={800} inlineAlign='center'>
                <img alt="" width="100%" height="100%" style={{ objectFit: 'cover', objectPosition: 'center', maxHeight: '300px' }} src={step_three} />
                <Text variant='headingMd' alignment='justify'>Step 3: Publish your label.</Text>
                <p style={{ textAlign: 'justify' }}>After you've finished designing the label, be sure to save and activate it so that it appears on your shop. If your label does not appear on your theme, please contact us to fix the problem.</p>
                <Button variant='primary' onClick={() => navigate('./labels')}>Manage Label</Button>
              </BlockStack>
            </Card>
          </InlineGrid>
          {/* <Grid> */}
          {/* <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}> */}
          <Card padding={600}>
            <InlineStack gap={400}>
              <Thumbnail size='medium' source={installation_guide} />
              <InlineStack gap={'1200'} wrap={false} blockAlign='center'>
                <BlockStack align='start' >
                  <strong>Installation Guide</strong>
                  <p>Easily install Shopify Badges and Labels. Check our installation guide for more details.</p>
                </BlockStack>
                {/* <Button size='micro' variant='primary'>Read Installation Guide</Button> */}
                <a href="https://www.blackbytt.in/installation-guide-1" rel="noreferrer" target='_blank'><button style={{ cursor: 'pointer', display: 'inline-flex', boxSizing: 'border-box', boxShadow: 'var(--p-shadow-button-primary-inset)', background: 'var(--p-color-button-gradient-bg-fill), var(--p-color-bg-fill-brand)', padding: 'var(--p-space-150) var(--p-space-300)', border: 'none', borderRadius: 'var(--p-border-radius-200)', fontFamily: 'var(--p-font-family-sans)', color: 'var(--p-color-text-brand-on-bg-fill)' }} className=''>Read Installation Guide</button></a>
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
    </>
  );
}