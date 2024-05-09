import React, { useState, useCallback, useEffect } from 'react';
import { Page, Popover, ActionList, InlineStack, Text, Icon, RadioButton, Card, Link, Button, Checkbox } from '@shopify/polaris';
import { ButtonPressIcon } from '@shopify/polaris-icons';
import { useLoaderData, useSubmit } from '@remix-run/react';
import { ANNUAL_PLAN, MONTHLY_PLAN, authenticate } from '../shopify.server';
import { json } from '@remix-run/node';
import '../styles/label.css'
import { PrismaClient } from '@prisma/client';
import { Modal } from '@shopify/app-bridge-react';
const prisma = new PrismaClient();
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
const cdnUrl = "https://blackbyttcdn.blr1.digitaloceanspaces.com";

function LabelProductMapping() {
  const [imageUrls, setImageUrls] = useState([]);

  useEffect(() => {
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

  const formData = await request.formData();
  const productHandle = formData.get('productHandle');
  const labelName = formData.get('badge_name');
  const labelUrl = formData.get('badge_url');
  const productId = formData.get('id')
  const displayPosition = formData.get('displayPosition')
  const displayPage = formData.get('displayPage')
  const productImageUrl = formData.get('productImageUrl')
  try {
    // Check if a label already exists for the given productHandle and shop
    const existingLabel = await prisma.badge.findUnique({
      where: {
        // Composite key
        id: productId,
        shop: shop

      }
    });

    if (existingLabel) {
      // Update existing label
      const updatedLabel = await prisma.badge.update({
        where: {
          id: productId,
          shop: shop
        }
        ,
        data: {
          badgeName: labelName,
          badgeUrl: labelUrl
        }
      });
      console.log("Updating existing label:", updatedLabel);
    } else {
      // Create new label
      const newLabel = await prisma.badge.create({
        data: {
          id: productId,
          isEnabled: true,
          displayPage: displayPage,
          displayPosition: displayPosition,
          productHandle: productHandle,
          productImageUrl: productImageUrl,
          badgeName: labelName,
          badgeUrl: labelUrl,
          shop: shop
        }
      });
      console.log("Creating new label:", newLabel);
    }
    return json({ ok: true, message: "Label processed successfully." });
  } catch (error) {
    console.error("Error processing label:", error);
    return new Response("Internal Server Error", error);
  }
}


export default function CreateLabelPage() {
  // States for each checkbox
  const { plan } = useLoaderData();
  const isOnPaidPlan = plan.name !== 'Free';
  const [selectImageState, setSelectImageState] = useState(plan)
  const [isProductPageChecked, setIsProductPageChecked] = useState(false);
  const [isHomePageChecked, setIsHomePageChecked] = useState(false);
  const [isCartPageChecked, setIsCartPageChecked] = useState(false);
  const [isAllImagesOnProductPageChecked, setAllImagesOnProductPageChecked] = useState(true);
  const [isSelectedImagesonProductChecked, setSelectedImagesonProductChecked] = useState(false)
  // Handlers for each checkbox
  const handleProductPageChange = useCallback((newChecked) => setIsProductPageChecked(newChecked), []);
  const handleHomePageChange = useCallback((newChecked) => setIsHomePageChecked(newChecked), []);
  const handleCartPageChange = useCallback((newChecked) => setIsCartPageChecked(newChecked), []);
  // Corrected handler for the radio button
  const handleAllImagesOnProductPageChange = useCallback(() => {
    // setAllImagesOnProductPageChecked(true);
  }, []);
  const handleSelectedImagesOnProductPageChange = useCallback(() => {
    // setAllImagesOnProductPageChecked(true);
  }, []);

  const [showImages, setShowImages] = useState(false);
  const imageUrls = LabelProductMapping();
  const [selectedLabelUrl, setSelectedLabelUrl] = useState('');
  const [selectedLabelName, setSelectedLabelName] = useState('')
  const [popoverActive, setPopoverActive] = useState(false);
  const [labelStyle, setLabelStyle] = useState({});
  const [activeIndex, setActiveIndex] = useState(null);

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
        setLabelStyle({ top: 'auto', left: '11px', maxWidth: '100px' });
        break;
      case 2:
        setLabelStyle({ top: 'auto', left: '200px', transform: 'translateX(-50%)', maxWidth: '100px' });
        break;
      case 3:
        setLabelStyle({ top: 'auto', right: '62px', maxWidth: '100px' });
        break;
      case 4:
        setLabelStyle({ top: '50%', left: '11px', transform: 'translateY(-50%)', maxWidth: '100px' });
        break;
      case 5:
        setLabelStyle({ top: '50%', left: '45%', transform: 'translate(-50%, -50%)', maxWidth: '100px' });
        break;
      case 6:
        setLabelStyle({ top: '50%', right: '62px', transform: 'translateY(-50%)', maxWidth: '100px' });
        break;
      case 7:
        setLabelStyle({ bottom: '5%', left: '11px', maxWidth: '100px' });
        break;
      case 8:
        setLabelStyle({ bottom: '5%', left: '45%', transform: 'translateX(-50%)', maxWidth: '100px' });
        break;
      case 9:
        setLabelStyle({ bottom: '5%', right: '62px', maxWidth: '100px' });
        break;
      default:
        setLabelStyle({});
        break;
    }
  }


  const togglePopoverActive = useCallback(
    () => setPopoverActive((popoverActive) => !popoverActive),
    []
  );


  const handleLabelChange = (labelUrl) => {
    const selectedLabel = imageUrls.find(image => image.value === labelUrl);
    if (selectedLabel) {
      setSelectedLabelUrl(selectedLabel.value);
      setSelectedLabelName(selectedLabel.label);
      togglePopoverActive(); // Close popover after selection
    }
  };

  const activator = (
    <Button fullWidth onClick={togglePopoverActive} disclosure>
      Select Label<Icon source={ButtonPressIcon} tone="base" />
    </Button>
  );

  // Function to render grid of images
  const renderGrid = (imageUrls) => {
    // Split the array of images into chunks of 3 for grid layout
    const rows = [];
    for (let i = 0; i < imageUrls.length; i += 3) {
      rows.push(imageUrls.slice(i, i + 3));
    }

    return rows.map((row, rowIndex) => (
      <InlineStack key={rowIndex} spacing="tight">
        {row.map((image, index) => (
          <button
            key={index}
            onClick={() => handleLabelChange(image.value)}
            style={{ background: 'none', border: 'none', padding: '0', cursor: 'pointer' }}
          >
            <img src={image.value} alt={image.label} style={{ maxWidth: '100px', margin: '5px' }} />
          </button>
        ))}
      </InlineStack>
    ));
  };

  const submit = useSubmit();
  function handleSave() {

    const data = {
      "badge_url": selectedLabelUrl,
      "badge_name": selectedLabelName || "",
      "productHandle": selectImageState.productHandle,
      "productImageUrl": selectImageState.productImage,
      "id": selectImageState.productId,
      "displayPosition": positionClasses[activeIndex],
      "displayPage": "All",
    }
    submit(data, { method: "post" });
    console.log(data)
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
              <div style={{ marginTop: '10px', marginBottom: '10px' }}>
                <Button onClick={selectProductImage}>Select Product</Button>
                <hr />
              </div>
              {/* {selectImageState.productImage && (
              <div style={{ position: 'relative', marginLeft: '60px', padding: '10px' }}>
                <img src={selectImageState.productImage} alt={selectImageState.productTitle} style={{ width: '400px', height: '300px' }} />
                {selectedLabelUrl && (
                  <img src={selectedLabelUrl} alt="Selected Label" style={{ position: 'absolute', top: '0', right: '0', maxWidth: '100px' }} />
                )}
              </div>
            )} */}
              {selectImageState.productImage ? (
                <div style={{ position: 'relative', marginLeft: '60px', padding: '10px' }}>
                  <img src={selectImageState.productImage} alt={selectImageState.productTitle} style={{ width: '400px', height: '300px' }} />
                  {selectedLabelUrl && (
                    <img src={selectedLabelUrl} alt="Selected Label" style={{ position: 'absolute', ...labelStyle, maxWidth: '100px' }} />
                  )}
                </div>
              ) : ''}
              <hr />
              <div>
                <Button onClick={handleSave}>Save Mapping</Button>
              </div>
            </Card>
          </div>
        </div>
        <div>
          <Card>
            <Text as="h1" variant="bodyMd">
              Select and Optimize Label
            </Text>
            <div style={{ marginTop: '10px' }}>
              <Button variant='primary' fullWidth onClick={() => shopify.modal.show('my-modal')}>
                <InlineStack align='center' blockAlign='center' gap={200}>
                  Select Label
                  <Icon source={ButtonPressIcon} tone="base" />
                </InlineStack>
              </Button>
            </div>
            <div>
              <div className="grid-container">
                {Array.from({ length: 9 }, (_, index) => (
                  <div
                    key={index}
                    className={`grid-item ${positionClasses[index]} ${activeIndex === index ? 'active' : ''}`}
                    onClick={() => handleItemClick(index)}
                  >
                    <div className="grid-item-inner"></div>
                  </div>
                ))}
              </div>
            </div>


            <div className='label-page-selection' style={{ textAlign: 'left', marginTop: '10px' }}>
              <Text as="h3" variant="bodyMd" bold><strong>Show Label On</strong></Text>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Checkbox
                  label="Product Page"
                  checked={isProductPageChecked}
                  onChange={handleProductPageChange}
                />
                <Checkbox
                  label="Home Page"
                  checked={isHomePageChecked}
                  onChange={handleHomePageChange}
                />
                <Checkbox
                  label="Cart Page"
                  checked={isCartPageChecked}
                  onChange={handleCartPageChange}
                />
              </div>
              <hr />
            </div>
            <div className='image-for-label-selection' style={{ marginTop: '10px' }}>
              <Text as="h3" variant="bodyMd" bold><strong>On Pages Show Label on</strong></Text>
              <div>
                <RadioButton
                  label="All Images"
                  checked={isAllImagesOnProductPageChecked}
                  id="enabled"
                  // Since you want it always enabled, you don't provide a way to change its state
                  onChange={handleAllImagesOnProductPageChange}
                />
              </div>
              <div>
                <RadioButton
                  disabled={!isOnPaidPlan}
                  label="Selected Images"
                  checked={isSelectedImagesonProductChecked}
                  id="enabled"
                  // Since you want it always enabled, you don't provide a way to change its state
                  onChange={handleSelectedImagesOnProductPageChange}
                />
              </div>
              {isOnPaidPlan ? '' : <Link url="/app/payments">Upgrade</Link>}
              <hr />
            </div>
          </Card>
        </div>
      </div>
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

    </Page>
  );
}