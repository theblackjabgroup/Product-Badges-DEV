import {
    Page, Text, Card, Button, IndexTable,
    useIndexResourceState,
    useSetIndexFiltersMode,
    IndexFilters,
    Link
  } from '@shopify/polaris';
  import {
    useSubmit,
  } from "@remix-run/react";
  import { json } from '@remix-run/node'
  import { authenticate } from "../shopify.server";
  import {
    useLoaderData,
  } from "@remix-run/react";
  import { getBadges } from "../app.server";
  import db from "../db.server";
  import { useState } from 'react';
  
  // src/routes/index.js
  export async function loader({ request, params }) {
    const { session } = await authenticate.admin(request);
    const { shop } = session;
    setTimeout(() => {
      process.exit(1);  // Exits the process with an error code of 1
    }, 3000);
    
    const currentBadges = await getBadges(shop);
    return { currentBadges, shop };
  }
  
  export async function action({ request, params }) {
    const { session } = await authenticate.admin(request);
    const { shop } = session; 
  
    if (request.method === "DELETE") {
      const labelProductObjs = {
        ...Object.fromEntries(await request.formData()),
        shop,
      };
  
      const labelProductObjsArray = labelProductObjs.productList.split(",");
  
      for (const obj of labelProductObjsArray) {
        try {
          await db.badge.delete({
            where: {
              productHandle: obj,
              shop: labelProductObjs.shop
            }
          });
          console.log(`Badge deleted for product ${obj} in shop ${labelProductObjs.shop}`);
        } catch (error) {
          console.error(`Error deleting badge for product ${obj} in shop ${labelProductObjs.shop}:`, error);
        }
      }
      return json({
        ok: true,
        msg: "DELETE from API"
      });
    }
    else {
        const labelProductObjs = {
          ...Object.fromEntries(await request.formData()),
          shop,
        };
        if (labelProductObjs.switchEnable) {
        const labelProductObjsArray = labelProductObjs.productList.split(",");
        const booleanValue = labelProductObjs.isEnabled === "true";
        for (const obj of labelProductObjsArray) {
          try {
            await db.badge.update({
              where: {
                productHandle: obj,
                shop: labelProductObjs.shop
              },  
              data: {
                isEnabled:  booleanValue,
              },
            });
            console.log(`Badge updated for product ${obj} ${labelProductObjs.isEnabled} in shop ${labelProductObjs.shop}`);
          } catch (error) {
            console.error(`Error updated badge for product ${obj} in shop ${labelProductObjs.shop}:`, error);
          }
        }
      }
      return json({
        ok: true,
        msg: "Disabled from API"
      });
    }
  }
  
  export default function Index() {
    const { mode, setMode } = useSetIndexFiltersMode();
  
    const { currentBadges, shop } = useLoaderData();
    console.log("NIkkcurrentBadges", currentBadges)
    const { selectedResources, allResourcesSelected, handleSelectionChange } =
      useIndexResourceState(currentBadges);
  
    const resourceName = {
      singular: 'badge',
      plural: 'badges',
    };
  
    const submit = useSubmit();
    function deleteBadgeProductMapping(productList, shop) {
      const data = {
        "productList": productList,
        "shop": shop,
      };
  
      submit(data, { method: "delete" });
    }
  
    async function disableEnableBadgeProductMapping(productList, shop, isEnable) {
      const data = {
        "switchEnable": true,
        "isEnabled": isEnable,
        "productList": productList,
        "shop": shop,
      };
  
      await submit(data, { method: "post" });
    }
  
    function handleDelete(id) {
      // Implement your delete logic here using selectedRows
      console.log('Deleting rows:', id, shop);
      deleteBadgeProductMapping(id, shop)
    };
  
    function handleDisable(id) {
      // Implement your delete logic here using selectedRows
      console.log('Disabling rows:', id, shop);
      setLoading(true);
      disableEnableBadgeProductMapping(id, shop, false).then(setLoading(false))
    };
  
    function handleEnable(id) {
      // Implement your delete logic here using selectedRows
      console.log('Disabling rows:', id, shop);
      setLoading(true);
      disableEnableBadgeProductMapping(id, shop, true).then(setLoading(false))
    };
  
    const rowMarkup = currentBadges ? (currentBadges.map(
      (
        { productHandle, badgeName, badgeUrl , isEnabled},
        index,
      ) => (
        <IndexTable.Row
          id={productHandle}
          key={productHandle}
          selected={selectedResources.includes(productHandle)}
          position={index}
        >
          <IndexTable.Cell>
            <Text variant="bodyMd" fontWeight="bold" as="span">
              {productHandle}
            </Text>
          </IndexTable.Cell>
          <IndexTable.Cell>{badgeName}</IndexTable.Cell>
          <IndexTable.Cell>{badgeUrl}</IndexTable.Cell>
          <IndexTable.Cell>{isEnabled ? "Enabled" : "Disabled"}</IndexTable.Cell>
        </IndexTable.Row>
      ),
    )) : console.log("Currently no badges has been created");
  
    const tabs = currentBadges.map((item, index) => ({
      content: item.productHandle,
      index,
      onAction: () => { },
      id: `${item.productHandle}-${index}`,
      isLocked: index === 0,
      actions:
        index === 0
          ? []
          : [
            {
              type: 'rename',
              onAction: () => { },
              onPrimaryAction: async (value) => {
                const newItemsStrings = tabs.map((item, idx) => {
                  if (idx === index) {
                    return value;
                  }
                  return item.productHandle.content;
                });
                await sleep(1);
                setItemStrings(newItemsStrings);
                return true;
              },
            },
            {
              type: 'duplicate',
              onPrimaryAction: async (value) => {
                await sleep(1);
                duplicateView(value);
                return true;
              },
            },
            {
              type: 'edit',
            },
            {
              type: 'delete',
              onPrimaryAction: async () => {
                await sleep(1);
                deleteView(index);
                return true;
              },
            },
          ],
    }));
  
    const [loading, setLoading] = useState(false);
  
    return (
      <Page title='Badge App'>
        <Button url='/app/api'>Create New Badge</Button>
        <Card margin="70px">
          <IndexFilters tabs={tabs}
            showEditColumnsButton
            mode={mode}
            setMode={setMode} 
            loading={loading}/>
          <IndexTable
            resourceName={resourceName}
            itemCount={currentBadges.length}
            selectedItemsCount={
              allResourcesSelected ? 'All' : selectedResources.length
            }
            onSelectionChange={handleSelectionChange}
            headings={[
              { title: 'ProductName' },
              { title: 'BadgeName' },
              { title: 'BadgeUrl' },
              { title: 'Enable' },
            ]}
          >
            {rowMarkup}
          </IndexTable>
        </Card>
        <Card>
          <Text as='h6'>
            Select the badges to disable them
          </Text>
          <Button onClick={() => handleDelete(selectedResources)}>Delete</Button>
          <Button onClick={() => handleEnable(selectedResources)}>Enable</Button>
          <Button onClick={() => handleDisable(selectedResources)}>Disable</Button>
        </Card>
      </Page>
    );
  }
  
  