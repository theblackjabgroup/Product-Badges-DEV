import '../styles/label.css'
import { json } from '@remix-run/node';
import { Modal, TitleBar } from '@shopify/app-bridge-react';
import { ButtonPressIcon, LockFilledIcon } from '@shopify/polaris-icons';
import { createOrUpdateBadge } from "../app.server"
import { useLoaderData, useSubmit } from '@remix-run/react';
import { ANNUAL_PLAN, MONTHLY_PLAN, authenticate } from '../shopify.server';
import React, { useState, useCallback, useEffect } from 'react';
import { Page, InlineStack, Text, Icon, Card, Button, Checkbox, BlockStack, Banner } from '@shopify/polaris';
import { usePlan } from './app.plancontext';


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



function LabelProductMapping() {

  const [imageUrls, setImageUrls] = useState([]);

  useEffect(() => {
    const cdnUrl = 'https://animated-character-badges-cdn-free.blr1.digitaloceanspaces.com'
    async function fetchData() {
      try {
        const response = await fetch(cdnUrl);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const xmlData = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlData, "text/xml");
        const results = Array.from(xmlDoc.querySelectorAll("Contents")).map(content => {
          const keyText = content.querySelector("Key").textContent;
          return {
            label: keyText,
            value: `${cdnUrl}/${keyText}`
          };
        });
        setImageUrls(results);
      } catch (error) {
        console.error('Error fetching and parsing XML:', error);
      }
    }
    fetchData();
  }, []);
  return imageUrls;
}


export async function action({ request }) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;
  try {
    const labelProductObjs = {
      ...Object.fromEntries(await request.formData()),
      shop,
    };
    console.log("object ", labelProductObjs)
    const arrayToIterate = [labelProductObjs];
    const result = createOrUpdateBadge(arrayToIterate);
    return result;
  } catch (error) {
    console.error("Error processing label:", error);
    return new Response("Internal Server Error", error);
  }
}


