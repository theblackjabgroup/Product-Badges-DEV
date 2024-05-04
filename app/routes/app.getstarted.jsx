
import { Badge, BlockStack, Box, Button, Card, Grid, Icon, InlineGrid, InlineStack, MediaCard, Page, Text } from '@shopify/polaris';
import { StarFilledIcon, ChatIcon, QuestionCircleIcon, TeamIcon } from '@shopify/polaris-icons';

export default function Index() {
  return (
    <Page>
      <BlockStack gap="400">
        <Text variant="headingXl" as="h4">
          Welcome to Our Product Badges and Labels
        </Text>
        <MediaCard title="Step 1: Integrate our app into your Shopify theme." description='Click on the "Enabled app embed" button below to open the Theme Editor page, toggle on our app to activate it, and click "Save".' primaryAction={{ content: "Enable App Embed", variant: "primary", url: `https://admin.shopify.com/admin/themes/current/editor?context=apps&template=index`, target:"_blank" }}>
          <img alt="" width="100%" height="100%" style={{ objectFit: 'cover', objectPosition: 'center', }} src="" />
        </MediaCard>
        <MediaCard title="Step 2: Create your label." description='Click on the "Labels" tab, then "Create" to start the process, and customize the label to suit your specific needs. If you wish to create more campaigns, select their respective tabs.' primaryAction={{ content: "Create Label", variant: "primary", onAction: () => { }, }}>
          <img alt="" width="100%" heighuseNavigatet="100%" style={{ objectFit: 'cover', objectPosition: 'center', }} src="" />
        </MediaCard>
        <MediaCard title="Step 3: Publish your label." description="After customizing, make sure to save and activate the label so that it can appear on your store. If your label doesn't show up on your theme, please contact us to resolve the issue." primaryAction={{ content: "Manage Label", variant: "primary", onAction: () => { }, }}>
          <img alt="" width="100%" height="100%" style={{ objectFit: 'cover', objectPosition: 'center', }} src="" />
        </MediaCard>
        <InlineStack align='center'>
            <Card>
              <InlineStack gap={200} blockAlign='center' wrap={false}>
                <img width={100} src="data:image/png;base64,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" alt="" srcset="" />
                <BlockStack gap={200}>
                  <Text as='strong'>Labels</Text>
                  <Text variant='bodyMd'>Create new labels on product images and collection images</Text>
                  <InlineStack align='start'>
                    <Button variant='primary'>Manage Labels</Button>
                  </InlineStack>
                </BlockStack>
              </InlineStack>
            </Card>
        </InlineStack>
      </BlockStack>
    </Page>
  );
}
