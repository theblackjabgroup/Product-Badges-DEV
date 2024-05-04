import React, { useState, useCallback ,useEffect} from 'react';
import { Page,Text, Icon, RadioButton, Card,Link, Button,Checkbox } from '@shopify/polaris';
import { ButtonPressIcon } from '@shopify/polaris-icons';
import { useLoaderData, useSubmit } from '@remix-run/react';
import { ANNUAL_PLAN, MONTHLY_PLAN, authenticate } from '../shopify.server';
import { json } from '@remix-run/node';
import { PrismaClient } from '@prisma/client';
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
        return json({ billing});
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
    const labelName = formData.get('label_name');
    const labelUrl = formData.get('label_url');

    try {
        // Check if a label already exists for the given productHandle and shop
        const existingLabel = await prisma.label.findUnique({
            where: {
               // Composite key
                    productHandle: productHandle,
                    shop: shop
                
            }
        });

        if (existingLabel) {
            // Update existing label
            const updatedLabel = await prisma.label.update({
                where: {
                   
                        productHandle: productHandle,
                        shop: shop
                    }
                ,
                data: {
                    labelName: labelName,
                    labelUrl: labelUrl
                }
            });
            console.log("Updating existing label:", updatedLabel);
        } else {
            // Create new label
            const newLabel = await prisma.label.create({
                data: {
                    productHandle: productHandle,
                    labelName: labelName,
                    labelUrl: labelUrl,
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
  const [formState, setFormState] = useState(plan);
  const [selectImageState,setSelectImageState]=useState(plan)
  const [isProductPageChecked, setIsProductPageChecked] = useState(false);
  const [isHomePageChecked, setIsHomePageChecked] = useState(false);
  const [isCartPageChecked, setIsCartPageChecked] = useState(false);
  const [isAllImagesOnProductPageChecked, setAllImagesOnProductPageChecked] = useState(true);
  const [isSelectedImagesonProductChecked,setSelectedImagesonProductChecked]=useState(false)
    // State for the width and height input values
    const [width, setWidth] = useState('');
    const [height, setHeight] = useState('');
  
    // Handlers for the width and height input changes
    const handleWidthChange = (newValue) => setWidth(newValue);
    const handleHeightChange = (newValue) => setHeight(newValue);
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
  const [selectedLabelName,setSelectedLabelName]=useState('')


  const handleLabelChange = (labelUrl) => {
    setSelectedLabelUrl(labelUrl);

    // Find the label object by its value (URL)
    const selectedLabel = imageUrls.find(image => image.value === labelUrl);

    // Log the label's URL and name to the console
    if (selectedLabel) {
      setSelectedLabelName(selectedLabel.label)
      // console.log('Selected label URL:', selectedLabel.value);
      // console.log('Selected label name:', selectedLabelName);
      // console.log(selectImageState.productId)
    }
  };

  const submit = useSubmit();
  function handleSave() {
    
    const data = {
      "label_url": selectedLabelUrl,
      "label_name": selectedLabelName || "",
      "productHandle": selectImageState.productId,
    };
      submit(data, { method: "post" });
      console.log(data)
  }

  const handleSelectLabelClick = () => {
    setShowImages(!showImages);
  };

  async function selectProduct() {
    const products = await window.shopify.resourcePicker({
      type: "product",
      action: "select", // customized action verb, either 'select' or 'add',
    });

    if (products) {
      const { images, id, variants, title, handle } = products[0];

      setFormState({
        ...formState,
        productId: id,
        productVariantId: variants[0].id,
        productTitle: title,
        productHandle: handle,
        productAlt: images[0]?.altText,
        productImage: images[0]?.originalSrc,
      });
    }
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
        productId: id,
        productTitle: title,
        productHandle: handle,
        productAlt: images[0]?.altText,
        productImage: images[0]?.originalSrc,
      });
    }
  }


  return (
    <Page title="Create Label">
      <div className='grid' style={{display: 'grid',gridTemplateColumns: '1.2fr 0.8fr',gap: '10px'}}>
        <div className='product-view-card'>
          <Card>
            <Text as="h1" variant="bodyMd">
                Product View
            </Text>
          </Card>
          <div style={{marginTop:'20px'}}>

          <Card>        
            <div style={{marginTop:'10px',marginBottom:'10px'}}>
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
      <img src={selectedLabelUrl} alt="Selected Label" style={{ position: 'absolute', top: 'auto',left:'11px', maxWidth: '100px',}} />
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
            <div style={{marginTop:'10px'}}>
        <Button variant='primary' onClick={handleSelectLabelClick}>
          Select Label<Icon source={ButtonPressIcon} tone="base"/>
        </Button>
        <hr />
      </div>

      {showImages && (
            <div>
              {imageUrls.map((image, index) => (
                <button key={index} onClick={() => handleLabelChange(image.value)} style={{ background: 'none', border: 'none', padding: '0', cursor: 'pointer' }}>
                  <img src={image.value} alt={image.label} style={{ maxWidth: '100px', margin: '5px' }} />
                </button>
              ))}
            </div>
          )}

            <div style={{marginTop:'10px',marginBottom:'10px'}}>
              <Button onClick={selectProduct}>Select Products</Button>
              <hr />
            </div>
            <div className='label-page-selection' style={{textAlign: 'left', marginTop:'10px'}}>
              <Text as="h3" variant="bodyMd" bold><strong>Show Label On</strong></Text>
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
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
            <div className='image-for-label-selection' style={{marginTop:'10px'}}>
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
              {isOnPaidPlan ? '':<Link url="/app/payments">Upgrade</Link>}            
              <hr />
            </div>
          </Card>
        </div>
      </div>
    </Page>
  );
}