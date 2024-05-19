import { json } from '@remix-run/node'
import { useState, useEffect, useCallback } from "react";
import { authenticate } from "../shopify.server";
import { xml2json } from 'xml-js';
import { createOrUpdateBadge } from "../app.server"
import {
  useSubmit,
} from "@remix-run/react";
import {
  Layout,
  PageActions,
  InlineStack,
  Button,
  Page,
  Text,
  Checkbox
} from "@shopify/polaris";

let receivedData;
export async function loader({ request }) {
  return json({ data: receivedData }, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*", } })
}

export async function action({ request, params }) {
  console.log("inside action ", params);
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  const labelProductObjs = {
    ...Object.fromEntries(await request.formData()),
    shop,
  };

  console.log("object ", labelProductObjs)
  const arrayToIterate = [labelProductObjs];
  const result = createOrUpdateBadge(arrayToIterate);
  return result;
}

const cdnUrl = "https://blackbyttcdn.blr1.digitaloceanspaces.com";
function BadgeProductMapping(props) {
  const [imageUrls, setImageUrl] = useState([]);
  const [selectedOption, setSelectedOption] = useState({ label: '', value: '' });

  useEffect(() => {
    async function fetchData() {

      // Fetch data
      const response = await fetch(cdnUrl);
      const xmlData = await response.text();
      const xmlString = xml2json(xmlData, { compact: true, spaces: 4 });
      const data = JSON.parse(xmlString)
      console.log("Json Data from DigitalOcean", data); // Output the JSON data
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const results = []
      data.ListBucketResult.Contents.forEach((value) => {
        const badgeInfo = {
          "label": value.Key._text,
          "value": cdnUrl + "/" + value.Key._text
        }
        results.push(
          badgeInfo,
        );
      });
      console.log("results", results)
      // Update the options state
      setImageUrl([
        ...results
      ])
      if (results.length > 0) {
        setSelectedOption(results[0]);
      }
    }

    // Trigger the fetch
    fetchData();
  }, []);


  const [formState, setFormState] = useState();

  async function selectProduct() {
    const products = await window.shopify.resourcePicker({
      type: "product",
      multiple: true,
      action: "select",
    });
    console.log("PRODUCTS  ", products)

    const handle = [];
    const image = [];
    const id = [];

    if (products) {
      products.forEach((product) => {
        handle.push(product.handle);
      })

      products.forEach((products) => {
        image.push(products.images[0].originalSrc)
      })
    }

    if (products) {
      products.forEach((product) => {
        const idString = product.id;
        const parts = idString.split('/');
        const productId = parts[parts.length - 1]; // Get the last part
        id.push(productId)
      })
    }
    setFormState({
      ...formState,
      productHandles: handle,
      productImageUrl: image,
      productId: id,
    });
  }


  const submit = useSubmit();
  function handleSave() {
    const data = {
      "badge_url": selectedOption.value,
      "badge_name": selectedOption.label || "",
      "productHandle": formState.productHandles,
      "productImageUrl": formState.productImageUrl,
      "id": formState.productId,
      "displayPosition": selectedPositionToDisplay,
      "displayPage": selectedDisplayPage,
      "enableHover": enableHover,
    };
    submit(data, { method: "post" });
  }

  const addPage = useCallback((page) => {
    setSelectedDisplayPage((prevPages) => [...prevPages, page]);
  }, []);

  const removePage = useCallback((page) => {
    setSelectedDisplayPage((prevPages) => prevPages.filter(p => p !== page));
  }, []);


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


  const { label, name, ...rest } = props;
  const [selectedPositionToDisplay, setSelectedPositionToDisplay] = useState("TopLeft");
  const positionToDisplay = ["TopLeft", "CenterLeft", "BottomLeft", "TopMiddle", "CenterMiddle", "BottomMiddle", "TopRight", "CenterRight", "BottomRight"]
  const [enableHover, setEnableHover] = useState(false);


  const [selectedDisplayPage, setSelectedDisplayPage] = useState(["All"]);
  const [isProductPageChecked, setIsProductPageChecked] = useState(false);
  const [isCollectionPageChecked, setIsCollectionPageChecked] = useState(false);
  const [isSearchResultPageChecked, setIsSearchResultPageChecked] = useState(false);
  const [isOtherPageChecked, setIsOtherPageChecked] = useState(false);
  const [isHomePageChecked, setIsHomePageChecked] = useState(false);
  const [isCartPageChecked, setIsCartPageChecked] = useState(false);

  function handleHover() {
    if (enableHover === false)
      setEnableHover(true);
    else
      setEnableHover(false);
  }

  return (
    <Page>
      <div>
        <Layout.Section>
          <InlineStack>
            <Text as={"h3"} variant="headingLg">
              Select Badge
            </Text>
            <select onChange={(e) => setSelectedOption({ label: e.target.options[e.target.selectedIndex].text, value: e.target.value })} value={selectedOption.value}>
              {
                imageUrls.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))
              }
            </select>
            {selectedOption !== undefined ? (
              <p>Selected option: {selectedOption.label} {selectedOption.value}</p>
            ) : (
              <p>No option selected</p>
            )}
          </InlineStack>
          <Text as={"h3"} variant="headingLg">
            Select Display Page
          </Text>
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
          <InlineStack>
            <Text as={"h3"} variant="headingLg">
              Select Position Of the Badge
            </Text>
            <select onChange={(e) => setSelectedPositionToDisplay(e.target.options[e.target.selectedIndex].text)}>
              {
                positionToDisplay.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))
              }
            </select>
          </InlineStack>
        </Layout.Section>
        <Layout.Section>
          <InlineStack align="space-between">
            <Button variant="plain" onClick={selectProduct}>
              Select product
            </Button>
            <Checkbox
              label="Enable Hover"
              checked={enableHover}
              onChange={handleHover}
            />
          </InlineStack>
          <PageActions
            primaryAction={{
              content: "Save",
              onAction: handleSave,
            }}
          />
        </Layout.Section>
      </div>
    </Page>
  );
}

export default BadgeProductMapping;