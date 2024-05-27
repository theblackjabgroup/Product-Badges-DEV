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
  const { plan} = useLoaderData(); // Load the plan data
 
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

  const [activeButtonIndex, setActiveButtonIndex] = useState(0);
  var cancelButtonCount =0;
  var upgradeButtonCount=0;

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
  cancelButtonCount= cancelButtonCount + 1;
  mixpanel.track("Cancel button is clicked", {
    'name': "varun2",
    'CancelClickCount': cancelButtonCount
  });
};
  



const handlePlanUpgrade = useCallback(() => {
  upgradeButtonCount= upgradeButtonCount + 1;
  mixpanel.track("Upgrade button is clicked", {
    'name': "varun2",
    'UpgradeClickCount': upgradeButtonCount
  });
  
 }, [upgradeButtonCount]);





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
                <img src='/images/4.png' width='135px' height='135px' alt='illustration' style={{ marginBottom: '20px' }} />
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
            <div style={{ textAlign: 'center', marginBottom: '20px', marginTop:'30px'}}>
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
                  style={{backgroundColor: activeButtonIndex=== 0 ? '#0269E3' : '#B4D6FE', importance:'important'}}
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
                  style={{backgroundColor: activeButtonIndex=== 1 ? '#0269E3' : '#B4D6FE', importance:'important'}}
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
          <div style={{position:'absolute', top: '125px', right: '300px'}}><img src='/images/5.png' width='94px' height='51px'   /> </div>
          
          <Layout.Section>
            <InlineStack spacing="loose" alignment="center">
              <div style={{ position:'relative', padding: '20px', border: isOnPaidPlan ? '1px' : '1px solid #0269E3', borderRadius: '22px', marginLeft: '130px',height: '450px', width: '320px',boxShadow:'2px 2px 2px 2px grey'}}>
              {!isOnPaidPlan && <div style={{position: 'absolute', top: '50px', transform: 'translateY(-50%)', right: '105px'}}><Badge status="success" tone='info' >Current Plan</Badge></div>}
                <Text variant='heading2xl' fontWeight='bold'><div style={{color: '#000000', marginTop:'10px', marginLeft:'15px', marginBottom:'7px'}} >Basic</div></Text>
                <Text variant='heading2xl' fontWeight='bold'><div style={{color: '#F70000', marginLeft:'15px',marginBottom:'7px'}}>Free</div></Text>
                <Text variant='bodyLg' fontWeight='bold' tone='disabled'><div style={{ marginLeft:'15px',marginBottom:'30px'}}>"Experience essential features with our free plan, no strings attached."</div></Text>

                
                
                  <InlineStack><div style={{marginLeft:'13px'}}><img src='/images/2.png' alt='illustration' /> </div><Text fontWeight='bold'>Upto 20 Labels</Text></InlineStack>
                  <InlineStack><div style={{marginLeft:'13px'}}><img src='/images/2.png' alt='illustration' /> </div><Text fontWeight='bold'>Flexible Label Placement</Text></InlineStack>
                  <InlineStack><div style={{marginLeft:'13px'}}><img src='/images/2.png' alt='illustration' /> </div><Text fontWeight='bold'>Upto 5 Products</Text></InlineStack>
                
                
                <div style={{ textAlign: 'center', marginTop: '90px' }}>
                  <Button tone='success' disabled={!isOnPaidPlan}  url={isOnPaidPlan ? cancelButtonUrl : '/app/payments'} variant='primary' size='large'>Switch to free</Button>
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
                        <div style={{ color: '#F70000', marginLeft: '15px', marginBottom: '7px', textDecoration:'line-through', textDecorationColor:'black', textDecorationThickness:'4px' }}>$100</div>
                      </Text>
                    )}
                    <Text variant='heading2xl' fontWeight='bold'>
                      <div style={{ color: '#F70000', marginLeft: '15px', marginBottom: '7px' }}>${paidPrice}</div>
                    </Text>
                  </div>
               
                
                <Text variant='bodyLg' fontWeight='bold' tone='disabled'><div style={{ marginLeft:'15px',marginBottom:'30px'}}>"Unlock premium benefits for unparalleled performance."</div></Text>
                
               
                <InlineStack><div style={{marginLeft:'13px'}}><img src='/images/2.png' alt='illustration' /> </div><Text fontWeight='bold'>Upto 100 Labels</Text></InlineStack>
                <InlineStack><div style={{marginLeft:'13px'}}><img src='/images/2.png' alt='illustration' /> </div><Text fontWeight='bold'>40+ Animated Labels</Text></InlineStack>
                <InlineStack><div style={{marginLeft:'13px'}}><img src='/images/2.png' alt='illustration' /> </div><Text fontWeight='bold'>Flexible Label Placement</Text></InlineStack>
                <InlineStack><div style={{marginLeft:'13px'}}><img src='/images/2.png' alt='illustration' /> </div><Text fontWeight='bold'>Upto 20 Products</Text></InlineStack>
    
               
                <div style={{ textAlign: 'center', marginTop: '55px' }}>
                  <Button tone='success' disabled={isOnPaidPlan} url={upgradeButtonUrl} variant='primary' size='large' onClick={() => { handlePlanUpgrade()}}>Upgrade to Pro</Button>
                </div>
              </div>
              <div style={{top:'-12px', right:'-24px', position:'absolute'}}><img src='/images/3.png' height='90px' width='135px' style={{ opacity: activeButtonIndex ? 1 : 0 }}  />
              </div>
              
              </div> 
            </InlineStack>
          </Layout.Section>
          <Layout.Section>
            <CalloutCard
              title={<span style={{ color: 'red' }}><Text variant='headingMd'> {isOnPaidPlan ? "Want to cancel your plan?" :"Want to upgrade your plan?" } </Text></span>}

              illustration="/images/1.png"
              primaryAction={
                isOnPaidPlan
                  ? {
                      content: "Cancel Plan",
                      onAction: handleCancelClick,
                    }
                  : {
                      content: "Upgrade Plan",
                      url: upgradeButtonUrl,
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
          </Layout.Section>
        </Layout>
      </Card>
    </Page>
  );
}



