document.addEventListener('DOMContentLoaded', function () {
  bdgs_finditems();
});
let card__inner;
let freeTheme = false;

async function decodeJson() {
  try {
    // Make an HTTP GET request to the server-side endpoint
    const response = await fetch('https://lionfish-app-hrorj.ondigitalocean.app/app/mapping');

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const obj = await response.json();
    console.log('obj ', obj);
    return obj.data;
  }
  catch (error) {
    console.error('There was a problem with the fetch operation:', error);
    return [];
  }
}

function addBadge(productDOM, badgeUrl, displayPosition, isHoverEnabled, currentPage) {
  for (var idx = 0; idx < productDOM.length; idx++) {
    if (productDOM[idx]) {
      console.log('productDOM[idx] ', productDOM[idx]);
      my_badge(productDOM[idx], badgeUrl, displayPosition, isHoverEnabled, currentPage);
    }
  }
}

function removeParam(sourceURL) {
  // Create a new URL object
  const parsedUrl = new URL(sourceURL);
  const params = {};

  // Extract parameters
  parsedUrl.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  parsedUrl.search = '';
  return {
    urlWithoutParams: parsedUrl.toString(),
    params: params
  }
}
function findCurrentPage() {
  const currentPageUrl = removeParam(window.location.href);
  console.log("urlWithoutParams ", currentPageUrl);
  let currentPage = "";
  // Check if the URL contains a specific path or query parameter indicating the page
  if (currentPageUrl.urlWithoutParams.endsWith('/')) {
    currentPage = "Home"
  }
  else if (location.href.indexOf("collection") != -1|| location.href.indexOf("collections") != -1) {
    currentPage = "Collection"
  } else if (location.href.indexOf("products") != -1) {
    currentPage = "Product"
  } else if (location.href.indexOf("cart") != -1) {
    currentPage = "Cart"
  } else if (location.href.indexOf("search") != -1) {
    currentPage = "Search"
  } else {
    currentPage = "All"
  }

  return currentPage;
}

function identifyProductfromReq() {
  // Get the current page URL
  const currentPage = findCurrentPage();

  decodeJson().then(edges => {
    for (let index = 0; index < edges.length; index++) {
      const displayPageArr = edges[index].displayPage.split(",");
      console.log("currentpage ",currentPage)
      for (let d = 0; d < displayPageArr.length; d++) {
        console.log()
        if ((displayPageArr[d] == currentPage || displayPageArr[d] == "All") && edges[index].isEnabled == true && domMAP.has(edges[index].productHandle)) {
          console.log(
            'key ',
            edges[index].productHandle,
            ' value ',
            domMAP.get(edges[index].productHandle)
          );
          addBadge(domMAP.get(edges[index].productHandle), edges[index].badgeUrl, edges[index].displayPosition, edges[index].isHoverEnabled, currentPage);
        }
      }
    }
  }).catch(error => {
    console.error('Error fetching JSON in identifyProductfromReq:', error);
  });
}

