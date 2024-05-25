import db from "./db.server";
import { json } from "@remix-run/node";

export async function createOrUpdateBadge(arrayToIterate) {
  try {
    for (const obj of arrayToIterate) { // Iterate through each object in the array
      const ProdObj = obj.productHandle;
      const ProdId = obj.id;
      const ProdImgUrl = obj.productImageUrl;
  
      const arrayOfProdId = ProdId.split(",");
      const arrayOfProdImgUrl = ProdImgUrl.split(",");
      const arrayOfProd = ProdObj.split(",");
  
      for (let i = 0; i < arrayOfProd.length; i++) { // Loop through each product handle
        const prodHandle = arrayOfProd[i];
        const prodId = arrayOfProdId[i];
        const prodImgUrl = arrayOfProdImgUrl[i];
        console.log("ENABLE HOVER ",prodHandle, obj.enableHover)
        const data = {
          id: prodId,
          productHandle: prodHandle,
          productImageUrl: prodImgUrl,
          badgeName: obj.badge_name,
          badgeUrl: obj.badge_url,
          displayPosition: obj.displayPosition,
          displayPage: obj.displayPage,
          isEnabled: true,
          isHoverEnabled: Boolean(obj.enableHover),
          shop: obj.shop,
        };
            const badge = await db.Badge.findFirst({
              where: { id: prodId, shop: obj.shop },
            });
            if (!badge) {
              
              const displayPageArr = data.displayPage.split(",");
              if(displayPageArr.length > 1)
              {                
                displayPageArr.shift();
              }
              data.displayPage = displayPageArr.join();

              const createdMapping = await db.badge.create({ data });
              console.log(
                "Creating new mapping of badge and product",
                createdMapping,
              );
            } else {
              const updatedMapping = await db.badge.update({
                where: { id: prodId },
                data,
              });
              console.log(
                "Updating the mapping of badge and product ",
                updatedMapping,
              );
            }
          }
        }
    return json({
      ok: true,
      msg: "POST from API",
    });
  } catch (error) {
    console.error("Error processing POST request:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function getBadges(shop) {
  const badges = await db.badge.findMany({
    where: {
      shop: shop,
    },
  });
  return badges;
}