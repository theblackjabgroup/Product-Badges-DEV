import db from "../db.server";
import {json} from '@remix-run/node'

let badges;
export async function loader({request}) {
    const shopUrl = request.headers.get('Origin');
    if(shopUrl)
    {
        const shop = shopUrl.split('://')[1];
        console.log("storeName ", shop) 
        badges = await db.Badge.findMany({
            where: { shop },
          });
        console.log("HELLO BADGES ", badges)
    } 
    return json({
        data: badges 
    }, 
    {
    headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Headers": "*",
      },
    })
}