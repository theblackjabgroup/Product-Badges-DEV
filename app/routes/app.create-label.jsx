import '../styles/label.css'
import { json } from '@remix-run/node';
import { Modal } from '@shopify/app-bridge-react';
import { ButtonPressIcon } from '@shopify/polaris-icons';
import { useLoaderData, useSubmit } from '@remix-run/react';
import { ANNUAL_PLAN, MONTHLY_PLAN, authenticate } from '../shopify.server';
import React, { useState, useCallback, useEffect } from 'react';
import { Page, InlineStack, Text, Icon, Card, Button, Checkbox, BlockStack } from '@shopify/polaris';
import { createOrUpdateBadge } from "../app.server"



export async function loader({ request }) {
  const { billing } = await authenticate.admin(request);
  let plan = { name: "Free" };

  // Check if the shop has an active payment for any plan
  try {
    const billingCheck = await billing.require({
      plans: [MONTHLY_PLAN, ANNUAL_PLAN],
      isTest: true,
      onFailure: () => {
        console.log('Shop does not have any active plans.');
        return json({ billing });
      },
    });

    const subscription = billingCheck.appSubscriptions[0];
    console.log(`Shop is on ${subscription.name} (id ${subscription.id})`);
    plan = subscription;
  } catch (error) {
    console.error('Error fetching plan:', error);
  }

  // Return both imageUrl and plan in the JSON response
  return json({ plan });
}




function LabelProductMapping() {

  const { plan } = useLoaderData();
  const isOnPaidPlan = plan.name !== 'Free';

  const [imageUrls, setImageUrls] = useState([]);

  const [cdnUrl, setCdnurl] = useState(null)

  useEffect(() => {

    if (!isOnPaidPlan) {
      setCdnurl('https://blackbyttpaidbadges.blr1.digitaloceanspaces.com')
    } else {
      setCdnurl('https://blackbyttcdn.blr1.digitaloceanspaces.com')
    }

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
  }, [isOnPaidPlan, cdnUrl]);

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

  const { plan } = useLoaderData();

  const isOnPaidPlan = plan.name !== 'Free';
  console.log(isOnPaidPlan)

  const [selectImageState, setSelectImageState] = useState(plan)

  // Checkboxes
  const [selectedDisplayPage, setSelectedDisplayPage] = useState(["All"]);
  const [isProductPageChecked, setIsProductPageChecked] = useState(false);
  const [isCollectionPageChecked, setIsCollectionPageChecked] = useState(false);
  const [isSearchResultPageChecked, setIsSearchResultPageChecked] = useState(false);
  const [isOtherPageChecked, setIsOtherPageChecked] = useState(false);
  const [isHomePageChecked, setIsHomePageChecked] = useState(false);
  const [isCartPageChecked, setIsCartPageChecked] = useState(false);


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

  const [showImages, setShowImages] = useState(false);
  const imageUrls = LabelProductMapping();
  const [selectedLabelUrl, setSelectedLabelUrl] = useState('');
  const [selectedLabelName, setSelectedLabelName] = useState('')
  const [labelStyle, setLabelStyle] = useState({});
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
      console.log(data)
      shopify.toast.show("Saved")
    } else {
      shopify.toast.show("Error: Please select product and label before saving")
    }
  }


  const handleSubmit = () => {
    handleSave()
  }

  const handleSelectLabelClick = () => {
    setShowImages(!showImages);
  };


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




  return (
    <Page title="Create Label">
      <div className='grid' style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '10px' }}>
        <div className='product-view-card'>
          <Card>
            <Text as="h1" variant="bodyMd">
              Product View
            </Text>
          </Card>
          <div style={{ marginTop: '20px' }}>
            <Card>
              {selectImageState.productImage ? (
                <div style={{ position: 'relative', width: 'fit-content', height: 'fit-content', margin: '0 auto', padding: '0' }}>
                  <img src={selectImageState.productImage} alt={selectImageState.productTitle} style={{ background: "rgba(0,0,0,0.5)", height: '350px', objectFit: "contain", objectPosition: 'center' }} />
                  {selectedLabelUrl && (
                    <img src={selectedLabelUrl} alt="Selected Label" style={{ position: 'absolute', ...labelStyle, maxWidth: '100px' }} />
                  )}
                </div>
              ) : <img src='https://dummyimage.com/400x400/f2f2f2/b0b0b0.jpg&text=select+product' alt='select-product' style={{ width: '100%', maxHeight: '400px', margin: '0 auto', objectFit: "contain", objectPosition: 'center' }} />}
              <div style={{ margin: '1rem auto' }}>
                <InlineStack align='center'>
                  <Button variant='primary' onClick={selectProductImage}>Select Product</Button>
                </InlineStack>
              </div>
            </Card>
          </div>
        </div>
        <div>
          <Card>
            <BlockStack gap={400}>
              <Text as="h1" variant="bodyMd">
                Select and Optimize Label
              </Text>

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
                      style={{ border: `1px solid ${activeIndex === index ? '#0269E3' : '#b0b0b0'}`, width: '100%', height: '60px', borderRadius: '0.25rem', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', cursor: 'pointer', backgroundColor: `${activeIndex === index ? '#0269E3' : 'white'}`, color: `${activeIndex === index ? '#fff' : 'black'}` }}
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
                <label className="hoverSwitchContainer">
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', padding: '10px' }}>
          {imageUrls.map((image, index) => (
            <button
              key={index}
              onClick={() => { handleLabelChange(image.value); shopify.modal.hide('my-modal') }}
              style={{ background: 'none', border: 'none', padding: '0', cursor: 'pointer' }}
            >
              <img src={image.value} alt={image.label} style={{ maxWidth: '100%', maxHeight: '60px', margin: '5px' }} />
            </button>
          ))}
        </div>
      </Modal>
    </Page >
  );
}