const domMAP = new Map(); //map of product names and the closest img DOM array
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function bdgs_finditems() {
  console.log("in bdgs_finditems")
  await sleep(2000);

  for (
    anchorTags = document.querySelectorAll(
      'a[href*="/products/"]:not([href*=".jp"]):not([href*=".JP"]):not([href*=".png"]):not([href*=".PNG"]):not([href*="facebook.com"]):not([href*="twitter.com"]):not([href*="pinterest.com"]):not([href*="mailto:"])'
    ),
    itr = 0;
    itr < anchorTags.length;
    itr++
  ) {
    console.log('anchorTags[itr] ', anchorTags[itr]);
    var lenght;
    if (0 < (g = anchorTags[itr].getAttribute('href').split('/'))[g.length - 1].split(/[?#]/)[0].length) {
      lenght = 1;
    } else {
      lenght = 2;
    }
    var p = g[g.length - lenght].split(/[?#]/)[0];
    var productName = decodeURI(p); // t is the product name eg: Test
    let parentElement = anchorTags[itr].parentElement;
    var closestImgDOM;
    var imgFound = false;
    while (parentElement) {
      closestImgDOM = parentElement.querySelector(
        'img[src*="/products/"]:not([class*="not-abel"]), img[data-src*="/products/"]:not([class*="not-label"]), img[src*="/no-image"], img[data-src*="/no-image"], img[src*="/products/"], img[srcset*="/products/"][srcset*="/cdn.shopify.com/s/files/"], img[src*="/cdn.shopify.com/s/files/"], source[data-srcset*="/products/"],  source[data-srcset*="/cdn.shopify.com/s/files/"], source[data-srcset*="/cdn/shop/files/"],  img[data-srcset*="/cdn.shopify.com/s/files/"],  img[src*="/product_img/"],  img[src*="/cdn/shop/files/"],  img[srcset*="/cdn/shop/files/"], img[srcset*="/cdn/shop/products/"], [style*="/products/"], img[src*="%2Fproducts%2F"]'
      );
      if (closestImgDOM != null) {
        imgFound = true;
        if (closestImgDOM.parentElement.parentElement.parentElement) {
          card__inner = closestImgDOM.parentElement.parentElement.parentElement;
          if(card__inner.classList.contains('card__inner'))
          {
            freeTheme = true;
          }
          if (card__inner && card__inner.classList.contains('card__inner')) {
            card__inner.classList.add("tag-transform");
            const card__media = card__inner.querySelector('.card__media');
            if (card__media) {
              const zIndex = window.getComputedStyle(card__media).getPropertyValue('z-index');
              if (zIndex === '0') {
                card__media.classList.add("tag-z");
              }
            }
          }
        }
        break;
      }
      parentElement = parentElement.parentElement;
    }
    console.log('closestImg ', closestImgDOM);
    if (domMAP.has(productName)) {
      const domArray = domMAP.get(productName);
      if (!domArray.includes(closestImgDOM)) {
        domArray.push(closestImgDOM);
      }
      domMAP.set(productName, domArray);
    } else {
      domMAP.set(productName, [closestImgDOM]);
    }
  }
  const currentPageUrl = removeParam(window.location.href);
  const parsedUrl = new URL(currentPageUrl.urlWithoutParams);

  const segments = parsedUrl.pathname.split('/');
  const productNameInProductPage = segments.filter(segment => segment).pop();

  if (location.href.indexOf("products") != -1 );
  {
    var imgTags = document.querySelectorAll('img[src*="/products/"]:not([class*="not-abel"]), img[data-src*="/products/"]:not([class*="not-label"]), img[src*="/no-image"], img[data-src*="/no-image"], img[src*="/products/"], img[srcset*="/products/"][srcset*="/cdn.shopify.com/s/files/"], img[src*="/cdn.shopify.com/s/files/"], source[data-srcset*="/products/"],  source[data-srcset*="/cdn.shopify.com/s/files/"], source[data-srcset*="/cdn/shop/files/"],  img[data-srcset*="/cdn.shopify.com/s/files/"],  img[src*="/product_img/"],  img[src*="/cdn/shop/files/"],  img[srcset*="/cdn/shop/files/"], img[srcset*="/cdn/shop/products/"], [style*="/products/"], img[src*="%2Fproducts%2F"]');
    const widestImgTag = imgTags[0];
    if (imgTags > 0) {
      for (itr = 0; itr < imgTags.length; itr++) {
        if (imgTags[itr].width > widestImgTag.width) {
          widestImgTag = imgTags[itr];
        }
      }
    }
    console.log("productNameInProductPage ", productNameInProductPage, " widestImgTag ", widestImgTag);

    if (domMAP.has(productNameInProductPage)) {
      const domArray = domMAP.get(productNameInProductPage);
      if (!domArray.includes(widestImgTag)) {
        domArray.push(widestImgTag);
      }
      domMAP.set(productNameInProductPage, domArray);
    } else {
      domMAP.set(productNameInProductPage, [widestImgTag]);
    }
  }

  console.log("domMap ", domMAP);
  identifyProductfromReq();
}

function my_badge(imgNode, badgeUrl, displayPosition, isHoverEnabled, currentPage) {
  console.log("BAdgeurl ", badgeUrl)
  var newDiv = document.createElement('div');
  newDiv.className = 'product-image-container';
  var imgDiv = document.createElement('img');
  imgDiv.classList.add("img-tag");
  imgDiv.src = badgeUrl;
  if (displayPosition == "top-left") imgDiv.classList.add("top-left");
  if (displayPosition == "center-left") imgDiv.classList.add("center-left");
  if (displayPosition == "bottom-left") imgDiv.classList.add("bottom-left");
  if (displayPosition == "top-middle") imgDiv.classList.add("top-middle");
  if (displayPosition == "center-middle") imgDiv.classList.add("center-middle");
  if (displayPosition == "bottom-middle") imgDiv.classList.add("bottom-middle");
  if (displayPosition == "top-right") imgDiv.classList.add("top-right");
  if (displayPosition == "middle-right") imgDiv.classList.add("middle-right");
  if (displayPosition == "bottom-right") imgDiv.classList.add("bottom-right");
  newDiv.appendChild(imgDiv);
  var parentNode;
  var nodeToAddHover = imgNode;

    let levels = 3;
    const imgWidth = nodeToAddHover.width;
    const w = nodeToAddHover.width;
    while (levels > 0 && nodeToAddHover.parentNode && imgWidth >= nodeToAddHover.parentNode.offsetWidth) {
      console.log("imgWidth offsetWidth",imgWidth," parentNode.offsetWidth ", nodeToAddHover.parentNode.offsetWidth)
      nodeToAddHover = nodeToAddHover.parentNode;
      console.log("w ",w," parentNode w ", nodeToAddHover.width)
      if (nodeToAddHover.tagName && nodeToAddHover.tagName.toLowerCase() == 'picture') {
        levels++;
      }
      levels--;
    }

  parentNode = imgNode.parentNode;
  if(freeTheme && currentPage == "Home")
  {
    nodeToAddHover.appendChild(newDiv);
  }
  else
  {
    parentNode.appendChild(newDiv);
  }
  if (isHoverEnabled) {
    nodeToAddHover.classList.add("tag-hover") 
    if (nodeToAddHover.parentNode.classList.contains('card--media')) {
      nodeToAddHover.parentNode.classList.add("tag-hover")
    }
  }
  
}
