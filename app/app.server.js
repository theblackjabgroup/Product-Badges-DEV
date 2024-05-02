import db from "./db.server";
import {json} from '@remix-run/node'

export async function createOrUpdateBadge(arrayToIterate) {
    try{
        arrayToIterate.forEach(async obj => { 
          const ProdObj = obj.productHandle
          const arrayOfProd =ProdObj.split(",");
          arrayOfProd.forEach(async prodHandle => {
            const data = {
                productHandle: prodHandle,
                badgeName: obj.badge_name,
                badgeUrl: obj.badge_url,
                displayPosition: obj.displayPosition,
                displayPage: obj.displayPage,
                isEnabled: true,
                shop: obj.shop,             
            }; 
        const badge = await db.Badge.findFirst({
                                where: { productHandle: prodHandle, 
                                         shop: obj.shop },
                            });
        if(!badge)
        {   
            const createdMapping = await db.badge.create({ data })  
            console.log("Creating new mapping of badge and product", createdMapping); 
        }
        else
        {
            const updatedMapping = await db.badge.update({ where: { productHandle: prodHandle },data }) 
            console.log("Updating the mapping of badge and product ",updatedMapping)
        }
        })});   

        return json({
            ok:true,
            msg:"POST from API"
        });
    }
    catch (error){
        console.error("Error processing POST request:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}

export async function getBadges(shop) {
    const badges = await db.badge.findMany({
      where: {
        shop: shop
      }
    })
    return badges;
  }
  