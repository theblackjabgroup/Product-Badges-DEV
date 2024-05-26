import db from "../db.server";
import { json } from '@remix-run/node'
import { getBadges } from "../app.server";
import { authenticate } from "../shopify.server";
import React, { useState } from 'react';
import { useLoaderData, useNavigate, useSubmit } from "@remix-run/react"
import { EditIcon, DeleteIcon, ViewIcon, HideIcon } from '@shopify/polaris-icons';
import { Page, Banner, Button, BlockStack, InlineStack, IndexTable, IndexFilters, useSetIndexFiltersMode, useIndexResourceState, Text, LegacyCard, Icon, Badge, Thumbnail, } from '@shopify/polaris'


export async function loader({ request, params }) {
    const { session } = await authenticate.admin(request);
    const { shop } = session;
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
                        id: obj,
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
                            id: obj,
                            shop: labelProductObjs.shop
                        },
                        data: {
                            isEnabled: booleanValue,
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


const Labels = () => {

    // Set Mode
    const { mode, setMode } = useSetIndexFiltersMode();

    // Set Badges
    const { currentBadges, shop } = useLoaderData();
    console.log("NIkkcurrentBadges", currentBadges)
    // console.log(JSON.parse(currentBadges[2].displayPage))

    // Selected Resource
    const { selectedResources, allResourcesSelected, handleSelectionChange, removeSelectedResources } = useIndexResourceState(currentBadges);


    // Resource Name
    const resourceName = {
        singular: 'badge',
        plural: 'badges',
    };

    // For Navigation
    const navigate = useNavigate()

    // For Submit
    const submit = useSubmit();

    // Is selected
    const [selected, setSelected] = useState(0);


    // Cancel Function
    const onHandleCancel = () => { };


    //   Sleep in ms
    const sleep = (ms) =>
        new Promise((resolve) => setTimeout(resolve, ms));

    // Items in tab
    const [itemStrings, setItemStrings] = useState([
        'All',
    ]);

    // Delete View
    const deleteView = (index) => {
        const newItemStrings = [...itemStrings];
        newItemStrings.splice(index, 1);
        setItemStrings(newItemStrings);
        setSelected(0);
    };


    // Duplicate View
    const duplicateView = async (name) => {
        setItemStrings([...itemStrings, name]);
        setSelected(itemStrings.length);
        await sleep(1);
        return true;
    };

    // Funtion to delete
    function deleteBadgeProductMapping(productList, shop) {
        const data = {
            "productList": productList,
            "shop": shop,
        };

        submit(data, { method: "delete" })
    }
    function handleDelete(id) {
        // Implement your delete logic here using selectedRows
        console.log('Deleting rows:', id, shop);
        deleteBadgeProductMapping(id, shop)
        removeSelectedResources(selectedResources)

    };

    // Function to enable disable the status of selected products
    async function disableEnableBadgeProductMapping(productList, shop, isEnable) {
        const data = {
            "switchEnable": true,
            "isEnabled": isEnable,
            "productList": productList,
            "shop": shop,
        };

        await submit(data, { method: "post" });
    }

    function handleDisable(id) {
        // Implement your delete logic here using selectedRows
        console.log('Disabling rows:', id, shop);
        setLoading(true);
        disableEnableBadgeProductMapping(id, shop, false)
            .then(setLoading(false))

    };

    function handleEnable(id) {
        // Implement your delete logic here using selectedRows
        console.log('Disabling rows:', id, shop);
        setLoading(true);
        disableEnableBadgeProductMapping(id, shop, true)
            .then(setLoading(false))
    };

    // Tab Actions
    const tabs = itemStrings.map((item, index) => ({
        content: item,
        index,
        onAction: () => { },
        id: `${item}-${index}`,
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
                                return item.content;
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

    // Set Loading Status
    const [loading, setLoading] = useState(false);

    // Create new view/tab
    const onCreateNewView = async (value) => {
        await sleep(500);
        setItemStrings([...itemStrings, value]);
        setSelected(itemStrings.length);
        return true;
    };

    // Save Function
    const onHandleSave = async () => {
        await sleep(1);
        return true;
    };

    // Primary Action
    const primaryAction =
        selected === 0
            ? {
                type: 'save-as',
                onAction: onCreateNewView,
                disabled: false,
                loading: false,
            }
            : {
                type: 'save',
                onAction: onHandleSave,
                disabled: false,
                loading: false,
            };


    // Row Markup
    const rowMarkup = currentBadges ? (currentBadges.map(
        (
            { id, productHandle, badgeUrl, isEnabled, productImageUrl },
            index
        ) => (
            <IndexTable.Row
                id={id} key={id} selected={selectedResources.includes(id)} position={index}>
                <IndexTable.Cell>{productHandle}</IndexTable.Cell>
                <IndexTable.Cell>
                    <Thumbnail
                        source={productImageUrl}
                        size='large' />
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Thumbnail
                        source={badgeUrl}
                        size="medium"
                    />
                </IndexTable.Cell>
                <IndexTable.Cell><Badge tone={isEnabled ? 'success' : 'attention'}> {isEnabled ? <InlineStack gap={100} blockAlign='center'><Icon source={ViewIcon} tone="base" />{isEnabled ? "Enabled" : "Disabled"}</InlineStack> : <InlineStack gap={100} blockAlign='center'><Icon source={HideIcon} tone="base" />{isEnabled ? "Enabled" : "Disabled"}</InlineStack>}</Badge></IndexTable.Cell>
                <IndexTable.Cell>
                    <InlineStack gap={400}>
                        <Button variant='plain' onClick={() => navigate(`/app/edit-label/${id}`)}><Icon source={EditIcon} tone="base" /></Button>
                        <Button onClick={() => handleDelete(id)} variant='plain'><Icon source={DeleteIcon} tone="base" /></Button>
                    </InlineStack>
                </IndexTable.Cell>
            </IndexTable.Row>
        ),
    )) : console.log("Currently no badges has been created");



    return (
        <>
            <Text variant="heading2xl" as="h3">
                Online store dashboard
            </Text>
            <Page>
                <BlockStack align='space-between' gap={400}>
                    <InlineStack align='space-between'>
                        <InlineStack gap={200}>
                            <Button onClick={() => handleEnable(selectedResources)}>Enable</Button>
                            <Button onClick={() => handleDisable(selectedResources)}>Disable</Button>
                            <Button onClick={() => handleDelete(selectedResources)} tone='critical' variant='primary'>Delete</Button>
                        </InlineStack>
                        <Button variant='primary' onClick={() => navigate("/app/api")}>Create Label</Button>
                    </InlineStack>
                    <LegacyCard>
                        <IndexFilters
                            mode={mode}
                            setMode={setMode}
                            loading={loading}
                            tabs={tabs}
                            primaryAction={primaryAction}
                            onCreateNewView={onCreateNewView}
                            selected={selected}
                            onSelect={setSelected}
                            canCreateNewView
                            cancelAction={{
                                onAction: onHandleCancel,
                                disabled: false,
                                loading: false,
                            }}
                        />
                        <IndexTable
                            sortable={["Name"]}
                            resourceName={resourceName}
                            itemCount={currentBadges.length}
                            selectedItemsCount={
                                allResourcesSelected ? 'All' : selectedResources.length
                            }
                            onSelectionChange={handleSelectionChange}
                            headings={[
                                { title: 'Name' },
                                { title: 'Product' },
                                { title: 'Label' },
                                { title: 'Status' },
                                { title: 'Action' },
                            ]}
                        >
                            {rowMarkup}
                        </IndexTable>
                    </LegacyCard>
                </BlockStack>
            </Page>
        </>
    );
};

export default Labels;