// import React, { useState, useCallback } from 'react';
// import { Page, Card, Layout, ButtonGroup, Button, Text, List, InlineStack, CalloutCard, Badge } from '@shopify/polaris';
// import { ANNUAL_PLAN, MONTHLY_PLAN, authenticate } from '../shopify.server';
// import { useLoaderData } from '@remix-run/react';
// import { json } from '@remix-run/node';

// export async function loader({ request }) {
//   const { billing } = await authenticate.admin(request);

//   try {
//     const billingCheck = await billing.require({
//       plans: [MONTHLY_PLAN, ANNUAL_PLAN],
//       isTest: true,
//       onFailure: () => {
//         console.log('Shop does not have any active plans.');
//         return json({ billing, plan: { name: "Free" } });
//       },
//     });

//     const subscription = billingCheck.appSubscriptions[0];
//     console.log(`Shop is on ${subscription.name} (id ${subscription.id})`);
//     return json({ billing, plan: subscription });
//   } catch (error) {
//     console.error('Error fetching plan:', error);
//     return json({ billing, plan: { name: "Free" } });
//   }
// }

// export default function PaymentsPage() {
//   const { plan } = useLoaderData(); // Load the plan data
//   const [planItem, setPlan] = useState('monthly');
//   const [paidPrice, setPaidPrice] = useState(44.00);
//   const [activeButtonIndex, setActiveButtonIndex] = useState(0);
//   const [isBasicPlanActive, setIsBasicPlanActive] = useState(plan.name === 'Free');
//   const [isPremiumPlanActive, setIsPremiumPlanActive] = useState(plan.name !== 'Free');

//   // Determine if the user is on a paid plan
//   const isOnPaidPlan = plan.name !== 'Free';
//   const upgradeButtonUrl = `/app/upgrade?plan_item=${planItem}`;
//   const cancelButtonUrl = `/app/cancel?plan_item=${planItem}`;

