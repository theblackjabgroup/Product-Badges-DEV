document.addEventListener('DOMContentLoaded', function () {
    bdgs_finditems();
    logMessage();
  });
   
  async function logMessage()
  {
    try{
      const response = await fetch('https://tc-correction-clear-atlanta.trycloudflare.com/app/mapping')
      const obj = await response.json();
      console.log("Response recieved from App", obj);
    }
    catch (error) {    
      console.error('There was a problem in logMessage', error);
    }
  }
  async function decodeJson() {
    try {
      // Make an HTTP GET request to the server-side endpoint
      const response = await fetch('https://tc-correction-clear-atlanta.trycloudflare.com/app/mapping');
  
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
  
  function addBadge(productDOM, badgeUrl, displayPosition) {
    for (var idx = 0; idx < productDOM.length; idx++) {
      const imgTag = productDOM[idx].querySelectorAll('img');
      console.log('productDOM[idx] ', productDOM[idx]);
      my_badge(productDOM[idx], badgeUrl, displayPosition);
    }
  }
  
  function removeParam(sourceURL) {
  // Create a new URL object
  const parsedUrl = new URL(sourceURL);
  parsedUrl.search = '';
  const urlWithoutParams = parsedUrl.toString();
  return urlWithoutParams;
  }
  
  function identifyProductfromReq() {
  // Get the current page URL
  const currentPageUrl = removeParam(window.location.href);
  console.log("urlWithoutParams ",currentPageUrl);
  let currentPage = "";
  // Check if the URL contains a specific path or query parameter indicating the page
  if (currentPageUrl.endsWith('/')) {
    currentPage = "Home"
  }
  else if (currentPageUrl.includes('/collections/')) {
    currentPage = "Collection"
  } else if (currentPageUrl.includes('/products/')) {
    currentPage = "Product"
  } else {
    currentPage = "All"
  }
    decodeJson().then(edges => {
      for (let index = 0; index < edges.length; index++) {
        if ((edges[index].displayPage == currentPage || edges[index].displayPage == "All") && edges[index].isEnabled == true && domMAP.has(edges[index].productHandle)) {
          console.log(
            'key ',
            edges[index].productHandle,
            ' value ',
            domMAP.get(edges[index].productHandle)
          );
          addBadge(domMAP.get(edges[index].productHandle),edges[index].badgeUrl, edges[index].displayPosition);
        }
      }
    }).catch(error => {
      console.error('Error fetching JSON in identifyProductfromReq:', error);
    });
  }
  
  
  const domMAP = new Map(); //map of product names and the closest img DOM array
  
  function bdgs_finditems() {
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
          break;
        }
        parentElement = parentElement.parentElement;
      }
      console.log('closestImg ', closestImgDOM);
      if (domMAP.has(productName)) {
        const domArray = domMAP.get(productName);
        domArray.push(closestImgDOM);
        domMAP.set(productName, domArray);
      } else {
        domMAP.set(productName, [closestImgDOM]);
      }
    }
    console.log("domMap ", domMAP);
    identifyProductfromReq();
  }
  
  class TopLeft{
  
  }
  
  function my_badge(imgNode,badgeUrl,displayPosition) {
    console.log("BAdgeurl ", badgeUrl)
    var newDiv = document.createElement('div');
    newDiv.className = 'product-image-container';
    var labelImage = document.createElement('div');
    labelImage.className = 'badge_itm';
    labelImage.style.display = 'block';
    var imgDiv = document.createElement('img');
    imgDiv.src = badgeUrl;
    imgDiv.style.width = '35%';
    imgDiv.style.zIndex = '2';
    imgDiv.style.position = "absolute";
    imgDiv.style.height = "auto";
    imgDiv.style.margin = "auto";
    if(displayPosition == "TopLeft") imgDiv.classList.add("top-left");
    if(displayPosition == "CenterLeft") imgDiv.classList.add("center-left");
    if(displayPosition == "BottomLeft") imgDiv.classList.add("bottom-left");
    if(displayPosition == "TopMiddle") imgDiv.classList.add("top-middle");
    if(displayPosition == "CenterMiddle") imgDiv.classList.add("center-middle");
    if(displayPosition == "BottomMiddle") imgDiv.classList.add("bottom-middle");
    if(displayPosition == "TopRight") imgDiv.classList.add("top-right");
    if(displayPosition == "MiddleRight") imgDiv.classList.add("middle-right");
    if(displayPosition == "BottomRight") imgDiv.classList.add("bottom-right");
    labelImage.append(imgDiv);
    newDiv.appendChild(labelImage);
    var parentNode = imgNode.parentNode;
    parentNode.appendChild(newDiv);
  }
  