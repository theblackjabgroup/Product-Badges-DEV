Deploy to DO

Deployment steps:
create a app in digitalOcean and connect your github repo
Do not configure environment variables for the first time
Once the deployment gets successful then configure environment variables
SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SCOPES, SHOPIFY_APP_URL
Once the deployment gets successful you will get a app URL from digitalocean put that URL against SHOPIFY_APP_URL
And update the app URL in partners dashboard also
Then do npm run deploy if extension is not working on shopify site
and again start the digital ocean pipeline

Apart from this for database, we need to configure our db on digitalOcean and for that we need purchase some database from digitalOcean

Set the DB

datasource db {
  provider = "mysql"
  url      = "mysql://doadmin:AVNS_VpHEDJ0P-NR0VpaKbgW@db-mysql-blr1-56602-do-user-16072878-0.c.db.ondigitalocean.com:25060/defaultdb?ssl-mode=REQUIRED"
}

url comes from dig ocean -? db -> connectiond etails -> top right drop down -> connection string

curl -4 ifconfig.me  -- get ip

allow ip in digital ocean

SELECT * FROM Badge;

n sql workbench get settings from connection details of DB






---------------------------------------------------
How to deploy app to digital ocean and test

You have to delete previous migration folder and dev.sqlite file then 
npm run prisma migrate dev -- --name add-badge-table

floating.liquid -> main.js -> app.api.jsx

locall run npm install xml-js

environment variable set host to blank -- image as env-variables-dig-ocean
main js fetch url change to the url from digital liquid
npm run deploy must be run
partner account change url to digital ocean url -- image as shopify-partner-setup-for-digliq
push code and start digital ocean pipeline
postman post to new url -- postman-call-app-on-dig-liq
after changing schema.prisma run this command to push the table npm run prisma migrate dev -- --name add-qrcode-table

npm install xml-js

And to see the db on browser npm run prisma studio

Payments module:

app.jsx -> app.payments.jsx -> app.upgrade.jsx + app.cancel.jsx

also uses shopify.server.js

app.jsx ADD Payments -- ref to new page for payments
Edit shopify.server.js with new meta objects
Create a new file in /app/routes named as app.payments.jsx
create a file in/app/routes named as app.upgrade.jsx
create a file in /app/routes named as app.cancel.jsx
Inside main.JS ?

DOMContentLoaded -> bdgs_finditems -> identifyProductfromReq -> decodeJson + add badge -> my_badge



--------------------------------------------------------------


DEPLOY ON LOCAL, not DIGITAL OCEAN

In this main.js calls app.api.jsx, so we onyly deploy 1 APP

npm run dev -- create local url

log in to shopify partner -> app -> build -> configuration -> copy url into main.js fetch commands "app-url-shopify-partner.png"

When you do npm run dev then generate a graphql server link(eg: http://localhost:3457/graphiql)
Go to this link and execute this query
query { products(first: 10, reverse: true) { edges { node { id title

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
} }

Get response from query - it contains list of products

Send request to postman POST https://aerial-pork-salmon-difficult.trycloudflare.com/app/api

image - "POSTmancall-to-apijsx"

Put the json body as raw

OLD WAY with server.js, localhost 3000 does not happen anymore Run app, and extenion calls second "app" running api on server.js

main.js calls server.js in this

npm run dev
to start app

New branch

extentions -> app-ex1 -> assets - > node server.js
to get list of all products

When you do npm run dev then generate a graphql server link(eg: http://localhost:3457/graphiql)
Go to this link and execute this query
query { products(first: 10, reverse: true) { edges { node { id title

    }
  }
}
}

OR

query { products(first: 10, reverse: true) { edges { node { id title

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

} 3. You will get a JSON which you can paste in POSTMAN

go to body and in raw put the json you got, POST to http://localhost:3000/api/data Screenshot is there as postman1