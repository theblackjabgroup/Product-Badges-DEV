import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { authenticate } from "../shopify.server";

import {Page, Button} from '@shopify/polaris';
import mixpanel from 'mixpanel-browser';
import { useState } from "react";

mixpanel.init('70551b6bed93424cd2c7eacf49a345c2', {debug: true});
mixpanel.identify('Varun')

mixpanel.track('Sign Up', {
  'Signup Type': 'Referral'
})

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  return json({ apiKey: process.env.SHOPIFY_API_KEY || "" });
};





export default function App() {
  const { apiKey } = useLoaderData();
  const [ApiClickCount, setApiClickCount] = useState(0);
  const [badgeClickCount, setbadgeClickCount] = useState(0);



  function handleAPIClick() {
    setApiClickCount(ApiClickCount + 1);
    mixpanel.track("API button is clicked", {
      'name': "varun2",
      'ApiClickCount': ApiClickCount
    });
    console.log("ApiClickCount ",ApiClickCount)
  }


function handleBadgeClick() {
  setbadgeClickCount(badgeClickCount + 1);
  mixpanel.track("Badge button is clicked", {
    'name': "varun2",
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
        <Link to="/app/additional">Additional page</Link>
        <Link to="/app/payments">Payments - Yash</Link>
        <Link to="/app/labels">Labels - Sharad</Link>
        <Link to="/app/create-label">Create Label - Sharad</Link>
        <Link to="/app/getstarted">Get Started - Sharad</Link>

        <Link to="/app/badges" onClick={handleBadgeClick}>Badges - nikhil</Link>
        <Link to="/app/api" onClick={handleAPIClick}>API - Nikhil</Link>
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
