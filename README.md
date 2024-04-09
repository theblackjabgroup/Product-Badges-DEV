
---------------------------------------------------------------

How to deploy app to digital ocean and test

floating.liquid -> main.js -> app.api.jsx

1) environment variable set host to blank -- image as env-variables-dig-ocean
2) main js fetch url change to the url from digital liquid
3) npm run deploy must be run
4) partner account change url to digital ocean url -- image as shopify-partner-setup-for-digliq
5) push code and start digital ocean pipeline
6) postman post to new url -- postman-call-app-on-dig-liq

Payments module:


app.jsx -> app.payments.jsx -> app.upgrade.jsx + app.cancel.jsx

1) app.jsx ADD <Link to="/app/payments">Payments</Link>  -- ref to new page for payments
2) Edit shopify.server.js with new meta objects
3) Create a new file in /app/routes named as app.payments.jsx 
4) create a file in/app/routes named as app.upgrade.jsx 
5) create a file in /app/routes named as app.cancel.jsx 


Inside main.JS ?

DOMContentLoaded -> bdgs_finditems -> identifyProductfromReq -> decodeJson + add badge -> my_badge




----------------------------------------------------------------
DEPLOY ON LOCAL, not DIGITAL OCEAN

In this main.js calls app.api.jsx, so we onyly deploy 1 APP

1) npm run dev -- create local url

2) log in to shopify partner -> app -> build -> configuration -> copy url into main.js fetch commands  "app-url-shopify-partner.png"

3) 1. When you do npm run dev then generate a graphql server link(eg: http://localhost:3457/graphiql)
2. Go to this link and execute this query 

query {
  products(first: 10, reverse: true) {
    edges {
      node {
        id
        title
        
        handle
        resourcePublicationOnCurrentPublication {
          publication {
            name
            id
          }
          publishDate
          isPublished
        }
      }
    }
  }
}

4) Get response from query - it contains list of products

5) Send request to postman POST https://aerial-pork-salmon-difficult.trycloudflare.com/app/api

image - "POSTmancall-to-apijsx"

Put the json body as raw

----------------------------------------------------------
OLD WAY with server.js, localhost 3000 does not happen anymore
Run app, and extenion calls second "app" running api on server.js

main.js calls server.js in this

1) npm run dev 

to start app

New branch

 2) extentions -> app-ex1 -> assets - > node server.js

to get list of all products

1. When you do npm run dev then generate a graphql server link(eg: http://localhost:3457/graphiql)
2. Go to this link and execute this query 

query {
  products(first: 10, reverse: true) {
    edges {
      node {
        id
        title

        }
      }
    }
  }

  OR


query {
  products(first: 10, reverse: true) {
    edges {
      node {
        id
        title
        
        handle
        resourcePublicationOnCurrentPublication {
          publication {
            name
            id
          }
          publishDate
          isPublished
        }
      }
    }
  }

}
3. You will get a JSON which you can paste in POSTMAN

go to body and in raw put the json you got, POST to http://localhost:3000/api/data
Screenshot is there as postman1