//   const handlePlanChange = (selected) => {
//     setPlan(selected);
//     setPaidPrice(selected === 'monthly' ? 40 : 1044);
//   };

//   const handleClick = useCallback((index) => {
//     setActiveButtonIndex(index); // Update active index based on clicked button
//     handlePlanChange(index === 0 ? 'monthly' : 'yearly'); // Update plan based on index
//   }, []);

//   const handleUpgrade = async (planType) => {
//     // Simulate billing approval process
//     const billingApproved = true; // Replace with actual billing approval logic

//     if (billingApproved) {
//       if (planType === 'basic') {
//         setIsBasicPlanActive(true);
//         setIsPremiumPlanActive(false);
//       } else if (planType === 'premium') {
//         setIsBasicPlanActive(false);
//         setIsPremiumPlanActive(true);
//       }
//     }
//   };

//   const handleCancel = async () => {
//     // Simulate billing cancellation process
//     const billingCanceled = true; // Replace with actual billing cancellation logic

//     if (billingCanceled) {
//       setIsBasicPlanActive(false);
//       setIsPremiumPlanActive(false);
//     }
//   };

//   return (
//     <Page title="Pricing Plans">
//       <Card sectioned>
//         <Layout>
//           <Layout.Section>
//             <div style={{ textAlign: 'center', marginBottom: '20px', marginTop: '30px' }}>
//               <Text variant='headingXl' fontWeight='bold'>Plans and Pricing</Text>
//               <Text variant='bodyLg' fontWeight='bold' tone='disabled'>
//                 <div style={{ marginTop: '10px' }}>Current Plan: {plan.name}</div>
//               </Text>
//             </div>
//           </Layout.Section>
//           <Layout.Section>
//             <div style={{ display: 'flex', justifyContent: 'center', textAlign: 'center', marginBottom: '50px' }}>
//               <ButtonGroup variant='segmented'>
//                 <Button
//                   primary={planItem === 'monthly'}
//                   pressed={activeButtonIndex === 0}
//                   style={{ backgroundColor: activeButtonIndex === 0 ? '#0269E3' : '#B4D6FE', importance: 'important' }}
//                   onClick={() => handleClick(0)}
//                 >
//                   Monthly
//                 </Button>
//                 <Button
//                   primary={planItem === 'yearly'}
//                   pressed={activeButtonIndex === 1}
//                   style={{ backgroundColor: activeButtonIndex === 1 ? '#0269E3' : '#B4D6FE', importance: 'important' }}
//                   onClick={() => handleClick(1)}
//                 >
//                   Annually
//                 </Button>
//               </ButtonGroup>
//             </div>
//           </Layout.Section>
//           <Layout.Section>
//             <InlineStack spacing="loose" alignment="center">
//               <div style={{ padding: '20px', border: '3px', borderRadius: '22px', marginLeft: '130px', height: '450px', width: '320px', boxShadow:'1px 1px 1px 1px grey', borderColor: 'ActiveBorder' }}>
//                 {isBasicPlanActive && isOnPaidPlan && <Badge status="success" style={{ position: 'absolute', top: '10px', right: '10px' }}>Active</Badge>}
//                 <Text variant='heading2xl' fontWeight='bold'>
//                   <div style={{ color: '#000000', marginTop: '10px', marginLeft: '15px', marginBottom: '7px' }}>Basic</div>
//                 </Text>
//                 <Text variant='heading2xl' fontWeight='bold'>
//                   <div style={{ color: '#F70000', marginLeft: '15px', marginBottom: '7px' }}>Free</div>
//                 </Text>
//                 <Text variant='bodyLg' fontWeight='bold' tone='disabled'>
//                   <div style={{ marginLeft: '15px', marginBottom: '30px' }}>"Experience essential features with our free plan, no strings attached."</div>
//                 </Text>
//                 <List type='none'>
//                   <List.Item>
//                     <InlineStack>
//                       <div><img src='/images/2.png' alt='illustration' /></div>
//                       <Text fontWeight='bold'>Upto 20 Labels</Text>
//                     </InlineStack>
//                   </List.Item>
//                   <List.Item>
//                     <InlineStack>
//                       <div><img src='/images/2.png' alt='illustration' /></div>
//                       <Text fontWeight='bold'>Flexible Label Placement</Text>
//                     </InlineStack>
//                   </List.Item>
//                   <List.Item>
//                     <InlineStack>
//                       <div><img src='/images/2.png' alt='illustration' /></div>
//                       <Text fontWeight='bold'>Upto 5 Products</Text>
//                     </InlineStack>
//                   </List.Item>
//                 </List>
//                 <div style={{ textAlign: 'center', marginTop: '90px' }}>
//                   <Button tone='success' disabled={isBasicPlanActive} onClick={() => handleUpgrade('basic')} url={upgradeButtonUrl} variant='primary' size='large'>Join for free</Button>
//                 </div>
//               </div>
//               <div style={{ position: 'relative', padding: '20px', border: '3px', borderRadius: '22px', marginLeft: '60px', height: '450px', width: '320px', boxShadow:'1px 1px 1px 1px grey' }}>
//                 {isPremiumPlanActive && isOnPaidPlan && <Badge status="success" style={{ position: 'absolute', top: '10px', right: '10px' }}>Active</Badge>}
//                 <Text variant='heading2xl' fontWeight='bold'>
//                   <div style={{ color: '#000000', marginTop: '10px', marginLeft: '15px', marginBottom: '7px', letterSpacing: '3px' }}>Premium</div>
//                 </Text>
//                 <Text variant='heading2xl' fontWeight='bold'>
//                   <div style={{ color: '#F70000', marginLeft: '15px', marginBottom: '7px' }}>${paidPrice}</div>
//                 </Text>
//                 <Text variant='bodyLg' fontWeight='bold' tone='disabled'>
//                   <div style={{ marginLeft: '15px', marginBottom: '30px' }}>"Unlock premium benefits for unparalleled performance."</div>
//                 </Text>
//                 <List type="bullet">
//                   <List.Item>
//                     <InlineStack>
//                       <div><img src='/images/2.png' alt='illustration' /></div>
//                       <Text fontWeight='bold'>Upto 100 Labels</Text>
//                     </InlineStack>
//                   </List.Item>
//                   <List.Item>
//                     <InlineStack>
//                       <div><img src='/images/2.png' alt='illustration' /></div>
//                       <Text fontWeight='bold'>40+ Animated Labels</Text>
//                     </InlineStack>
//                   </List.Item>
//                   <List.Item>
//                     <InlineStack>
//                       <div><img src='/images/2.png' alt='illustration' /></div>
//                       <Text fontWeight='bold'>Flexible Label Placement</Text>
//                     </InlineStack>
//                   </List.Item>
//                   <List.Item>
//                     <InlineStack>
//                       <div><img src='/images/2.png' alt='illustration' /></div>
//                       <Text fontWeight='bold'>Upto 20 Products</Text>
//                     </InlineStack>
//                   </List.Item>
//                 </List>
//                 <div style={{ textAlign: 'center', marginTop: '55px' }}>
//                   <Button tone='success' disabled={isPremiumPlanActive} onClick={() => handleUpgrade('premium')} url={upgradeButtonUrl} variant='primary' size='large'>Upgrade to Pro</Button>
//                 </div>
//               </div>
//             </InlineStack>
//           </Layout.Section>
//           <Layout.Section>
//             <CalloutCard
//               title={<span style={{ color: 'red' }}><Text variant='headingMd'>{isOnPaidPlan ? "Want to cancel your plan?" : "Want to upgrade your plan?"}</Text></span>}
//               illustration="/images/1.png"
//               primaryAction={{
//                 content: isOnPaidPlan ? "Cancel Plan" : "Upgrade Plan",
//                 url: cancelButtonUrl,
//                 onAction: isOnPaidPlan ? handleCancel : () => handleUpgrade('premium')
//               }}
//             >
//               <p>
//                 We understand that circumstances change, and we're here to help.
//               </p>
//             </CalloutCard>
//           </Layout.Section>
//         </Layout>
//       </Card>
//     </Page>
//   );
// }

