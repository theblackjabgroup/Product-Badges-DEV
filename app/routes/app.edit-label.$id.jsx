import '../styles/label.css'
import { Modal } from '@shopify/app-bridge-react';
import { authenticate } from '../shopify.server';
import { PrismaClient } from '@prisma/client';
import { ButtonPressIcon } from '@shopify/polaris-icons';
import { createOrUpdateBadge } from '../app.server';
import { useLoaderData, useSubmit } from '@remix-run/react';
import React, { useState, useCallback, useEffect } from 'react';
import { Page, InlineStack, Text, Icon, Card, Button, Checkbox, Box, BlockStack } from '@shopify/polaris';
import { usePlan } from './app.plancontext'
const prisma = new PrismaClient();

export async function loader({ request, params }) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  const product = await prisma.badge.findUnique({
    where: {
      id: params.id,
      shop: shop
    }
  });
  return { product };
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

let cdnUrl

function LabelProductMapping() {
  const [imageUrls, setImageUrls] = useState([]);
  const isOnPaidPlan = usePlan()
  useEffect(() => {
    if (isOnPaidPlan) {
      cdnUrl = 'https://blackbyttpaidbadges.blr1.digitaloceanspaces.com'
    } else {
      cdnUrl = 'https://blackbyttcdn.blr1.digitaloceanspaces.com'
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
  }, [isOnPaidPlan]);
  return imageUrls;
}

export default function CreateLabelPage() {

  // Set Product
  const { product } = useLoaderData();

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

  const imageUrls = LabelProductMapping();
  const [selectedLabelUrl, setSelectedLabelUrl] = useState(product.badgeUrl);
  const [selectedLabelName, setSelectedLabelName] = useState('')
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
        setLabelStyle({ top: '0', left: '0', maxWidth: '100px' }
        );
        break;
      case 2:
        setLabelStyle({ top: '0', left: '50%', transform: 'translateX(-50%)', maxWidth: '100px' }
        );
        break;
      case 3:
        setLabelStyle({ top: '0', right: '0', maxWidth: '100px' });
        break;
      case 4:
        setLabelStyle({ top: '50%', left: '0', transform: 'translateY(-50%)', maxWidth: '100px' }
        );
        break;
      case 5:
        setLabelStyle({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', maxWidth: '100px' }
        );
        break;
      case 6:
        setLabelStyle({ top: '50%', right: '0', transform: 'translateY(-50%)', maxWidth: '100px' }
        );
        break;
      case 7:
        setLabelStyle({ bottom: '5px', left: '0', maxWidth: '100px' }
        );
        break;
      case 8:
        setLabelStyle({ bottom: '5px', left: '50%', transform: 'translateX(-50%)', maxWidth: '100px' }
        );
        break;
      case 9:
        setLabelStyle({ bottom: '5px', right: '0', maxWidth: '100px' }
        );
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
    const data = {
      "id": product.id,
      "badge_url": selectedLabelUrl,
      "badge_name": selectedLabelName || "",
      "productHandle": product.productHandle,
      "productImageUrl": product.productImageUrl,
      "displayPage": selectedDisplayPage,
      "displayPosition": positionClasses[activeIndex],
      "enableHover": product.enableHover,
    };
    submit(data, { method: "post" })
    console.log(data)
  }

  // Hover
  const [enableHover, setEnableHover] = useState(false);
  function handleHover() { setEnableHover(!enableHover) }


  return (
    <Page title="Edit Label">
      <div className='grid' style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '10px' }}>
        <div className='product-view-card'>
          <div style={{}}>
            <Card>
              <div style={{ position: 'relative', width: 'fit-content', height: 'fit-content', margin: '0 auto', padding: '0' }}>
                <img src={product.productImageUrl} alt={product.productHandle} style={{ background: "rgba(0,0,0,0.5)", height: '350px', objectFit: "contain", objectPosition: 'center' }} />
                {selectedLabelUrl && (
                  <img src={selectedLabelUrl} alt="Selected Label" style={{ position: 'absolute', ...labelStyle, maxWidth: '100px' }} />
                )}
              </div>
            </Card>
          </div>
        </div>
        <div>
          <Card>
            <BlockStack gap={600}>
              <div style={{ marginTop: '10px' }}>
                <InlineStack align='center' wrap={false} gap={200}>
                  <Button variant='primary' fullWidth onClick={() => shopify.modal.show('changeLabelModal')}>
                    <InlineStack align='center' blockAlign='center' gap={200}>
                      Change Label
                      <Icon source={ButtonPressIcon} tone="base" />
                    </InlineStack>
                  </Button>
                  <Button variant='primary' fullWidth onClick={() => shopify.modal.show('changeConditions')}>
                    Conditons
                  </Button>
                </InlineStack>
              </div>
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
              <InlineStack align='center'>
                <Button fullWidth={false} tone='success' variant='primary' onClick={handleSave}>Save</Button>
              </InlineStack>
            </BlockStack>
          </Card>
        </div>
      </div>

      {/* Label Change Modal  */}
      <Modal id="changeLabelModal">
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

      {/* Conditions Modal */}
      <Modal id="changeConditions">
        <Box padding={'600'}>
          <InlineStack gap={400} blockAlign='center'>
            <p>Hover Effect</p>
            <label className="hoverSwitchContainer">
              <input type="checkbox" checked={enableHover} onChange={handleHover} />
              <span className="slider"></span>
            </label>
          </InlineStack>
          <div className='label-page-selection' style={{ textAlign: 'left' }}>
            <Text as="h3" variant="bodyMd" bold ><strong style={{ color: 'blue' }}>Show Label On</strong></Text>

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
          </div>
        </Box>
      </Modal>

    </Page>
  );
}