export default function CreateLabelPage() {

  const { hasActivePayment } = useLoaderData();

  const { isOnPaidPlan, setIsOnPaidPlan } = usePlan();

  console.log(isOnPaidPlan)

  useEffect(() => {
    setIsOnPaidPlan(hasActivePayment);
    // Update the context state

  }, [hasActivePayment, setIsOnPaidPlan]);



  // Fetch Paid Badges
  const [paidImageUrl, setPaidImageUrl] = useState([])
  useEffect(() => {
    const paidBadgesUrl = 'https://animated-character-badges-cdn-free.blr1.digitaloceanspaces.com'
    async function fetchPaidBadges() {
      try {
        const response = await fetch(paidBadgesUrl);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const xmlData = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlData, "text/xml");
        const results = Array.from(xmlDoc.querySelectorAll("Contents")).map(content => {
          const keyText = content.querySelector("Key").textContent;
          return {
            label: keyText,
            value: `${paidBadgesUrl}/${keyText}`
          };
        });
        setPaidImageUrl(results);
      } catch (error) {
        console.error('Error fetching and parsing XML:', error);
      }
    }
    fetchPaidBadges();
  }, [])

  const [selectImageState, setSelectImageState] = useState(isOnPaidPlan)

  // Checkboxes
  const [selectedDisplayPage, setSelectedDisplayPage] = useState(["All"]);
  const [isProductPageChecked, setIsProductPageChecked] = useState(true);
  const [isCollectionPageChecked, setIsCollectionPageChecked] = useState(true);
  const [isSearchResultPageChecked, setIsSearchResultPageChecked] = useState(true);
  const [isOtherPageChecked, setIsOtherPageChecked] = useState(true);
  const [isHomePageChecked, setIsHomePageChecked] = useState(true);
  const [isCartPageChecked, setIsCartPageChecked] = useState(true);

  const addPage = useCallback((page) => {
    setSelectedDisplayPage((prevPages) => [...prevPages, page]);
  }, []);

  const removePage = useCallback((page) => {
    setSelectedDisplayPage((prevPages) => prevPages.filter(p => p !== page));
  }, []);

  // Handlers for each checkbox
  const handleDisplayPageChange = useCallback((page, isChecked, setIsChecked) => {
    return () => {
      setIsChecked(!isChecked);
      if (isChecked) {
        removePage(page);
      } else {
        addPage(page);
      }
    };
  }, [addPage, removePage]);

  // Hover
  const [enableHover, setEnableHover] = useState(false);
  function handleHover() { setEnableHover(!enableHover) }

  const imageUrls = LabelProductMapping();
  const [selectedLabelUrl, setSelectedLabelUrl] = useState('');
  const [selectedLabelName, setSelectedLabelName] = useState('')
  const [labelStyle, setLabelStyle] = useState({ top: '0', left: '0', maxWidth: '100px' });
  const [activeIndex, setActiveIndex] = useState(0);

  const handleItemClick = (index) => {
    setActiveIndex(index); // Set the clicked item as active'
    handlePositionChange(index + 1);
  };
  const positionClasses = [
    'top-left', 'top-center', 'top-right',
    'middle-left', 'middle-center', 'middle-right',
    'bottom-left', 'bottom-center', 'bottom-right'
  ];

  const handlePositionChange = (position) => {
    switch (position) {
      case 1:
        setLabelStyle({ top: '0', left: '0', maxWidth: '100px' });
        break;
      case 2:
        setLabelStyle({ top: '0', left: '50%', transform: 'translateX(-50%)', maxWidth: '100px' });
        break;
      case 3:
        setLabelStyle({ top: '0', right: '0', maxWidth: '100px' });
        break;
      case 4:
        setLabelStyle({ top: '50%', left: '0', transform: 'translateY(-50%)', maxWidth: '100px' });
        break;
      case 5:
        setLabelStyle({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', maxWidth: '100px' });
        break;
      case 6:
        setLabelStyle({ top: '50%', right: '0', transform: 'translateY(-50%)', maxWidth: '100px' });
        break;
      case 7:
        setLabelStyle({ bottom: '0', left: '0', maxWidth: '100px' });
        break;
      case 8:
        setLabelStyle({ bottom: '0', left: '50%', transform: 'translateX(-50%)', maxWidth: '100px' });
        break;
      case 9:
        setLabelStyle({ bottom: '0', right: '0', maxWidth: '100px' });
        break;
      default:
        setLabelStyle({});
        break;
    }
  }

  const handleLabelChange = (labelUrl) => {
    const selectedLabel = imageUrls.find(image => image.value === labelUrl);
    if (selectedLabel) {
      setSelectedLabelUrl(selectedLabel.value);
      setSelectedLabelName(selectedLabel.label);
    }
  };

  const handleLabelChangeForPaidPlans = (labelUrl) => {
    const selectedLabel = paidImageUrl.find(image => image.value === labelUrl);
    if (isOnPaidPlan) {
      console.log("Badge Clicked: ", isOnPaidPlan)
      if (selectedLabel) {
        console.log("Badge Selected: ", isOnPaidPlan)
        setSelectedLabelUrl(selectedLabel.value);
        setSelectedLabelName(selectedLabel.label);
      }
    }
  }

  const submit = useSubmit();

  function handleSave() {
    if (selectImageState.productId && (selectedLabelUrl !== '')) {
      const data = {
        "badge_url": selectedLabelUrl,
        "badge_name": selectedLabelName || "",
        "productHandle": selectImageState.productHandle,
        "productImageUrl": selectImageState.productImage,
        "id": selectImageState.productId,
        "displayPosition": positionClasses[activeIndex],
        "displayPage": selectedDisplayPage,
        "enableHover": enableHover,
      };
      submit(data, { method: "post" })
      setTopBannerStatus('success')
      setTopBannerText("Saved Successfully")
      const timer = setTimeout(() => {
        setTopBannerStatus('info');
        setTopBannerText("Select Product and Label Before Saving")
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setTopBannerStatus('critical')
      const timer = setTimeout(() => {
        setTopBannerStatus('info');
        setTopBannerText("Select Product and Label Before Saving")
      }, 5000);
      return () => clearTimeout(timer);
    }
  }

  const handleSubmit = () => {
    handleSave()
  }

  async function selectProductImage() {
    const products = await window.shopify.resourcePicker({
      type: "product",
      action: "select", // customized action verb, either 'select' or 'add',
    });

    if (products) {
      const { images, id, title, handle } = products[0];

      // Extract the numerical part of the product ID
      const numericalId = id.split('/').pop();

      // Log the numerical part of the selected product's ID to the console
      console.log("Selected product numerical ID:", numericalId);

      setSelectImageState({
        ...selectImageState, // Use functional update to ensure we have the latest state
        productId: numericalId,
        productTitle: title,
        productHandle: handle,
        productAlt: images[0]?.altText,
        productImage: images[0]?.originalSrc,

      });
    }
  }

  const [topBannerStatus, setTopBannerStatus] = useState('info')
  const [topBannerText, setTopBannerText] = useState('Select Product and Label Before Saving.')


  return (
    <Page title="Create Label">
      <div className='grid' style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '10px' }}>
        <div className='product-view-card'>
          <Banner
              title={topBannerText}
              tone={topBannerStatus}>
            {selectImageState.productImage ? (
              <div style={{ position: 'relative', width: 'fit-content', height: 'fit-content', margin: '0 auto', padding: '0' }}>
                <img src={selectImageState.productImage} alt={selectImageState.productTitle} style={{ background: "rgba(0,0,0,0.5)", height: '450px', objectFit: "contain", objectPosition: 'center', boxShadow: 'var(--p-shadow-200)', borderRadius: 'var(--p-border-radius-300)', border: 'var(--p-border-width-0165) solid var(--p-color-border)' }} />
                {selectedLabelUrl && (
                  <img src={selectedLabelUrl} alt="Selected Label" style={{ position: 'absolute', ...labelStyle, maxWidth: '100px' }} />
                )}
              </div>
            ) :
              <div style={{ background: '#f0f0f0', height: '400px', width: '400px', margin: '0 auto', borderRadius: '9px', boxShadow: 'var(--p-shadow-0)' }}>
                <p style={{ fontSize: '2.5rem', display: "flex", alignItems: 'center', justifyContent: 'center', height: '100%', color: '#c0c0c0' }}>
                  Select Product
                </p>
              </div>
            }
            <div style={{ margin: '1rem auto' }}>
              <InlineStack align='center'>
                <Button variant='primary' onClick={selectProductImage}>Select Product</Button>
              </InlineStack>
            </div>
          </Banner>
        </div>
        <div>
          <Card>
            <BlockStack gap={400}>
              {/* <Text as="h1" variant="bodyMd">
                Select and Optimize Label
              </Text> */}

              <Button variant='primary' fullWidth onClick={() => shopify.modal.show('my-modal')}>
                <InlineStack align='center' blockAlign='center' gap={200}>
                  Select Label
                  <Icon source={ButtonPressIcon} tone="base" />
                </InlineStack>
              </Button>

              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', justifyContent: 'center' }}>
                  {Array.from({ length: 9 }, (_, index) => (
                    <div
                      key={index}
                      style={{ border: `1px solid ${activeIndex === index ? 'var(--p-color-bg-fill-info-active)' : '#b0b0b0'}`, width: '100%', height: '60px', borderRadius: '0.25rem', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', cursor: 'pointer', backgroundColor: `${activeIndex === index ? 'var(--p-color-bg-fill-info-active)' : 'white'}`, color: `${activeIndex === index ? '#fff' : 'var(--p-color-bg-fill-inverse-active)'}` }}
                      onClick={() => handleItemClick(index)}
                    >
                      {/* <div className="grid-item-inner"></div> */}
                      <p style={{ textTransform: 'capitalize', textAlign: 'center', fontWeight: 'bold', fontSize: '10px' }}>{positionClasses[index]}</p>
                    </div>
                  ))}
                </div>
              </div>
              <Text variant='headingMd'>
                CONDITIONS
              </Text>

              <InlineStack gap={400} blockAlign='center'>
                <p>Hover Effect</p>
                <label className="hoverSwitchContainer" style={{ cursor: 'pointer' }}>
                  <input type="checkbox" checked={enableHover} onChange={handleHover} />
                  <span className="slider"></span>
                </label>
              </InlineStack>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Checkbox
                  label="Product Page"
                  checked={isProductPageChecked}
                  onChange={handleDisplayPageChange("Product", isProductPageChecked, setIsProductPageChecked)}
                />
                <Checkbox
                  label="Collection Page"
                  checked={isCollectionPageChecked}
                  onChange={handleDisplayPageChange("Collection", isCollectionPageChecked, setIsCollectionPageChecked)}
                />
                <Checkbox
                  label="Search Result Page"
                  checked={isSearchResultPageChecked}
                  onChange={handleDisplayPageChange("Search", isSearchResultPageChecked, setIsSearchResultPageChecked)}
                />
                <Checkbox
                  label="Home Page"
                  checked={isHomePageChecked}
                  onChange={handleDisplayPageChange("Home", isHomePageChecked, setIsHomePageChecked)}
                />
                <Checkbox
                  label="Cart Page"
                  checked={isCartPageChecked}
                  onChange={handleDisplayPageChange("Cart", isCartPageChecked, setIsCartPageChecked)}
                />
                <Checkbox
                  label="Other Page"
                  checked={isOtherPageChecked}
                  onChange={handleDisplayPageChange("Other", isOtherPageChecked, setIsOtherPageChecked)}
                />
              </div>
              <InlineStack align='center'>
                <Button fullWidth={false} tone='success' variant='primary' onClick={handleSubmit}>Save</Button>
              </InlineStack>
            </BlockStack>
          </Card>
        </div>
      </div >

      <Modal id="my-modal">

        {/* <div style={{ display: 'flex', justifyContent: 'space-around', background: 'var(--p-color-bg-fill-info)', margin: '0.5rem 1rem', borderRadius: 'var(--p-border-radius-100)', }}>
          <button style={{ background: `${(view === 'Free') ? 'var(--p-color-bg-fill-info-active)' : 'none'}`, border: 'none', borderRadius: 'var(--p-border-radius-100)', padding: '0.25rem 2rem', fontWeight: 'bold', color: `${(view === 'Free' ? 'white' : 'var(--p-color-bg-fill-emphasis-hover)')}`, cursor: 'pointer' }} onClick={() => setView('Free')}>Select Label</button>
        </div> */}

        <TitleBar title='Select Badges and Labels' />

        <div>
          <div style={{ padding: '1rem 2rem' }}>
            <p style={{ fontWeight: 'bold', textDecoration: 'underline' }}>E-Commerce</p>
          </div>
          {
            (imageUrls)
              ?

              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', padding: '10px', justifyContent: 'center' }}>
                  {imageUrls.map((image, index) => (
                    <div key={index} style={{ position: 'relative', justifyContent: 'center', display: 'flex' }}>
                      <button
                        onClick={() => { handleLabelChange(image.value); shopify.modal.hide('my-modal') }}
                        style={{ background: 'none', aspectRatio: '1/1', border: 'none', padding: '0', cursor: 'pointer', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <img src={image.value} alt={image.label} style={{ maxWidth: '60px', maxHeight: '60px', margin: ' auto' }} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Paid Badges */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', padding: '10px', justifyContent: 'center' }}>
                  {paidImageUrl.map((image, index) => (
                    <div key={index} style={{ position: 'relative', justifyContent: 'center', display: 'flex' }}>
                      {
                        isOnPaidPlan
                          ?
                          <button
                            onClick={() => { handleLabelChangeForPaidPlans(image.value); shopify.modal.hide('my-modal') }}
                            style={{ background: 'none', border: 'none', padding: '0', cursor: 'pointer', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <img src={image.value} alt={image.label} style={{ maxWidth: '60px', maxHeight: '60px', margin: 'auto' }} />
                          </button>
                          :
                          <div style={{ position: 'relative' }}>
                            <button
                              disabled
                              style={{ opacity: '0.5', background: 'none', aspectRatio: '1/1', border: 'none', padding: '0', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                              <img src={image.value} alt={image.label} style={{ maxWidth: '60px', maxHeight: '60px', margin: ' auto' }} />
                            </button>
                            <div style={{ position: 'absolute', top: '0', right: '0' }}><Icon source={LockFilledIcon} tone="base" /></div>
                          </div>
                      }
                    </div>
                  ))}
                </div>
              </>
              :
              <div style={{ display: 'flex', alignContent: 'center', justifyContent: "center", padding: '2rem' }}>
                <Text variant='heading2xl'>
                  Error: Try Reloading The Page
                </Text>
              </div>
          }
        </div>
      </Modal>
    </Page >
  );
}
