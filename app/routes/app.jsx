import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { authenticate } from "../shopify.server";
import mixpanel from 'mixpanel-browser';
import { useState } from "react";

mixpanel.init('2484f60695a260c19ddb2988617c37da', {debug: true});
mixpanel.identify('Nikhil')

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  return json({ apiKey: process.env.SHOPIFY_API_KEY || "" });
};

export default function App() {
  const { apiKey } = useLoaderData();
  const [pricingClickCount, setPricingClickCount] = useState(0);
  const [badgeClickCount, setbadgeClickCount] = useState(0);

  function handlePricingClick() {
    setPricingClickCount(pricingClickCount + 1);
    mixpanel.track("Pricing button is clicked", {
      'name': "Nikhil1",
      'pricingClickCount': 1
    });
    console.log("pricingClickCount ",pricingClickCount)
  }

  function handleBadgeClick() {
    setbadgeClickCount(badgeClickCount + 1);
    mixpanel.track("Badge button is clicked", {
      'name': "Nikhil2",
      'badgeClickCount': 1
    });
    console.log("badgeClickCount ",badgeClickCount)
  }

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
    <ui-nav-menu>
      <Link to="/app" rel="home">
        Home
      </Link> 
      <Link to="/app/settings">Settings</Link>
      <Link to="/app/pricing" onClick={handlePricingClick}>Pricing</Link>
      <Link to="/app/badges" onClick={handleBadgeClick}>Badges</Link>
    </ui-nav-menu>
    <Outlet />
  </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
