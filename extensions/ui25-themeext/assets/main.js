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
    return obj.data;
  }
  catch (error) {
    console.error('There was a problem with the fetch operation:', error);
    return [];
  }
}

function isChildOfCartDrawer(element) {
  const drawerRegex = /.*[dD]rawer.*/;
  const cartRegex = /.*[cC]art.*/;

  while (element) {
    if (element.classList) {
      const classNames = Array.from(element.classList);
      const hasDrawer = classNames.some(className => drawerRegex.test(className));
      const hasCart = classNames.some(className => cartRegex.test(className));
      
      if (hasDrawer && hasCart) {
        return true;
      }
    }
    element = element.parentElement;
  }
  return false;
}

function addBadge(productDOM, badgeUrl, displayPosition, isHoverEnabled, currentPage) {
  for (var idx = 0; idx < productDOM.length; idx++) {
    if (productDOM[idx]) {
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
  let currentPage = "";
  // Check if the URL contains a specific path or query parameter indicating the page
  if (currentPageUrl.urlWithoutParams.endsWith('/')) {
    currentPage = "Home"
  }
  else if (location.href.indexOf("products") != -1) {
    currentPage = "Product"
  }
  else if (location.href.indexOf("collection") != -1 || location.href.indexOf("collections") != -1) {
    currentPage = "Collection";
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
      for (let d = 0; d < displayPageArr.length; d++) {
        if ((displayPageArr[d] == currentPage || displayPageArr[d] == "All") && edges[index].isEnabled == true && domMAP.has(edges[index].productHandle)) {
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

 function getVisibleImgs()
{
  const visibleImages = [];

  // Callback function for IntersectionObserver
  function handleIntersection(entries, observer) {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              // The img is visible
              visibleImages.push(entry);
              // Optionally, stop observing once it's visible
              observer.unobserve(entry.target);
          }
      });
  }

  // Create an IntersectionObserver instance
  const observer = new IntersectionObserver(handleIntersection, {
      root: null, // Default is the viewport
      rootMargin: '0px',
      threshold: 0.1 // Adjust as needed (0.1 means 10% of the img needs to be visible)
  });

  document.querySelectorAll('img').forEach(img => {
    observer.observe(img);
});

return visibleImages;
}

function checkVisible(elm) {
  var rect = elm.getBoundingClientRect();
  return rect.bottom > 0
 // return (rect.bottom < 0 || rect.top - viewHeight >= 0);
}


async function bdgs_finditems() {
  await sleep(2000);

  for (
    anchorTags = document.querySelectorAll(
      'a[href*="/products/"]:not([href*=".jp"]):not([href*=".JP"]):not([href*=".png"]):not([href*=".PNG"]):not([href*="facebook.com"]):not([href*="twitter.com"]):not([href*="pinterest.com"]):not([href*="mailto:"])'
    ),
    itr = 0;
    itr < anchorTags.length;
    itr++
  ) {
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
          if (card__inner.classList.contains('card__inner')) {
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
    if (domMAP.has(productName)) {
      const domArray = domMAP.get(productName);
      if (!domArray.includes(closestImgDOM)) {
        if (isChildOfCartDrawer(closestImgDOM)) {
        }
        else {
          domArray.push(closestImgDOM);
        }
      }
      domMAP.set(productName, domArray);
    } else {
      if (isChildOfCartDrawer(closestImgDOM)) {
      }
      else {
        domMAP.set(productName, [closestImgDOM]);
      }
    }
  }
  const currentPageUrl = removeParam(window.location.href);
  const parsedUrl = new URL(currentPageUrl.urlWithoutParams);

  const segments = parsedUrl.pathname.split('/');
  const productNameInProductPage = segments.filter(segment => segment).pop();

  if (location.href.indexOf("products") != -1);
  {
    //const visibleImages = await getVisibleImgs();
    var imgTags = document.querySelectorAll('img[src*="/products/"]:not([class*="not-abel"]), img[data-src*="/products/"]:not([class*="not-label"]), img[src*="/no-image"], img[data-src*="/no-image"], img[src*="/products/"], img[srcset*="/products/"][srcset*="/cdn.shopify.com/s/files/"], img[src*="/cdn.shopify.com/s/files/"], source[data-srcset*="/products/"],  source[data-srcset*="/cdn.shopify.com/s/files/"], source[data-srcset*="/cdn/shop/files/"],  img[data-srcset*="/cdn.shopify.com/s/files/"],  img[src*="/product_img/"],  img[src*="/cdn/shop/files/"],  img[srcset*="/cdn/shop/files/"], img[srcset*="/cdn/shop/products/"], [style*="/products/"], img[src*="%2Fproducts%2F"]');
    var imgArray = Array.from(imgTags);

    // Filter out elements with srcset attribute starting with "data.*"
    var filteredImgArray = imgArray.filter(function (img) {
      return !(img.srcset && img.srcset.startsWith('data'));
    });
    // If you need the result back as a NodeList
    var filteredImgTags = document.createDocumentFragment();
    filteredImgArray.forEach(function (img) {
      filteredImgTags.appendChild(img.cloneNode(true));
    });
    imgTags = filteredImgArray;
    widestImgTag = imgTags[0];
    if (imgTags.length > 0) {
      for (itr = 0; itr < imgTags.length; itr++) {
      if (checkVisible(imgTags[itr]) && imgTags[itr].width > widestImgTag.width) {
          widestImgTag = imgTags[itr];
        }
      }
    }

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
  identifyProductfromReq();
}

function nearestCardContentfun(imgNode) {
  var currentElement = imgNode;

  while (currentElement) {
      // Check previous siblings
      let prev = currentElement.previousElementSibling;
      while (prev) {
          if (prev.classList.contains('card__content')) {
              return prev;
          }
          prev = prev.previousElementSibling;
      }

      // Check next siblings
      let next = currentElement.nextElementSibling;
      while (next) {
          if (next.classList.contains('card__content')) {
              return next;
          }
          next = next.nextElementSibling;
      }

      // Move to parent and check siblings of the parent
      currentElement = currentElement.parentElement;
  }
  return null;
}

function my_badge(imgNode, badgeUrl, displayPosition, isHoverEnabled, currentPage) {
  var newDiv = document.createElement('div');
  newDiv.className = 'product-image-container';
  newDiv.classList.add("pl-collection");
  var upperDiv = document.createElement('div');
  upperDiv.className = 'img-blwrapper';
  upperDiv.classList.add("pl-image");
  var imgDiv = document.createElement('img');
  imgDiv.classList.add("img-tag");
  imgDiv.src = badgeUrl;
  if (displayPosition == "top-left") upperDiv.classList.add("top-left");
  if (displayPosition == "middle-left") upperDiv.classList.add("center-left");
  if (displayPosition == "bottom-left") upperDiv.classList.add("bottom-left");
  if (displayPosition == "top-center") upperDiv.classList.add("top-middle");
  if (displayPosition == "middle-center") upperDiv.classList.add("center-middle");
  if (displayPosition == "bottom-center") upperDiv.classList.add("bottom-middle");
  if (displayPosition == "top-right") upperDiv.classList.add("top-right");
  if (displayPosition == "middle-right") upperDiv.classList.add("middle-right");
  if (displayPosition == "bottom-right") upperDiv.classList.add("bottom-right");

  newDiv.appendChild(upperDiv);
  upperDiv.appendChild(imgDiv);

  var parentNode;
  var nodeToAddHover = imgNode;

  let levels = 3;
  const imgWidth = nodeToAddHover.width;

  upperDiv.style.width = 0.35 * imgWidth + 'px';
  while (levels > 0 && nodeToAddHover.parentNode && imgWidth + 10 >= nodeToAddHover.parentNode.offsetWidth) {
    nodeToAddHover = nodeToAddHover.parentNode;
    if (nodeToAddHover.tagName && nodeToAddHover.tagName.toLowerCase() == 'picture') {
      levels++;
    }
    levels--;
  }

  let divNode = imgNode.parentNode;
  while (divNode.tagName.toLowerCase() != "div") {
    divNode = divNode.parentNode;
  }

  if (currentPage == "Cart") {
    const divNodeDimensions = divNode.getBoundingClientRect();
    const imgNodeDimensions = imgNode.getBoundingClientRect();
    const remHeight = divNodeDimensions.height - imgNodeDimensions.height;
    const remWidth = divNodeDimensions.width - imgNodeDimensions.width;

    if (divNodeDimensions.top < imgNodeDimensions.top) {
      if (imgDiv.classList.contains("top-left") || imgDiv.classList.contains("top-right") || imgDiv.classList.contains("top-middle")) {
        imgDiv.style.setProperty('top', remHeight + 'px', 'important');
      }
    }
    else if (divNodeDimensions.bottom > imgNodeDimensions.bottom) {
      if (imgDiv.classList.contains("bottom-left") || imgDiv.classList.contains("bottom-right") || imgDiv.classList.contains("bottom-middle")) {
        imgDiv.style.setProperty('bottom', remHeight + 'px', 'important');
      }
    }

    if (divNodeDimensions.left < imgNodeDimensions.left) {
      if (imgDiv.classList.contains("top-left") || imgDiv.classList.contains("center-left") || imgDiv.classList.contains("bottom-left")) {
        imgDiv.style.setProperty('left', remWidth + 'px', 'important');
      }
    }
    else if (divNodeDimensions.right > imgNodeDimensions.right) {
      if (imgDiv.classList.contains("top-right") || imgDiv.classList.contains("center-right") || imgDiv.classList.contains("bottom-right")) {
        imgDiv.style.setProperty('right', remWidth + 'px', 'important');
      }
    }
  }
  parentNode = imgNode.parentNode;
  var nearestCardContent = nearestCardContentfun(imgNode);
  if (freeTheme && (currentPage == "Home" || currentPage == "Search" || currentPage == "Collection")) {
    nearestCardContent.appendChild(newDiv);
  }
  else {
    parentNode.appendChild(newDiv);   
    var addWrapperNode = parentNode;
    while (addWrapperNode.tagName.toLowerCase() != "div") {
      addWrapperNode = addWrapperNode.parentNode;
    }
    //addWrapperNode.classList.add("img-blwrapper");
  }
  if (isHoverEnabled) {
    nodeToAddHover.classList.add("tag-hover")
    if (nodeToAddHover.parentNode.classList.contains('card--media')) {
      nodeToAddHover.parentNode.classList.add("tag-hover")
    }
  }
 }
