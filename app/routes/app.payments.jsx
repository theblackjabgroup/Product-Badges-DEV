
import React, { useState, useCallback, useEffect } from 'react';
import { Page, Card, Layout, ButtonGroup, Button, Text, List, InlineStack, CalloutCard, Badge, Modal, DescriptionList} from '@shopify/polaris';
import { ANNUAL_PLAN, MONTHLY_PLAN, authenticate } from '../shopify.server';
import { useLoaderData } from '@remix-run/react';
import { json } from '@remix-run/node';
import { usePlan } from './app.plancontext';
import mixpanel from 'mixpanel-browser';




mixpanel.init('70551b6bed93424cd2c7eacf49a345c2', {debug: true, track_pageview: true});
mixpanel.identify('Yash');

export async function loader({ request }) {
  const { billing} = await authenticate.admin(request);
  
  try {
   
    const billingCheck = await billing.require({
      plans: [MONTHLY_PLAN, ANNUAL_PLAN],
      isTest: true,
    
      onFailure: () => {
        console.log('Shop does not have any active plans.');
        return json({ billing, plan: { name: "Free" }});
      },
    });
 
  
  
    
    const subscription = billingCheck.appSubscriptions[0];
    console.log(`Shop is on ${subscription.name} (id ${subscription.id})`);
    return json({ billing, plan: subscription});

  } catch (error) {
    
    console.error('Error fetching plan:', error);
    return json({ billing, plan: { name: "Free" }});
  }
}




