


document.addEventListener('DOMContentLoaded', function () {
  bdgs_finditems();
  logMessage();
});




async function logMessage()
{
  try{
    const response = await fetch('https://lobster-app-ax5bs.ondigitalocean.app/app/api')
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
    const response = await fetch('https://lobster-app-ax5bs.ondigitalocean.app/app/api');
    
    console.log("Decode Json was called");
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const obj = await response.json();
    console.log('obj ', obj);
    return obj.data.data.products.edges;
  }
  catch (error) {
    console.error('There was a problem with the fetch operation:', error);
    return [];
  }
}

function addBadge(productDOM) {
  console.log("add badge was called");
  for (var idx = 0; idx < productDOM.length; idx++) {
    const imgTag = productDOM[idx].querySelectorAll('img');
    console.log('productDOM[idx] ', productDOM[idx]);
    my_badge(productDOM[idx]);
  }
}

function identifyProductfromReq() {
  decodeJson().then(edges => {
    for (let index = 0; index < edges.length; index++) {
      if (domMAP.has(edges[index].node.handle)) {
        console.log(
          'key ',
          edges[index].node.handle,
          ' value ',
          domMAP.get(edges[index].node.handle)
        );
        addBadge(domMAP.get(edges[index].node.handle));
      }
    }
    console.log("identifyProductfromReq was called and seems ok");
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
  console.log("bdgs function worked ok, about to call identify");
  identifyProductfromReq();
}

function my_badge(imgNode) {

  console.log("my badge was called")
  var newDiv = document.createElement('div');
  newDiv.className = 'product-image-container';
  var labelImage = document.createElement('div');
  labelImage.className = 'badge_itm';
  labelImage.style.backgroundColor = 'transparent';
  labelImage.style.backgroundSize = 'contain';
  labelImage.style.padding = '17%';
  labelImage.style.backgroundImage =
    "url('https://cdn.shopify.com/s/files/1/0858/1470/6469/files/offer-10290_256.gif?v=1710331271')";
  labelImage.style.display = 'block';
  labelImage.style.position = 'absolute';
  labelImage.style.zIndex = '100px';
  labelImage.style.borderRadius = '0px';
  newDiv.appendChild(labelImage);
  var parentNode = imgNode.parentNode;
  parentNode.appendChild(newDiv);
}
