var refresh = document.getElementById('refresh');
var urlInput = document.getElementById('basic-url');

// amazon api request information
var x_rapidapi_host = 'amazon-product-reviews-keywords.p.rapidapi.com';
var x_rapidapi_key = 'c3a7f7f8a9msh520a129aada3ac0p115dbfjsn6cc0487c3120';
var baseUrl = 'https://amazon-product-reviews-keywords.p.rapidapi.com/';
var productDetailsUrl = baseUrl + 'product/details';
var productSearchUrl = baseUrl + 'product/search';
var productReviewsUrl = baseUrl + 'product/reviews';
var productCategoriesUrl = baseUrl + 'categories';
var shopLocation = 'US';
var splitIndex = 5;

// product details
var urlInputStr;
var asinID;
var category;
var keyword;
var basedProductInfo;
var basedProductVector;
var relatedProductList;

refresh.addEventListener('click', async function() {
    urlInputStr = urlInput.value;

    // get ASIN ID & its details
    asinID = urlInputStr.split('/')[splitIndex];
    await getProductDetails(asinID, shopLocation)
    .then(data => basedProductInfo = data)
    .catch(err => console.log(err));
    console.log(basedProductInfo);

    // extract product's eigenvalues => eigenvector 
    await getRelatedProductList(category, shopLocation, keyword)
    .then(data => relatedProductList = data)
    .catch(err => console.log(err));
});

// http request sender
function productRequest(resolve, reject, url) {
    // create httpRequest model
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.onreadystatechange = function() {
        if (this.readyState === this.DONE) {
            if (this.status >= 200 && this.status < 300) {
                let data = JSON.parse(this.responseText);
                resolve(data);
            } else {
                reject({
                    status: this.status,
                    statusText: this.statusText
                });
            }
        }
    };
    xhr.onerror = function() {
        reject({
            status: this.status,
            statusText: this.statusText
        });
    };

    // send product details request 
    xhr.open('GET', url);
    xhr.setRequestHeader('content-type', 'application/json');
    xhr.setRequestHeader('x-rapidapi-host', x_rapidapi_host);
    xhr.setRequestHeader('x-rapidapi-key', x_rapidapi_key);
    xhr.send();
}

/**
 * Feature Parameters: ['brand', 'salePrice', 'score', 'title']
 * Country: 'JP'
 */
function getProductDetails(asinID, country) {
    return new Promise(function(resolve, reject) {
        let url = productDetailsUrl + '?country=' + country + '&asin=' + asinID;
        productRequest(resolve, reject, url);
    });
}

function getRelatedProductList(category, country, keyword, page=1) {
    return new Promise(function(resolve, reject) {
        let url = productSearchUrl + '?page=' + page + '&category=' + category + '&country=' + country + '&keyword=' + keyword;
        productRequest(resolve, reject, url);
    });
}

function getProductEigenVector(productDetail) {

}