export default function PaymentsPage() {
  const {plan} = useLoaderData(); // Load the plan data
 
  const [plan_item, setPlan] = useState('monthly');
  const [paidPrice, setPaidPrice] = useState(10);
  const [modalActive, setModalActive] = useState(false);
  
  // Determine if the user is on a paid plan
  // const isOnPaidPlan = plan.name !== 'Free';
  const { isOnPaidPlan, setIsOnPaidPlan } = usePlan();
  
  useEffect(() => {
    setIsOnPaidPlan(plan.name !== 'Free'); 
   // Update the context state
  
  }, [plan, setIsOnPaidPlan]);

 

  useEffect(() => {
    // Function to fetch and log the user details
    const fetchUser = async () => {
      try {
        const User = await shopify.user(); 
        console.log('User Details:', User);
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    // Check for the upgrade_initiated query parameter and log the message
    const url = new URL(window.location.href);
    const upgradeInitiated = url.searchParams.get('upgrade_initiated');

    if (upgradeInitiated && plan.name === 'Monthly Subscription') {
     mixpanel.track('Monthly Plan User')

      // Remove the upgrade_initiated query parameter from the URL
      url.searchParams.delete('upgrade_initiated');
      window.history.replaceState({}, document.title, url.toString());
    }
    else if (upgradeInitiated && plan.name === 'Annual Subscription') {
      mixpanel.track('Annual Plan User')
 
       // Remove the upgrade_initiated query parameter from the URL
       url.searchParams.delete('upgrade_initiated');
       window.history.replaceState({}, document.title, url.toString());
     }

  }, []);

  const upgradeButtonUrl = `/app/upgrade?plan_item=${plan_item}`;
  const cancelButtonUrl = `/app/cancel?plan_item=${plan_item}`;

  const [activeButtonIndex, setActiveButtonIndex] = useState(plan.name !== 'Monthly Subscription' ? 1 : 0);
 

  const handlePlanChange = (selected) => {
    setPlan(selected);
    setPaidPrice(selected === 'monthly' ? 10 : 90);
  };

  const handleClick = useCallback((index) => {
    setActiveButtonIndex(index); // Update active index based on clicked button
    handlePlanChange(index === 0 ? 'monthly' : 'yearly'); // Update plan based on index
  }, []);

  const handleModalChange = useCallback(() => setModalActive(!modalActive), [modalActive]);

  const handleCancelClick = () => {
    handleModalChange();
  };

const handleCancelAndRedirect = () => {
  setModalActive(false);
  mixpanel.track("Cancel button is clicked", {
    'name': "varun2"
  });
};
  



const handlePlanUpgrade = useCallback(() => {
  
  mixpanel.track("Upgrade button is clicked", {
    'name': "varun2"
  });

 }, []);





  return (
    <Page title="Pricing Plans">
      {modalActive && (
          <Modal
            open={modalActive}
            onClose={handleModalChange}
            title="Cancel Plan"
            primaryAction={{
              content: 'Cancel Plan',
              destructive: true,
              onAction: handleCancelAndRedirect,
              url: cancelButtonUrl
            }}
            
          >
           
            <Modal.Section>
              <div style={{ textAlign: 'center' }}>
                <img src='/images/Modalimg.png' width='135px' height='135px' alt='illustration' style={{ marginBottom: '20px' }} />
                <div style={{ textAlign: 'justify', marginLeft:'37.828px', marginRight:'37.828px' }}>
                <Text variant='bodyMd' fontWeight='semibold'>
                  By cancelling your plan, you will lose access to all premium features and benefits associated with your subscription. Your account will revert to the free plan, and any stored data or settings specific to premium features may be affected. Please ensure that you've downloaded or saved any important data before canceling.
                </Text>
                </div>
              </div>
            </Modal.Section>
            
          </Modal>
      )}
      <Card sectioned>
        <Layout>
            <Layout.Section>
            <div style={{ textAlign: 'center', marginBottom: '30px', marginTop:'30px'}}>
                <Text variant='headingXl' fontWeight='bold'> Plans and Pricing</Text>
                <Text variant='bodyLg' fontWeight='bold' tone='disabled'><div style={{marginTop:'10px'}} > Current Plan : {plan.name} </div> </Text>
                </div>
            </Layout.Section>
         
          <Layout.Section>
            <div style={{ display:'flex', justifyContent:'center',textAlign: 'center', marginBottom: '50px',}}>
              <ButtonGroup variant='segmented'>
                <Button
                  variant={activeButtonIndex === 0 ? 'primary' : undefined}
                  primary={plan_item === 'monthly'}
                  pressed={activeButtonIndex===0}
                  
                  onClick={function() 
                    {
                  handleClick(0);
                  }
                }
                >
                  Monthly
                </Button>
                <Button
                  variant={activeButtonIndex === 1 ? 'primary' : undefined}
                  primary={plan_item === 'yearly'}
                  pressed={activeButtonIndex === 1}
                  
                  onClick={function()
                    {
                     handleClick(1);
                    }
                  }
                >
                  Annually
                </Button>
              </ButtonGroup>
              </div>
          </Layout.Section>
          <div style={{position:'absolute', top: '135px', right: '240px'}}><img src='/images/discountTop.png' width='160px' height='43px'   /> </div>
          
          <Layout.Section>
            <InlineStack spacing="loose" alignment="center">
              <div style={{ position:'relative', padding: '20px', border: isOnPaidPlan ? '1px' : '1px solid #0269E3', borderRadius: '22px', marginLeft: '130px',height: '450px', width: '320px',boxShadow:'2px 2px 2px 2px grey'}}>
              {!isOnPaidPlan && <div style={{position: 'absolute', top: '50px', transform: 'translateY(-50%)', right: '105px'}}><Badge status="success" tone='info' >Current Plan</Badge></div>}
                <Text variant='heading2xl' fontWeight='bold'><div style={{color: '#000000', marginTop:'10px', marginLeft:'15px', marginBottom:'7px'}} >Basic</div></Text>
                <Text variant='heading2xl' fontWeight='bold'><div style={{color: '#F70000', marginLeft:'15px',marginBottom:'7px'}}>Free</div></Text>
                <Text variant='bodyLg' fontWeight='bold' tone='disabled'><div style={{ marginLeft:'15px',marginBottom:'30px'}}>"Experience essential features with our free plan, no strings attached."</div></Text>

                
                
                  <InlineStack><div style={{marginLeft:'13px'}}><img src='/images/listIcon.png' alt='illustration' /> </div><Text fontWeight='bold'>Upto 25 Static Labels</Text></InlineStack>
                  <InlineStack><div style={{marginLeft:'13px'}}><img src='/images/listIcon.png' alt='illustration' /> </div><Text fontWeight='bold'>Upto 25 Animated Labels</Text></InlineStack>
                  <InlineStack><div style={{marginLeft:'13px'}}><img src='/images/listIcon.png' alt='illustration' /> </div><Text fontWeight='bold'>Flexible Label Placement</Text></InlineStack>
                  <InlineStack><div style={{marginLeft:'13px'}}><img src='/images/listIcon.png' alt='illustration' /> </div><Text fontWeight='bold'>Unlimited Products</Text></InlineStack>
                
                
                <div style={{ textAlign: 'center', marginTop: '55px' }}>
                  <Button tone={ !isOnPaidPlan ? 'success' : undefined} disabled={!isOnPaidPlan}  url={cancelButtonUrl} variant={isOnPaidPlan ? 'secondary' : 'primary'} size='large' onClick={() => { handleCancelAndRedirect()}}>{ !isOnPaidPlan ? 'Select Plan' : 'Downgrade'}</Button>
                </div>
              </div>
              <div style={{position:'relative',padding: '20px', border: isOnPaidPlan ? '1px solid #0269E3' : '1px', borderRadius: '22px', marginLeft: '60px', height: '450px', width: '320px',boxShadow:'2px 2px 2px 2px grey'}}>
              <div>
              {plan.name==='Monthly Subscription' && activeButtonIndex === 0 && isOnPaidPlan && (<div style={{ position: 'absolute', top: '50px', transform: 'translateY(-50%)', right: '65px' }}><Badge status="success" tone='info' >Current Plan</Badge></div>)}
              {plan.name==='Annual Subscription' && activeButtonIndex === 1 && isOnPaidPlan && <div style={{ position: 'absolute', top: '50px', transform: 'translateY(-50%)', right: '65px' }}><Badge status="success" tone='info' >Current Plan</Badge></div>}
              
              
              </div>
               <div><Text variant='heading2xl' fontWeight='bold'><div style={{color: '#000000',marginTop:'10px', marginLeft:'15px', marginBottom:'7px'}} >Premium </div> </Text>
               
               <div style={{ display: 'flex', alignItems: 'center' }}>
                    {activeButtonIndex === 1 && (
                      <Text variant='heading2xl' fontWeight='bold'>
                        <div style={{ color: '#F70000', marginLeft: '15px', marginBottom: '7px', textDecoration:'line-through', textDecorationColor:'black', textDecorationThickness:'4px' }}>$120</div>
                      </Text>
                    )}
                    <Text variant='heading2xl' fontWeight='bold'>
                      <div style={{ color: '#F70000', marginLeft: '15px', marginBottom: '7px' }}>${paidPrice}</div>
                    </Text>
                  </div>
               
                
                <Text variant='bodyLg' fontWeight='bold' tone='disabled'><div style={{ marginLeft:'15px',marginBottom:'30px'}}>"Unlock premium benefits for unparalleled performance."</div></Text>
                
               
                <InlineStack><div style={{marginLeft:'13px'}}><img src='/images/listIcon.png' alt='illustration' /> </div><Text fontWeight='bold'>Upto 50 Static Labels</Text></InlineStack>
                <InlineStack><div style={{marginLeft:'13px'}}><img src='/images/listIcon.png' alt='illustration' /> </div><Text fontWeight='bold'>Upto 50 Animated Labels</Text></InlineStack>
                <InlineStack><div style={{marginLeft:'13px'}}><img src='/images/listIcon.png' alt='illustration' /> </div><Text fontWeight='bold'>Flexible Label Placement</Text></InlineStack>
                <InlineStack><div style={{marginLeft:'13px'}}><img src='/images/listIcon.png' alt='illustration' /> </div><Text fontWeight='bold'>Unlimited Products</Text></InlineStack>
    
               
                <div style={{ textAlign: 'center', marginTop: '55px' }}>
                 <Button tone={(activeButtonIndex===0 && plan.name==='Annual Subscription') ? undefined : 'success'} disabled={(activeButtonIndex===0 && plan.name==='Monthly Subscription') || (activeButtonIndex===1 && plan.name==='Annual Subscription')} url={upgradeButtonUrl} variant={(activeButtonIndex===0 && plan.name==='Annual Subscription') ? 'secondary' : 'primary'} size='large' onClick={() => { handlePlanUpgrade()}}>{(activeButtonIndex===0 && plan.name==='Annual Subscription') ? 'Downgrade' : 'Select Plan' }</Button>
                </div>
              </div>
              <div style={{top:'-59px', right:'-33px', position:'absolute'}}><img src='/images/discountOverlay.png' height='180px' width='180px' style={{ opacity: activeButtonIndex ? 1 : 0 }}  />
              </div>
              
              </div> 
            </InlineStack>
          </Layout.Section>
          
          <Layout.Section>
            <div style={{marginTop:'30px', marginBottom:'20px'}}>
            <CalloutCard
              title={<span style={{ color: 'red' }}><Text variant='headingMd'> {isOnPaidPlan ? "Want to cancel your plan?" :"Want to upgrade your plan?" } </Text></span>}

              illustration="/images/footerIcon.png"
              primaryAction={
                isOnPaidPlan
                  ? {
                      content: "Cancel Plan",
                      onAction: handleCancelClick,
                    }
                  : {
                      content: "Upgrade Plan",
                      url: upgradeButtonUrl,
                      onAction: handlePlanUpgrade
                    }
              }
            >
              {isOnPaidPlan ? (
                <p>
                  We understand that circumstances change, and we're here to help.
                </p>
              ) : (
                <p>
                  We understand that circumstances change, and we're here to help.
                </p>
              )}
            </CalloutCard>
            </div>
          </Layout.Section>
          
        </Layout>
      </Card>
    </Page>
  );
}






